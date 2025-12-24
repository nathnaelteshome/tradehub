import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthUser } from '../../_lib/auth'
import { successResponse, errorResponse } from '../../_lib/response'
import type { DisputeDetail } from '@/types'

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
      .from('disputes')
      .select(
        `
        *,
        order:orders!inner(*, buyer:profiles!buyer_id(*), seller:profiles!seller_id(*)),
        opened_by:profiles!opened_by_id(*),
        dispute_messages(*, author:profiles(*))
      `
      )
      .eq('id', id)
      .single<DisputeDetail>()

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Dispute not found', 'Dispute not found', 404)
      }
      return errorResponse(error.message, 'Failed to fetch dispute', 500)
    }
    if (!data) {
      return errorResponse('Dispute not found', 'Dispute not found', 404)
    }

    // Verify user is authorized (buyer, seller, or admin)
    if (
      data.order.buyer_id !== profile.id &&
      data.order.seller_id !== profile.id &&
      user.role !== 'ADMIN'
    ) {
      return errorResponse('Not authorized', 'You cannot view this dispute', 403)
    }

    // Sort messages by created_at
    if (data.dispute_messages) {
      data.dispute_messages.sort(
        (a: { created_at: string }, b: { created_at: string }) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    }

    return successResponse(data, 'Dispute fetched successfully')
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      'Failed to fetch dispute',
      500
    )
  }
}
