import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthUser } from '../../_lib/auth'
import { successResponse, errorResponse } from '../../_lib/response'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const { user, error: authError } = await getAuthUser()
    if (authError || !user) {
      return errorResponse(authError || 'Unauthorized', 'Authentication required', 401)
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('orders')
      .select(
        '*, order_items(*, product:products(*)), buyer:profiles!buyer_id(*), seller:profiles!seller_id(*)'
      )
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Order not found', 'Order not found', 404)
      }
      return errorResponse(error.message, 'Failed to fetch order', 500)
    }

    // Verify user is buyer or seller
    if (data.buyer_id !== user.id && data.seller_id !== user.id && user.role !== 'ADMIN') {
      return errorResponse('Not authorized', 'You can only view your own orders', 403)
    }

    return successResponse(data, 'Order fetched successfully')
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      'Failed to fetch order',
      500
    )
  }
}
