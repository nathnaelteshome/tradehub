import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '../../../_lib/auth'
import { successResponse, errorResponse } from '../../../_lib/response'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin()
    const { id: productId } = await params
    const adminClient = createAdminClient()

    // Check if product exists
    const { data: product, error: fetchError } = await adminClient
      .from('products')
      .select('id')
      .eq('id', productId)
      .single()

    if (fetchError || !product) {
      return errorResponse('Product not found', 'Product not found', 404)
    }

    const { error } = await adminClient.from('products').delete().eq('id', productId)

    if (error) {
      return errorResponse(error.message, 'Failed to delete product', 500)
    }

    return successResponse(null, 'Product deleted successfully')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (message === 'Not authenticated' || message === 'Admin access required') {
      return errorResponse(message, 'Unauthorized', message === 'Not authenticated' ? 401 : 403)
    }
    return errorResponse(message, 'Failed to delete product', 500)
  }
}
