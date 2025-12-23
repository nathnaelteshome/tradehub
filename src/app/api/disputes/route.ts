import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthUser } from '../_lib/auth'
import { successResponse, errorResponse } from '../_lib/response'
import { z } from 'zod'
import type { DisputeDetail } from '@/types'

const disputeSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  reason: z.string().min(3, 'Reason must be at least 3 characters'),
})

export async function GET() {
  try {
    const { user, error: authError } = await getAuthUser()
    if (authError || !user) {
      return errorResponse(authError || 'Unauthorized', 'Authentication required', 401)
    }

    const supabase = await createClient()

    // Get disputes where user is buyer or seller of the order
    const { data, error } = await supabase
      .from('disputes')
      .select(
        `
        *,
        order:orders!inner(*, buyer:profiles!buyer_id(*), seller:profiles!seller_id(*)),
        opened_by:profiles!opened_by_id(*)
      `
      )
      .order('created_at', { ascending: false })

    if (error) {
      return errorResponse(error.message, 'Failed to fetch disputes', 500)
    }

    // Filter disputes where user is involved
    const disputes = (data ?? []) as unknown as DisputeDetail[]
    const userDisputes = disputes.filter(
      (dispute) =>
        dispute.opened_by_id === user.id ||
        dispute.order.buyer_id === user.id ||
        dispute.order.seller_id === user.id
    )

    return successResponse(userDisputes, 'Disputes fetched successfully')
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      'Failed to fetch disputes',
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
    const validated = disputeSchema.safeParse(body)

    if (!validated.success) {
      return errorResponse(validated.error.issues[0].message, 'Validation failed', 400)
    }

    const { orderId, reason } = validated.data
    const supabase = await createClient()

    // Check if order exists and user is buyer
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, buyer_id, status')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return errorResponse('Order not found', 'Order not found', 404)
    }

    if (order.buyer_id !== user.id) {
      return errorResponse('Only buyers can open disputes', 'Not authorized', 403)
    }

    if (order.status !== 'DELIVERED') {
      return errorResponse(
        'Disputes can only be opened for delivered orders',
        'Invalid order status',
        400
      )
    }

    // Check if dispute already exists
    const { data: existingDispute } = await supabase
      .from('disputes')
      .select('id')
      .eq('order_id', orderId)
      .single()

    if (existingDispute) {
      return errorResponse('A dispute already exists for this order', 'Duplicate dispute', 400)
    }

    // Create dispute
    const { data, error } = await supabase
      .from('disputes')
      .insert({
        order_id: orderId,
        opened_by_id: user.id,
        reason,
      })
      .select()
      .single()

    if (error) {
      return errorResponse(error.message, 'Failed to create dispute', 500)
    }

    return successResponse(data, 'Dispute created successfully', 201)
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      'Failed to create dispute',
      500
    )
  }
}
