import { notFound, redirect } from 'next/navigation'
import { getAdminDispute, resolveDispute, sendAdminDisputeMessage } from '@/actions/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate, formatDateTime, getInitials, formatPrice } from '@/lib/utils'
import { DISPUTE_STATUSES } from '@/lib/constants'
import { revalidatePath } from 'next/cache'

interface DisputeDetailPageProps {
  params: Promise<{ id: string }>
}

async function handleResolve(disputeId: string, formData: FormData) {
  'use server'
  const status = formData.get('status') as string
  const resolution = formData.get('resolution') as string

  await resolveDispute(disputeId, status, resolution)
  revalidatePath(`/admin/disputes/${disputeId}`)
  redirect('/admin/disputes')
}

async function handleSendMessage(disputeId: string, formData: FormData) {
  'use server'
  const content = formData.get('content') as string
  await sendAdminDisputeMessage(disputeId, content)
  revalidatePath(`/admin/disputes/${disputeId}`)
}

export default async function AdminDisputeDetailPage({ params }: DisputeDetailPageProps) {
  const { id } = await params

  try {
    const dispute = await getAdminDispute(id)

    if (!dispute) {
      notFound()
    }

    const statusInfo = DISPUTE_STATUSES.find(s => s.value === dispute.status)
    const resolveWithId = handleResolve.bind(null, id)
    const sendMessageWithId = handleSendMessage.bind(null, id)

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dispute Resolution</h1>
          <Badge variant={dispute.status === 'OPEN' ? 'destructive' : 'secondary'}>
            {statusInfo?.label || dispute.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column - Info */}
          <div className="space-y-6">
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
                  <span className="text-muted-foreground">Order Status</span>
                  <span>{dispute.order?.status}</span>
                </div>
              </CardContent>
            </Card>

            {/* Parties */}
            <Card>
              <CardHeader>
                <CardTitle>Parties Involved</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={dispute.order?.buyer?.avatar_url || undefined} />
                      <AvatarFallback>{getInitials(dispute.order?.buyer?.name || '')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{dispute.order?.buyer?.name}</p>
                      <p className="text-xs text-muted-foreground">{dispute.order?.buyer?.email}</p>
                    </div>
                  </div>
                  <Badge variant="outline">Buyer</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={dispute.order?.seller?.avatar_url || undefined} />
                      <AvatarFallback>{getInitials(dispute.order?.seller?.name || '')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{dispute.order?.seller?.name}</p>
                      <p className="text-xs text-muted-foreground">{dispute.order?.seller?.email}</p>
                    </div>
                  </div>
                  <Badge variant="outline">Seller</Badge>
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
              </CardContent>
            </Card>

            {/* Resolution Form */}
            {(dispute.status === 'OPEN' || dispute.status === 'UNDER_REVIEW') && (
              <Card>
                <CardHeader>
                  <CardTitle>Resolve Dispute</CardTitle>
                </CardHeader>
                <CardContent>
                  <form action={resolveWithId} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Resolution</Label>
                      <Select name="status" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select resolution" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                          <SelectItem value="RESOLVED_BUYER_FAVOR">Resolve in Buyer&apos;s Favor</SelectItem>
                          <SelectItem value="RESOLVED_SELLER_FAVOR">Resolve in Seller&apos;s Favor</SelectItem>
                          <SelectItem value="CLOSED">Close Without Resolution</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="resolution">Resolution Notes</Label>
                      <Textarea
                        id="resolution"
                        name="resolution"
                        placeholder="Explain the resolution..."
                        rows={3}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Submit Resolution
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column - Messages */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Message History</CardTitle>
            </CardHeader>
            <CardContent>
              {dispute.dispute_messages && dispute.dispute_messages.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {dispute.dispute_messages.map((message: { id: string; content: string; created_at: string; author?: { name?: string; avatar_url?: string; role?: string } }) => (
                    <div key={message.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.author?.avatar_url || undefined} />
                        <AvatarFallback>
                          {getInitials(message.author?.name || '')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{message.author?.name}</p>
                          {message.author?.role === 'ADMIN' && (
                            <Badge variant="secondary" className="text-xs">Admin</Badge>
                          )}
                        </div>
                        <p className="text-sm mt-1 bg-muted p-2 rounded-lg">
                          {message.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDateTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No messages yet.
                </p>
              )}

              {/* Admin Message Form */}
              {dispute.status !== 'CLOSED' && !dispute.status.startsWith('RESOLVED') && (
                <form action={sendMessageWithId} className="mt-6 pt-6 border-t">
                  <div className="space-y-2">
                    <Textarea
                      name="content"
                      placeholder="Send a message as admin..."
                      rows={2}
                      required
                    />
                    <Button type="submit" size="sm">
                      Send Message
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } catch {
    notFound()
  }
}
