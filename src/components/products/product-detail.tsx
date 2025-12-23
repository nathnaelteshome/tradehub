'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatPrice, getInitials, formatDate } from '@/lib/utils'
import { useCart } from '@/stores/cart'
import { ShoppingCart, Plus, Minus, Check } from 'lucide-react'
import type { ProductWithReviews } from '@/types'

interface ProductDetailProps {
  product: ProductWithReviews
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Images */}
      <div className="space-y-4">
        <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
          {product.images[selectedImage] ? (
            <Image
              src={product.images[selectedImage]}
              alt={product.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
        </div>
        {product.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 ${
                  selectedImage === index ? 'ring-2 ring-primary' : ''
                }`}
              >
                <Image
                  src={image}
                  alt={`${product.title} ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{product.title}</h1>
          <p className="text-4xl font-bold text-primary mt-2">
            {formatPrice(product.price)}
          </p>
        </div>

        <div className="flex gap-2">
          <Badge variant="secondary">{product.condition.replace('_', ' ')}</Badge>
          <Badge variant="outline">{product.category}</Badge>
        </div>

        <p className="text-muted-foreground whitespace-pre-wrap">
          {product.description}
        </p>

        <div className="text-sm text-muted-foreground">
          {product.quantity > 0 ? (
            <span className="text-green-600">{product.quantity} in stock</span>
          ) : (
            <span className="text-red-600">Out of stock</span>
          )}
        </div>

        {/* Quantity and Add to Cart */}
        {product.quantity > 0 && (
          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                disabled={quantity >= product.quantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button className="flex-1" onClick={handleAddToCart}>
              {added ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Added to cart
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to cart
                </>
              )}
            </Button>
          </div>
        )}

        {/* Seller Info */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={product.seller.avatar_url || undefined} />
              <AvatarFallback>{getInitials(product.seller.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{product.seller.name}</p>
              <p className="text-sm text-muted-foreground">
                Seller since {formatDate(product.seller.created_at)}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
