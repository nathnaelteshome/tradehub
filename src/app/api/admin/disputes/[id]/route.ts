import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '../../../_lib/auth'
import { successResponse, errorResponse } from '../../../_lib/response'
import type { DisputeDetail } from '@/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin()
    const { id } = await params
    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from('disputes')
      .select(
        `
        *,
        order:orders(*, buyer:profiles!buyer_id(*), seller:profiles!seller_id(*)),
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

    // Sort messages by created_at
    if (data.dispute_messages?.length) {
      data.dispute_messages.sort(
        (a: { created_at: string }, b: { created_at: string }) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    }

    return successResponse(data, 'Dispute fetched successfully')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (message === 'Not authenticated' || message === 'Admin access required') {
      return errorResponse(message, 'Unauthorized', message === 'Not authenticated' ? 401 : 403)
    }
    return errorResponse(message, 'Failed to fetch dispute', 500)
  }
}
