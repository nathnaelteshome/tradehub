import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '../../_lib/response'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('products')
      .select('*, seller:profiles(*)')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(8)

    if (error) {
      return errorResponse(error.message, 'Failed to fetch featured products', 500)
    }

    return successResponse(data, 'Featured products fetched successfully')
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      'Failed to fetch featured products',
      500
    )
  }
}
