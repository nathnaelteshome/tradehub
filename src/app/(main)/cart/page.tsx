import { CartContent } from '@/components/cart/cart-content'

export default function CartPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <CartContent />
    </div>
  )
}
