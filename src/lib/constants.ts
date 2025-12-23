export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Home & Garden',
  'Sports',
  'Books',
  'Toys',
  'Automotive',
  'Health & Beauty',
  'Other'
] as const

export const PRODUCT_CONDITIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' }
] as const

export const ORDER_STATUSES = [
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'PROCESSING', label: 'Processing', color: 'bg-blue-500' },
  { value: 'SHIPPED', label: 'Shipped', color: 'bg-purple-500' },
  { value: 'DELIVERED', label: 'Delivered', color: 'bg-green-500' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-500' }
] as const

export const DISPUTE_STATUSES = [
  { value: 'OPEN', label: 'Open' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'RESOLVED_BUYER_FAVOR', label: 'Resolved (Buyer)' },
  { value: 'RESOLVED_SELLER_FAVOR', label: 'Resolved (Seller)' },
  { value: 'CLOSED', label: 'Closed' }
] as const

export const ITEMS_PER_PAGE = 12
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
export const MAX_IMAGES_PER_PRODUCT = 5
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
