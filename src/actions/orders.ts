'use server'

import { createClient } from '@/lib/supabase/server'
import { shippingSchema } from '@/lib/validations/checkout'
import { revalidatePath } from 'next/cache'
import { generateOrderNumber } from '@/lib/utils'
import type { CartItem } from '@/types'

export async function createOrder(
  items: CartItem[],
  sellerId: string,
  shippingData: {
    fullName: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
    phone: string
  }
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const validated = shippingSchema.safeParse(shippingData)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const totalAmount = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

  // Create order
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: generateOrderNumber(),
      buyer_id: user.id,
      seller_id: sellerId,
      total_amount: totalAmount,
      shipping_address: validated.data
    } as never)
    .select()
    .single()

  if (orderError) {
    return { error: orderError.message }
  }

  const order = orderData as { id: string; order_number: string }

  // Create order items
  const orderItems = items.map(item => ({
    order_id: order.id,
    product_id: item.product.id,
    quantity: item.quantity,
    price: item.product.price
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems as never)

  if (itemsError) {
    // Rollback order if items fail
    await supabase.from('orders').delete().eq('id', order.id)
    return { error: itemsError.message }
  }

  // Update product quantities
  for (const item of items) {
    await supabase
      .from('products')
      .update({ quantity: item.product.quantity - item.quantity } as never)
      .eq('id', item.product.id)
  }

  revalidatePath('/dashboard/orders')
  revalidatePath('/dashboard/sales')

  return { success: true, orderId: order.id, orderNumber: order.order_number }
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('orders')
    .update({ status } as never)
    .eq('id', orderId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/orders')
  revalidatePath('/dashboard/sales')
  return { success: true }
}

export async function getMyOrders() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, product:products(*)), seller:profiles!seller_id(*)')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getMySales() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, product:products(*)), buyer:profiles!buyer_id(*)')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getOrder(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, product:products(*)), buyer:profiles!buyer_id(*), seller:profiles!seller_id(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}
