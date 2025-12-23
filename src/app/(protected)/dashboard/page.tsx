import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, ShoppingBag, DollarSign, AlertTriangle } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get stats
  const [productsResult, ordersResult, salesResult, disputesResult] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact' }).eq('seller_id', user!.id),
    supabase.from('orders').select('id, total_amount', { count: 'exact' }).eq('buyer_id', user!.id),
    supabase.from('orders').select('id, total_amount', { count: 'exact' }).eq('seller_id', user!.id),
    supabase.from('disputes').select('id', { count: 'exact' }).eq('opened_by_id', user!.id).eq('status', 'OPEN'),
  ])

  const totalProducts = productsResult.count || 0
  const totalOrders = ordersResult.count || 0
  const totalSales = salesResult.count || 0
  const salesData = salesResult.data as { total_amount: number }[] | null
  const salesRevenue = salesData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0
  const openDisputes = disputesResult.count || 0

  const stats = [
    {
      title: 'My Products',
      value: totalProducts.toString(),
      icon: Package,
      description: 'Active listings'
    },
    {
      title: 'My Orders',
      value: totalOrders.toString(),
      icon: ShoppingBag,
      description: 'Total purchases'
    },
    {
      title: 'My Sales',
      value: formatPrice(salesRevenue),
      icon: DollarSign,
      description: `${totalSales} orders`
    },
    {
      title: 'Open Disputes',
      value: openDisputes.toString(),
      icon: AlertTriangle,
      description: 'Needs attention'
    },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
