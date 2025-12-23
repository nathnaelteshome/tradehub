export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'USER' | 'ADMIN'
export type ProductCondition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR'
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED_BUYER_FAVOR' | 'RESOLVED_SELLER_FAVOR' | 'CLOSED'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          role: UserRole
          suspended: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          avatar_url?: string | null
          role?: UserRole
          suspended?: boolean
        }
        Update: {
          name?: string
          avatar_url?: string | null
          role?: UserRole
          suspended?: boolean
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          seller_id: string
          title: string
          description: string
          price: number
          images: string[]
          category: string
          condition: ProductCondition
          quantity: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          title: string
          description: string
          price: number
          images?: string[]
          category: string
          condition: ProductCondition
          quantity?: number
          active?: boolean
        }
        Update: {
          title?: string
          description?: string
          price?: number
          images?: string[]
          category?: string
          condition?: ProductCondition
          quantity?: number
          active?: boolean
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          order_number: string
          buyer_id: string
          seller_id: string
          status: OrderStatus
          total_amount: number
          shipping_address: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number?: string
          buyer_id: string
          seller_id: string
          status?: OrderStatus
          total_amount: number
          shipping_address: Json
        }
        Update: {
          status?: OrderStatus
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          quantity: number
          price: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price: number
        }
        Update: never
        Relationships: []
      }
      disputes: {
        Row: {
          id: string
          order_id: string
          opened_by_id: string
          reason: string
          status: DisputeStatus
          resolution: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          opened_by_id: string
          reason: string
          status?: DisputeStatus
        }
        Update: {
          status?: DisputeStatus
          resolution?: string | null
        }
        Relationships: []
      }
      dispute_messages: {
        Row: {
          id: string
          dispute_id: string
          author_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          dispute_id: string
          author_id: string
          content: string
        }
        Update: never
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          author_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          author_id: string
          rating: number
          comment?: string | null
        }
        Update: never
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
