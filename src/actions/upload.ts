'use server'

import { createClient } from '@/lib/supabase/server'
import cloudinary from '@/lib/cloudinary'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

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
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' }
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return { error: 'File too large. Maximum size is 5MB.' }
  }

  try {
    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64, {
      folder: `tradehub/${user.id}`,
      resource_type: 'image',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    })

    return { url: result.secure_url, public_id: result.public_id }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    return { error: 'Failed to upload image' }
  }
}

export async function deleteProductImage(url: string, publicId?: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    // If publicId is provided, use it directly
    if (publicId) {
      // Verify ownership
      if (!publicId.includes(`tradehub/${user.id}`)) {
        return { error: 'Unauthorized' }
      }
      await cloudinary.uploader.destroy(publicId)
      return { success: true }
    }

    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{public_id}.{ext}
    const matches = url.match(/\/tradehub\/[^/]+\/[^.]+/)
    if (!matches) {
      // If we can't extract public_id, just return success (image might be from old system)
      return { success: true }
    }

    const extractedPublicId = matches[0].slice(1) // Remove leading slash

    // Verify ownership
    if (!extractedPublicId.includes(`tradehub/${user.id}`)) {
      return { error: 'Unauthorized' }
    }

    await cloudinary.uploader.destroy(extractedPublicId)
    return { success: true }
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    return { error: 'Failed to delete image' }
  }
}
