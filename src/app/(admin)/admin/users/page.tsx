import { getAllUsers, suspendUser, setUserRole } from '@/actions/admin'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate, getInitials } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

interface UsersPageProps {
  searchParams: Promise<{ page?: string }>
}

async function handleSuspend(userId: string, suspended: boolean) {
  'use server'
  await suspendUser(userId, suspended)
  revalidatePath('/admin/users')
}

async function handleRoleChange(userId: string, role: 'USER' | 'ADMIN') {
  'use server'
  await setUserRole(userId, role)
  revalidatePath('/admin/users')
}

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams
  const page = params.page ? Number(params.page) : 1
  const { users, total } = await getAllUsers(page)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">{total} total users</p>
      </div>

      <div className="space-y-4">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {users?.map((user: any) => (
          <Card key={user.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {formatDate(user.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                  {user.suspended && (
                    <Badge variant="destructive">Suspended</Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  {user.role === 'USER' ? (
                    <form action={handleRoleChange.bind(null, user.id, 'ADMIN')}>
                      <Button variant="outline" size="sm" type="submit">
                        Make Admin
                      </Button>
                    </form>
                  ) : (
                    <form action={handleRoleChange.bind(null, user.id, 'USER')}>
                      <Button variant="outline" size="sm" type="submit">
                        Remove Admin
                      </Button>
                    </form>
                  )}
                  {user.suspended ? (
                    <form action={handleSuspend.bind(null, user.id, false)}>
                      <Button variant="outline" size="sm" type="submit">
                        Unsuspend
                      </Button>
                    </form>
                  ) : (
                    <form action={handleSuspend.bind(null, user.id, true)}>
                      <Button variant="outline" size="sm" type="submit" className="text-destructive">
                        Suspend
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
