import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { ArrowUpRight } from 'lucide-react'
import type { ProductWithSeller } from '@/types'

interface ProductCardProps {
  product: ProductWithSeller
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} className={`group ${className || ''}`}>
      <Card className="overflow-hidden h-full card-interactive border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="aspect-square relative bg-muted overflow-hidden">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-muted to-muted/50">
              <span className="text-sm">No image</span>
            </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {/* View indicator */}
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <div className="w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center border border-border/50">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
              {product.title}
            </h3>
          </div>
          <p className="text-2xl font-bold mt-2 tracking-tight">
            {formatPrice(product.price)}
          </p>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex gap-2">
          <Badge variant="secondary" className="text-xs font-medium">
            {product.condition.replace('_', ' ')}
          </Badge>
          <Badge variant="outline" className="text-xs font-medium border-border/50">
            {product.category}
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  )
}
