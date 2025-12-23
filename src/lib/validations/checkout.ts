import { z } from 'zod'

export const shippingSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'ZIP code is required'),
  country: z.string().min(2, 'Country is required'),
  phone: z.string().min(10, 'Phone number is required')
})

export type ShippingInput = z.infer<typeof shippingSchema>
