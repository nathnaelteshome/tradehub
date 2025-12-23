import { getMySales, updateOrderStatus } from '@/actions/orders'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatPrice, formatDate } from '@/lib/utils'
import { ORDER_STATUSES } from '@/lib/constants'
import { DollarSign } from 'lucide-react'
import { revalidatePath } from 'next/cache'

async function handleStatusChange(orderId: string, formData: FormData) {
  'use server'
  const status = formData.get('status') as string
  await updateOrderStatus(orderId, status)
  revalidatePath('/dashboard/sales')
}

export default async function SalesPage() {
  const orders = await getMySales()

  if (orders.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">My Sales</h1>
        <div className="text-center py-12">
          <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No sales yet</h2>
          <p className="text-muted-foreground">
            When customers purchase your products, orders will appear here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Sales</h1>

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
                    <span className="text-muted-foreground">Buyer</span>
                    <span>{order.buyer?.name}</span>
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

                {/* Order Items */}
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Items:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {order.order_items.map((item: any) => (
                      <li key={item.id}>
                        {item.product?.title || 'Deleted product'} x {item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Update Status */}
                {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                  <div className="mt-4 pt-4 border-t">
                    <form action={handleStatusChange.bind(null, order.id)}>
                      <div className="flex gap-2">
                        <Select name="status" defaultValue={order.status}>
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ORDER_STATUSES.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button type="submit">Update</Button>
                      </div>
                    </form>
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
