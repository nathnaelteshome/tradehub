import { getAllOrders } from '@/actions/admin'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice, formatDate } from '@/lib/utils'
import { ORDER_STATUSES } from '@/lib/constants'

interface OrdersPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams
  const page = params.page ? Number(params.page) : 1
  const { orders, total } = await getAllOrders(page)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">{total} total orders</p>
      </div>

      <div className="space-y-4">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {orders?.map((order: any) => {
          const statusInfo = ORDER_STATUSES.find(s => s.value === order.status)
          return (
            <Card key={order.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <CardTitle className="text-base font-mono">
                    {order.order_number}
                  </CardTitle>
                  <Badge variant="secondary" className={statusInfo?.color}>
                    {statusInfo?.label || order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block">Date</span>
                    <span>{formatDate(order.created_at)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Buyer</span>
                    <span>{order.buyer?.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Seller</span>
                    <span>{order.seller?.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Total</span>
                    <span className="font-semibold">{formatPrice(order.total_amount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
