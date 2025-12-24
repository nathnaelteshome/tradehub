'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const disputeSchema = z.object({
  reason: z.string().min(3, 'Reason is required'),
})

const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long')
})

export async function createDispute(orderId: string, prevState: unknown, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Get profile ID from user_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) {
    return { error: 'Profile not found' }
  }

  const data = {
    reason: formData.get('reason') as string,
  }

  const validated = disputeSchema.safeParse(data)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  // Check if order exists and user is buyer
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .select('id, buyer_id, status')
    .eq('id', orderId)
    .single()

  if (orderError || !orderData) {
    return { error: 'Order not found' }
  }

  const order = orderData as { id: string; buyer_id: string; status: string }

  if (order.buyer_id !== profile.id) {
    return { error: 'Only buyers can open disputes' }
  }

  if (order.status !== 'DELIVERED') {
    return { error: 'Disputes can only be opened for delivered orders' }
  }

  // Check if dispute already exists
  const { data: existingDispute } = await supabase
    .from('disputes')
    .select('id')
    .eq('order_id', orderId)
    .single()

  if (existingDispute) {
    return { error: 'A dispute already exists for this order' }
  }

  const { error } = await supabase
    .from('disputes')
    .insert({
      order_id: orderId,
      opened_by_id: profile.id,
      reason: validated.data.reason,
    } as never)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/disputes')
  return { success: true }
}

export async function sendDisputeMessage(disputeId: string, prevState: unknown, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Get profile ID from user_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) {
    return { error: 'Profile not found' }
  }

  const data = { content: formData.get('content') as string }

  const validated = messageSchema.safeParse(data)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const { error } = await supabase
    .from('dispute_messages')
    .insert({
      dispute_id: disputeId,
      author_id: profile.id,
      content: validated.data.content
    } as never)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/disputes/${disputeId}`)
  return { success: true }
}

export async function getMyDisputes() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Get profile ID from user_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) throw new Error('Profile not found')

  // Get disputes where user is buyer or seller
  const { data, error } = await supabase
    .from('disputes')
    .select(`
      *,
      order:orders!inner(*, buyer:profiles!buyer_id(*), seller:profiles!seller_id(*)),
      opened_by:profiles!opened_by_id(*)
    `)
    .or(`opened_by_id.eq.${profile.id},order.buyer_id.eq.${profile.id},order.seller_id.eq.${profile.id}`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getDispute(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('disputes')
    .select(`
      *,
      order:orders!inner(*, buyer:profiles!buyer_id(*), seller:profiles!seller_id(*)),
      opened_by:profiles!opened_by_id(*),
      dispute_messages(*, author:profiles(*))
    `)
    .eq('id', id)
    .single()

  if (error) throw error

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dispute = data as any
  // Sort messages by created_at
  if (dispute?.dispute_messages) {
    dispute.dispute_messages.sort((a: { created_at: string }, b: { created_at: string }) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
  }

  return dispute
}
