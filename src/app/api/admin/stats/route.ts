import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '../../_lib/auth'
import { successResponse, errorResponse } from '../../_lib/response'

export async function GET() {
  try {
    await requireAdmin()
    const adminClient = createAdminClient()

    const [usersResult, productsResult, ordersResult, disputesResult] = await Promise.all([
      adminClient.from('profiles').select('id', { count: 'exact' }),
      adminClient.from('products').select('id', { count: 'exact' }),
      adminClient.from('orders').select('id, total_amount', { count: 'exact' }),
      adminClient.from('disputes').select('id', { count: 'exact' }).in('status', ['OPEN', 'UNDER_REVIEW']),
    ])

    const orders = ordersResult.data as { total_amount: number }[] | null
    const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0

    return successResponse(
      {
        totalUsers: usersResult.count || 0,
        totalProducts: productsResult.count || 0,
        totalOrders: ordersResult.count || 0,
        totalRevenue,
        openDisputes: disputesResult.count || 0,
      },
      'Stats fetched successfully'
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (message === 'Not authenticated' || message === 'Admin access required') {
      return errorResponse(message, 'Unauthorized', message === 'Not authenticated' ? 401 : 403)
    }
    return errorResponse(message, 'Failed to fetch stats', 500)
  }
}
