import Link from 'next/link'
import { getMyDisputes } from '@/actions/disputes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { DISPUTE_STATUSES } from '@/lib/constants'
import { AlertTriangle, ArrowRight } from 'lucide-react'

export default async function DisputesPage() {
  const disputes = await getMyDisputes()

  if (disputes.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Disputes</h1>
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No disputes</h2>
          <p className="text-muted-foreground">
            You don&apos;t have any open or past disputes.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Disputes</h1>

      <div className="space-y-4">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {disputes.map((dispute: any) => {
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
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Reason</span>
                    <span>{dispute.reason}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Opened</span>
                    <span>{formatDate(dispute.created_at)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Between</span>
                    <span>
                      {dispute.order?.buyer?.name} & {dispute.order?.seller?.name}
                    </span>
                  </div>
                  {dispute.resolution && (
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">Resolution:</p>
                      <p className="text-sm text-muted-foreground">{dispute.resolution}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/disputes/${dispute.id}`}>
                      View Details
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
