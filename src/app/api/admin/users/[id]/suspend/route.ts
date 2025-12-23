import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '../../../../_lib/auth'
import { successResponse, errorResponse } from '../../../../_lib/response'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin()
    const { id: userId } = await params
    const adminClient = createAdminClient()

    const body = await request.json()
    const { suspended } = body

    if (typeof suspended !== 'boolean') {
      return errorResponse('Invalid suspended value', 'Validation failed', 400)
    }

    // Check if user exists and is not an admin
    const { data: user, error: fetchError } = await adminClient
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
      .single()

    if (fetchError || !user) {
      return errorResponse('User not found', 'User not found', 404)
    }

    if (user.role === 'ADMIN') {
      return errorResponse('Cannot suspend admin users', 'Forbidden', 403)
    }

    const { error } = await adminClient.from('profiles').update({ suspended }).eq('id', userId)

    if (error) {
      return errorResponse(error.message, 'Failed to update user', 500)
    }

    return successResponse(null, `User ${suspended ? 'suspended' : 'unsuspended'} successfully`)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (message === 'Not authenticated' || message === 'Admin access required') {
      return errorResponse(message, 'Unauthorized', message === 'Not authenticated' ? 401 : 403)
    }
    return errorResponse(message, 'Failed to update user', 500)
  }
}
