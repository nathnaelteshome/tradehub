import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '../../_lib/auth'
import { successResponse, errorResponse } from '../../_lib/response'
import { ITEMS_PER_PAGE } from '@/lib/constants'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    const adminClient = createAdminClient()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')

    const from = (page - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    const { data, error, count } = await adminClient
      .from('orders')
      .select('*, buyer:profiles!buyer_id(*), seller:profiles!seller_id(*), order_items(*)', {
        count: 'exact',
      })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      return errorResponse(error.message, 'Failed to fetch orders', 500)
    }

    return successResponse(
      {
        orders: data,
        pagination: {
          page,
          limit: ITEMS_PER_PAGE,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE),
        },
      },
      'Orders fetched successfully'
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (message === 'Not authenticated' || message === 'Admin access required') {
      return errorResponse(message, 'Unauthorized', message === 'Not authenticated' ? 401 : 403)
    }
    return errorResponse(message, 'Failed to fetch orders', 500)
  }
}
