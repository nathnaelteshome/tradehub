import { z } from 'zod'
import { PRODUCT_CATEGORIES } from '@/lib/constants'

const PRODUCT_CONDITIONS = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'] as const

export const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description must be less than 2000 characters'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  category: z.enum(PRODUCT_CATEGORIES as unknown as [string, ...string[]]),
  condition: z.enum(PRODUCT_CONDITIONS),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
  images: z.array(z.string()).min(1, 'At least one image is required').max(5, 'Maximum 5 images allowed')
})

export type ProductInput = z.infer<typeof productSchema>

export const productFilterSchema = z.object({
  category: z.string().optional(),
  condition: z.enum(PRODUCT_CONDITIONS).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  search: z.string().optional(),
  page: z.coerce.number().default(1)
})

export type ProductFilterInput = z.infer<typeof productFilterSchema>
