'use server'

import { createClient } from '@/lib/supabase/server'
import { productSchema, type ProductFilterInput } from '@/lib/validations/product'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ITEMS_PER_PAGE } from '@/lib/constants'
import type { ProductWithSeller, ProductWithReviews } from '@/types'

export async function getProducts(
  filters: ProductFilterInput
): Promise<{ products: ProductWithSeller[]; totalPages: number; currentPage: number }> {
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select('*, seller:profiles(*)', { count: 'exact' })
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (filters.category) {
    query = query.eq('category', filters.category)
  }
  if (filters.condition) {
    query = query.eq('condition', filters.condition)
  }
  if (filters.minPrice) {
    query = query.gte('price', filters.minPrice)
  }
  if (filters.maxPrice) {
    query = query.lte('price', filters.maxPrice)
  }
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  const from = (filters.page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) throw error

  return {
    products: (data ?? []) as unknown as ProductWithSeller[],
    totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE),
    currentPage: filters.page
  }
}

export async function getFeaturedProducts(): Promise<ProductWithSeller[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*, seller:profiles(*)')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(8)

  if (error) throw error
  return (data ?? []) as unknown as ProductWithSeller[]
}

export async function getProduct(id: string): Promise<ProductWithReviews | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*, seller:profiles(*), reviews(*, author:profiles(*))')
    .eq('id', id)
    .single()

  if (error) throw error
  return (data ?? null) as unknown as ProductWithReviews | null
}

export async function getMyProducts() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createProduct(prevState: unknown, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const imagesRaw = formData.get('images') as string
  let images: string[] = []
  try {
    images = JSON.parse(imagesRaw || '[]')
  } catch {
    return { error: 'Invalid images format' }
  }

  const data = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    price: Number(formData.get('price')),
    category: formData.get('category') as string,
    condition: formData.get('condition') as string,
    quantity: Number(formData.get('quantity')),
    images
  }

  const validated = productSchema.safeParse(data)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const { error } = await supabase
    .from('products')
    .insert({ ...validated.data, seller_id: user.id } as never)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/products')
  revalidatePath('/dashboard/products')
  redirect('/dashboard/products')
}

export async function updateProduct(id: string, prevState: unknown, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const imagesRaw = formData.get('images') as string
  let images: string[] = []
  try {
    images = JSON.parse(imagesRaw || '[]')
  } catch {
    return { error: 'Invalid images format' }
  }

  const data = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    price: Number(formData.get('price')),
    category: formData.get('category') as string,
    condition: formData.get('condition') as string,
    quantity: Number(formData.get('quantity')),
    images
  }

  const validated = productSchema.safeParse(data)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const { error } = await supabase
    .from('products')
    .update(validated.data as never)
    .eq('id', id)
    .eq('seller_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/products')
  revalidatePath(`/products/${id}`)
  revalidatePath('/dashboard/products')
  redirect('/dashboard/products')
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/products')
  revalidatePath('/dashboard/products')
  return { success: true }
}

export async function toggleProductActive(id: string, active: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('products')
    .update({ active } as never)
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/products')
  revalidatePath('/dashboard/products')
  return { success: true }
}
