import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '../../../../_lib/auth'
import { successResponse, errorResponse } from '../../../../_lib/response'
import type { UserRole } from '@/types/database'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin()
    const { id: userId } = await params
    const adminClient = createAdminClient()

    const body = (await request.json()) as { role?: UserRole }
    const { role } = body

    const validRoles: UserRole[] = ['USER', 'ADMIN']
    if (!role) {
      return errorResponse('Role is required', 'Validation failed', 400)
    }
    if (!validRoles.includes(role)) {
      return errorResponse('Invalid role', 'Validation failed', 400)
    }

    // Check if user exists
    const { data: user, error: fetchError } = await adminClient
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (fetchError || !user) {
      return errorResponse('User not found', 'User not found', 404)
    }

    const { error } = await adminClient.from('profiles').update({ role }).eq('id', userId)

    if (error) {
      return errorResponse(error.message, 'Failed to update user role', 500)
    }

    return successResponse(null, `User role updated to ${role} successfully`)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (message === 'Not authenticated' || message === 'Admin access required') {
      return errorResponse(message, 'Unauthorized', message === 'Not authenticated' ? 401 : 403)
    }
    return errorResponse(message, 'Failed to update user role', 500)
  }
}
