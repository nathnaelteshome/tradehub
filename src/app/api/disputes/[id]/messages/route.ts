import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthUser } from '../../../_lib/auth'
import { successResponse, errorResponse } from '../../../_lib/response'
import { z } from 'zod'
import type { Database } from '@/types/database'

interface RouteParams {
  params: Promise<{ id: string }>
}

const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long'),
})

type DisputeOrderInfo = {
  id: string
  status: Database['public']['Tables']['disputes']['Row']['status']
  opened_by_id: string
  order: Pick<Database['public']['Tables']['orders']['Row'], 'buyer_id' | 'seller_id'>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: disputeId } = await params
    const { user, error: authError } = await getAuthUser()
    if (authError || !user) {
      return errorResponse(authError || 'Unauthorized', 'Authentication required', 401)
    }

    const body = await request.json()
    const validated = messageSchema.safeParse(body)

    if (!validated.success) {
      return errorResponse(validated.error.issues[0].message, 'Validation failed', 400)
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

    // Check if dispute exists and user is authorized
    const { data: dispute, error: disputeError } = await supabase
      .from('disputes')
      .select('id, status, opened_by_id, order:orders!inner(buyer_id, seller_id)')
      .eq('id', disputeId)
      .single<DisputeOrderInfo>()

    if (disputeError || !dispute) {
      return errorResponse('Dispute not found', 'Dispute not found', 404)
    }

    // Verify user is buyer, seller, or admin
    const order = dispute.order
    if (
      order.buyer_id !== profile.id &&
      order.seller_id !== profile.id &&
      user.role !== 'ADMIN'
    ) {
      return errorResponse('Not authorized', 'You cannot add messages to this dispute', 403)
    }

    // Check if dispute is closed
    if (dispute.status === 'CLOSED') {
      return errorResponse('Cannot add messages to a closed dispute', 'Dispute closed', 400)
    }

    // Add message
    const { data, error } = await supabase
      .from('dispute_messages')
      .insert({
        dispute_id: disputeId,
        author_id: profile.id,
        content: validated.data.content,
      })
      .select('*, author:profiles(*)')
      .single()

    if (error) {
      return errorResponse(error.message, 'Failed to send message', 500)
    }

    // Update dispute status to UNDER_REVIEW if it was OPEN
    if (dispute.status === 'OPEN') {
      await supabase.from('disputes').update({ status: 'UNDER_REVIEW' }).eq('id', disputeId)
    }

    return successResponse(data, 'Message sent successfully', 201)
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      'Failed to send message',
      500
    )
  }
}
