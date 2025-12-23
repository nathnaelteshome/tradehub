import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product, CartItem } from '@/types'

interface CartState {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  clearSellerItems: (sellerId: string) => void
  getTotal: () => number
  getItemCount: () => number
  getItemsBySeller: () => Map<string, CartItem[]>
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find(item => item.product.id === product.id)
          if (existing) {
            return {
              items: state.items.map(item =>
                item.product.id === product.id
                  ? { ...item, quantity: Math.min(item.quantity + quantity, product.quantity) }
                  : item
              )
            }
          }
          return { items: [...state.items, { product, quantity }] }
        })
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter(item => item.product.id !== productId)
        }))
      },

      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map(item =>
            item.product.id === productId
              ? { ...item, quantity: Math.max(1, Math.min(quantity, item.product.quantity)) }
              : item
          )
        }))
      },

      clearCart: () => set({ items: [] }),

      clearSellerItems: (sellerId) => {
        set((state) => ({
          items: state.items.filter(item => item.product.seller_id !== sellerId)
        }))
      },

      getTotal: () => {
        return get().items.reduce((total, item) => total + (item.product.price * item.quantity), 0)
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },

      getItemsBySeller: () => {
        const itemsBySeller = new Map<string, CartItem[]>()
        get().items.forEach(item => {
          const sellerId = item.product.seller_id
          if (!itemsBySeller.has(sellerId)) {
            itemsBySeller.set(sellerId, [])
          }
          itemsBySeller.get(sellerId)!.push(item)
        })
        return itemsBySeller
      }
    }),
    {
      name: 'tradehub-cart',
    }
  )
)
