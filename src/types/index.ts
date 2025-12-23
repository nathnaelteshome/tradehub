export * from './database'

import type { Database } from './database'

// Convenient type aliases
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type Dispute = Database['public']['Tables']['disputes']['Row']
export type DisputeMessage = Database['public']['Tables']['dispute_messages']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']

// Extended types with relations
export type ProductWithSeller = Product & {
  seller: Profile
}

export type ProductWithReviews = Product & {
  seller: Profile
  reviews: (Review & { author: Profile })[]
}

export type OrderWithItems = Order & {
  order_items: (OrderItem & { product: Product | null })[]
  buyer: Profile
  seller: Profile
}

export type DisputeWithMessages = Dispute & {
  dispute_messages: (DisputeMessage & { author: Profile })[]
  order: Order
  opened_by: Profile
}

export type DisputeWithOrder = Dispute & {
  order: Order & {
    buyer: Profile
    seller: Profile
  }
  opened_by: Profile
}

export type DisputeDetail = Dispute & {
  order: Order & {
    buyer: Profile | null
    seller: Profile | null
  }
  opened_by: Profile | null
  dispute_messages: (DisputeMessage & { author: Profile | null })[] | null
}

// Cart types
export interface CartItem {
  product: Product
  quantity: number
}
