import { notFound } from 'next/navigation'
import { getDispute, sendDisputeMessage } from '@/actions/disputes'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate, formatDateTime, getInitials, formatPrice } from '@/lib/utils'
import { DISPUTE_STATUSES } from '@/lib/constants'
import { MessageForm } from '@/components/disputes/message-form'

interface DisputeDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function DisputeDetailPage({ params }: DisputeDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  try {
    const dispute = await getDispute(id)

    if (!dispute) {
      notFound()
    }

    const statusInfo = DISPUTE_STATUSES.find(s => s.value === dispute.status)
    const sendMessageWithId = sendDisputeMessage.bind(null, id)

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dispute Details</h1>
          <Badge variant={dispute.status === 'OPEN' ? 'destructive' : 'secondary'}>
            {statusInfo?.label || dispute.status}
          </Badge>
        </div>

        {/* Order Info */}
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Number</span>
              <span className="font-mono">{dispute.order?.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Amount</span>
              <span>{formatPrice(dispute.order?.total_amount || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Buyer</span>
              <span>{dispute.order?.buyer?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Seller</span>
              <span>{dispute.order?.seller?.name}</span>
            </div>
          </CardContent>
        </Card>

        {/* Dispute Info */}
        <Card>
          <CardHeader>
            <CardTitle>Dispute Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reason</span>
              <span>{dispute.reason}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Opened By</span>
              <span>{dispute.opened_by?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Opened On</span>
              <span>{formatDate(dispute.created_at)}</span>
            </div>
            {dispute.resolution && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Resolution:</p>
                <p className="text-sm">{dispute.resolution}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Messages */}
        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent>
            {dispute.dispute_messages && dispute.dispute_messages.length > 0 ? (
              <div className="space-y-4">
                {dispute.dispute_messages.map((message: { id: string; content: string; created_at: string; author_id: string; author?: { name?: string; avatar_url?: string; role?: string } }) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.author_id === user?.id ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.author?.avatar_url || undefined} />
                      <AvatarFallback>
                        {getInitials(message.author?.name || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`flex-1 max-w-[80%] ${
                        message.author_id === user?.id ? 'text-right' : ''
                      }`}
                    >
                      <div
                        className={`inline-block p-3 rounded-lg ${
                          message.author_id === user?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {message.author?.name} • {formatDateTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No messages yet. Start the conversation below.
              </p>
            )}

            {/* Message Form */}
            {dispute.status === 'OPEN' || dispute.status === 'UNDER_REVIEW' ? (
              <div className="mt-6 pt-6 border-t">
                <MessageForm action={sendMessageWithId} />
              </div>
            ) : (
              <div className="mt-6 pt-6 border-t text-center text-muted-foreground">
                This dispute has been closed.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  } catch {
    notFound()
  }
}
