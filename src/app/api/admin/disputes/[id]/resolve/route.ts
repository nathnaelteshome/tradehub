import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '../../../../_lib/auth'
import { successResponse, errorResponse } from '../../../../_lib/response'
import type { Database, DisputeStatus } from '@/types/database'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin()
    const { id: disputeId } = await params
    const adminClient = createAdminClient()

    const body = await request.json()
    const { status, resolution } = body

    const validStatuses: DisputeStatus[] = ['RESOLVED_BUYER_FAVOR', 'RESOLVED_SELLER_FAVOR', 'CLOSED']
    if (!validStatuses.includes(status)) {
      return errorResponse(
        'Invalid status. Must be RESOLVED_BUYER_FAVOR, RESOLVED_SELLER_FAVOR, or CLOSED',
        'Validation failed',
        400
      )
    }

    if (!resolution || typeof resolution !== 'string') {
      return errorResponse('Resolution message is required', 'Validation failed', 400)
    }

    // Check if dispute exists and is not already closed
    const { data: dispute, error: fetchError } = await adminClient
      .from('disputes')
      .select('id, status')
      .eq('id', disputeId)
      .single()

    if (fetchError || !dispute) {
      return errorResponse('Dispute not found', 'Dispute not found', 404)
    }

    const disputeData = dispute as { id: string; status: DisputeStatus }
    if (disputeData.status === 'CLOSED') {
      return errorResponse('Dispute is already closed', 'Invalid operation', 400)
    }

    const updatePayload: Database['public']['Tables']['disputes']['Update'] = {
      status: status as DisputeStatus,
      resolution,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (adminClient.from('disputes') as any)
      .update(updatePayload)
      .eq('id', disputeId)

    if (error) {
      return errorResponse(error.message, 'Failed to resolve dispute', 500)
    }

    return successResponse(null, 'Dispute resolved successfully')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (message === 'Not authenticated' || message === 'Admin access required') {
      return errorResponse(message, 'Unauthorized', message === 'Not authenticated' ? 401 : 403)
    }
    return errorResponse(message, 'Failed to resolve dispute', 500)
  }
}
