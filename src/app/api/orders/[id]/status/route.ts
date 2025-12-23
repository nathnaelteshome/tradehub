import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthUser } from '../../../_lib/auth'
import { successResponse, errorResponse } from '../../../_lib/response'
import type { OrderStatus } from '@/types/database'

interface RouteParams {
  params: Promise<{ id: string }>
}

const validTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const { user, error: authError } = await getAuthUser()
    if (authError || !user) {
      return errorResponse(authError || 'Unauthorized', 'Authentication required', 401)
    }

    const body = await request.json()
    const { status } = body

    if (!status) {
      return errorResponse('Status is required', 'Validation failed', 400)
    }

    const validStatuses: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return errorResponse('Invalid status', 'Validation failed', 400)
    }

    const supabase = await createClient()

    // Get the order
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('seller_id, status')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return errorResponse('Order not found', 'Order not found', 404)
      }
      return errorResponse(fetchError.message, 'Failed to fetch order', 500)
    }

    // Verify user is the seller
    if (order.seller_id !== user.id && user.role !== 'ADMIN') {
      return errorResponse('Not authorized', 'Only the seller can update order status', 403)
    }

    // Validate status transition
    const currentStatus = order.status as OrderStatus
    if (!validTransitions[currentStatus].includes(status)) {
      return errorResponse(
        `Cannot change status from ${currentStatus} to ${status}`,
        'Invalid status transition',
        400
      )
    }

    // Update status
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return errorResponse(error.message, 'Failed to update order status', 500)
    }

    return successResponse(data, 'Order status updated successfully')
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      'Failed to update order status',
      500
    )
  }
}
