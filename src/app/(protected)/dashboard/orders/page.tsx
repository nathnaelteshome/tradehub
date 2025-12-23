import { getMyOrders } from '@/actions/orders'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate } from '@/lib/utils'
import { ORDER_STATUSES } from '@/lib/constants'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

export default async function OrdersPage() {
  const orders = await getMyOrders()

  if (orders.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <div className="text-center py-12">
          <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
          <p className="text-muted-foreground">
            When you purchase items, they will appear here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="space-y-4">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {orders.map((order: any) => {
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
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span>{formatDate(order.created_at)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Seller</span>
                    <span>{order.seller?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items</span>
                    <span>{order.order_items.length} item(s)</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(order.total_amount)}</span>
                  </div>
                </div>
                {order.status === 'DELIVERED' && (
                  <div className="mt-4 pt-4 border-t">
                    <Link
                      href={`/dashboard/disputes?order=${order.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Have an issue? Open a dispute
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
