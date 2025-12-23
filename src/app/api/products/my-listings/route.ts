import { createClient } from '@/lib/supabase/server'
import { getAuthUser } from '../../_lib/auth'
import { successResponse, errorResponse } from '../../_lib/response'

export async function GET() {
  try {
    const { user, error: authError } = await getAuthUser()
    if (authError || !user) {
      return errorResponse(authError || 'Unauthorized', 'Authentication required', 401)
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return errorResponse(error.message, 'Failed to fetch products', 500)
    }

    return successResponse(data, 'Products fetched successfully')
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      'Failed to fetch products',
      500
    )
  }
}
