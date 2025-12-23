import Link from 'next/link'
import { getAllDisputes } from '@/actions/admin'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatPrice } from '@/lib/utils'
import { DISPUTE_STATUSES } from '@/lib/constants'
import { ArrowRight } from 'lucide-react'

interface DisputesPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function AdminDisputesPage({ searchParams }: DisputesPageProps) {
  const params = await searchParams
  const page = params.page ? Number(params.page) : 1
  const { disputes, total } = await getAllDisputes(page)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Disputes</h1>
        <p className="text-muted-foreground">{total} total disputes</p>
      </div>

      <div className="space-y-4">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {disputes?.map((dispute: any) => {
          const statusInfo = DISPUTE_STATUSES.find(s => s.value === dispute.status)
          return (
            <Card key={dispute.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <CardTitle className="text-base">
                    Order: {dispute.order?.order_number}
                  </CardTitle>
                  <Badge variant={dispute.status === 'OPEN' ? 'destructive' : 'secondary'}>
                    {statusInfo?.label || dispute.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block">Reason</span>
                    <span>{dispute.reason}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Opened By</span>
                    <span>{dispute.opened_by?.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Date</span>
                    <span>{formatDate(dispute.created_at)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Order Value</span>
                    <span className="font-semibold">{formatPrice(dispute.order?.total_amount || 0)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {dispute.order?.buyer?.name} vs {dispute.order?.seller?.name}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/disputes/${dispute.id}`}>
                      {dispute.status === 'OPEN' ? 'Resolve' : 'View'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
