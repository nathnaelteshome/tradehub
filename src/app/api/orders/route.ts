import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthUser } from '../_lib/auth'
import { successResponse, errorResponse } from '../_lib/response'
import { shippingSchema } from '@/lib/validations/checkout'
import { generateOrderNumber } from '@/lib/utils'
import { sendOrderConfirmationEmail } from '../_lib/email'

interface OrderItem {
  productId: string
  quantity: number
  price: number
  title: string
}

export async function GET() {
  try {
    const { user, error: authError } = await getAuthUser()
    if (authError || !user) {
      return errorResponse(authError || 'Unauthorized', 'Authentication required', 401)
    }

    const supabase = await createClient()

    // Get profile ID from user_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      return errorResponse('Profile not found', 'Profile required', 404)
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, product:products(*)), seller:profiles!seller_id(*)')
      .eq('buyer_id', profile.id)
      .order('created_at', { ascending: false })

    if (error) {
      return errorResponse(error.message, 'Failed to fetch orders', 500)
    }

    return successResponse(data, 'Orders fetched successfully')
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      'Failed to fetch orders',
      500
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthUser()
    if (authError || !user) {
      return errorResponse(authError || 'Unauthorized', 'Authentication required', 401)
    }

    const body = await request.json()
    const { items, sellerId, shippingData } = body

    // Validate shipping data
    const validatedShipping = shippingSchema.safeParse(shippingData)
    if (!validatedShipping.success) {
      return errorResponse(validatedShipping.error.issues[0].message, 'Validation failed', 400)
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse('Items are required', 'Validation failed', 400)
    }

    if (!sellerId) {
      return errorResponse('Seller ID is required', 'Validation failed', 400)
    }

    const supabase = await createClient()

    // Get profile ID from user_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      return errorResponse('Profile not found', 'Profile required', 404)
    }

    // Cannot buy from yourself
    if (sellerId === profile.id) {
      return errorResponse('Cannot purchase your own products', 'Validation failed', 400)
    }

    // Validate all products exist and are active
    const productIds = items.map((item: { productId: string }) => item.productId)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds)

    if (productsError) {
      return errorResponse(productsError.message, 'Failed to validate products', 500)
    }

    if (!products || products.length !== productIds.length) {
      return errorResponse('One or more products not found', 'Validation failed', 400)
    }

    // Check products are active and have sufficient quantity
    const orderItemsData: OrderItem[] = []
    let totalAmount = 0

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)
      if (!product) {
        return errorResponse(`Product not found: ${item.productId}`, 'Validation failed', 400)
      }
      if (!product.active) {
        return errorResponse(`Product is no longer available: ${product.title}`, 'Validation failed', 400)
      }
      if (product.quantity < item.quantity) {
        return errorResponse(
          `Insufficient quantity for: ${product.title}`,
          'Validation failed',
          400
        )
      }
      if (product.seller_id !== sellerId) {
        return errorResponse(
          'All products must be from the same seller',
          'Validation failed',
          400
        )
      }

      const itemTotal = product.price * item.quantity
      totalAmount += itemTotal
      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        title: product.title,
      })
    }

    // Create order
    const orderNumber = generateOrderNumber()
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        buyer_id: profile.id,
        seller_id: sellerId,
        total_amount: totalAmount,
        shipping_address: validatedShipping.data,
      })
      .select()
      .single()

    if (orderError) {
      return errorResponse(orderError.message, 'Failed to create order', 500)
    }

    // Create order items
    const orderItems = orderItemsData.map((item) => ({
      order_id: orderData.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

    if (itemsError) {
      // Rollback order
      await supabase.from('orders').delete().eq('id', orderData.id)
      return errorResponse(itemsError.message, 'Failed to create order items', 500)
    }

    // Update product quantities
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)!
      await supabase
        .from('products')
        .update({ quantity: product.quantity - item.quantity })
        .eq('id', item.productId)
    }

    // Get buyer profile for email
    const { data: buyerProfile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', profile.id)
      .single()

    // Send order confirmation email
    if (buyerProfile?.email) {
      await sendOrderConfirmationEmail(buyerProfile.email, {
        orderNumber,
        totalAmount: totalAmount.toFixed(2),
        items: orderItemsData.map((item) => ({
          title: item.title,
          quantity: item.quantity,
          price: item.price,
        })),
      })
    }

    return successResponse(
      { orderId: orderData.id, orderNumber },
      'Order created successfully',
      201
    )
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      'Failed to create order',
      500
    )
  }
}
