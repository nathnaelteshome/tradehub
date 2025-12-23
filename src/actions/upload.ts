'use server'

import { createClient } from '@/lib/supabase/server'
import { MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES } from '@/lib/constants'

export async function uploadProductImage(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const file = formData.get('file') as File
  if (!file) {
    return { error: 'No file provided' }
  }

  // Validate file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' }
  }

  // Validate file size
  if (file.size > MAX_IMAGE_SIZE) {
    return { error: 'File too large. Maximum size is 5MB.' }
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file)

  if (error) {
    return { error: error.message }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(data.path)

  return { url: publicUrl }
}

export async function deleteProductImage(url: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Extract path from URL
  const path = url.split('/product-images/')[1]
  if (!path) {
    return { error: 'Invalid image URL' }
  }

  // Verify ownership
  if (!path.startsWith(user.id)) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase.storage
    .from('product-images')
    .remove([path])

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
