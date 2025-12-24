'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ITEMS_PER_PAGE } from '@/lib/constants'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single() as { data: { id: string; role: string } | null }

  if (profile?.role !== 'ADMIN') throw new Error('Forbidden')
  return { authUser: user, profileId: profile.id }
}

export async function getAdminStats() {
  await verifyAdmin()
  const adminClient = createAdminClient()

  const [usersResult, productsResult, ordersResult, disputesResult] = await Promise.all([
    adminClient.from('profiles').select('id', { count: 'exact' }),
    adminClient.from('products').select('id', { count: 'exact' }),
    adminClient.from('orders').select('id, total_amount', { count: 'exact' }),
    adminClient.from('disputes').select('id', { count: 'exact' }).eq('status', 'OPEN'),
  ])

  const orders = ordersResult.data as { total_amount: number }[] | null
  const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0

  return {
    totalUsers: usersResult.count || 0,
    totalProducts: productsResult.count || 0,
    totalOrders: ordersResult.count || 0,
    totalRevenue,
    openDisputes: disputesResult.count || 0,
  }
}

export async function getAllUsers(page = 1) {
  await verifyAdmin()
  const adminClient = createAdminClient()

  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  const { data, error, count } = await adminClient
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error
  return { users: data, total: count, totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE) }
}

export async function suspendUser(userId: string, suspended: boolean) {
  await verifyAdmin()
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('profiles')
    .update({ suspended } as never)
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function setUserRole(userId: string, role: 'USER' | 'ADMIN') {
  await verifyAdmin()
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('profiles')
    .update({ role } as never)
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function getAllProducts(page = 1) {
  await verifyAdmin()
  const adminClient = createAdminClient()

  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  const { data, error, count } = await adminClient
    .from('products')
    .select('*, seller:profiles(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error
  return { products: data, total: count, totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE) }
}

export async function deleteAnyProduct(productId: string) {
  await verifyAdmin()
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('products')
    .delete()
    .eq('id', productId)

  if (error) return { error: error.message }

  revalidatePath('/admin/products')
  return { success: true }
}

export async function getAllOrders(page = 1) {
  await verifyAdmin()
  const adminClient = createAdminClient()

  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  const { data, error, count } = await adminClient
    .from('orders')
    .select('*, buyer:profiles!buyer_id(*), seller:profiles!seller_id(*), order_items(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error
  return { orders: data, total: count, totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE) }
}

export async function getAllDisputes(page = 1) {
  await verifyAdmin()
  const adminClient = createAdminClient()

  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  const { data, error, count } = await adminClient
    .from('disputes')
    .select('*, order:orders(*, buyer:profiles!buyer_id(*), seller:profiles!seller_id(*)), opened_by:profiles!opened_by_id(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error
  return { disputes: data, total: count, totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE) }
}

export async function getAdminDispute(id: string) {
  await verifyAdmin()
  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from('disputes')
    .select(`
      *,
      order:orders(*, buyer:profiles!buyer_id(*), seller:profiles!seller_id(*)),
      opened_by:profiles!opened_by_id(*),
      dispute_messages(*, author:profiles(*))
    `)
    .eq('id', id)
    .single()

  if (error) throw error

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dispute = data as any
  if (dispute?.dispute_messages) {
    dispute.dispute_messages.sort((a: { created_at: string }, b: { created_at: string }) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
  }

  return dispute
}

export async function resolveDispute(disputeId: string, status: string, resolution: string) {
  await verifyAdmin()
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('disputes')
    .update({ status, resolution } as never)
    .eq('id', disputeId)

  if (error) return { error: error.message }

  revalidatePath('/admin/disputes')
  revalidatePath(`/admin/disputes/${disputeId}`)
  return { success: true }
}

export async function sendAdminDisputeMessage(disputeId: string, content: string) {
  const { profileId } = await verifyAdmin()
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('dispute_messages')
    .insert({
      dispute_id: disputeId,
      author_id: profileId,
      content
    } as never)

  if (error) return { error: error.message }

  revalidatePath(`/admin/disputes/${disputeId}`)
  return { success: true }
}
