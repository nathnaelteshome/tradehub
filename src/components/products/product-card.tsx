import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import type { ProductWithSeller } from '@/types'

interface ProductCardProps {
  product: ProductWithSeller
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`}>
      <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
        <div className="aspect-square relative bg-muted">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-1">{product.title}</h3>
          <p className="text-2xl font-bold text-primary mt-1">
            {formatPrice(product.price)}
          </p>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {product.description}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex gap-2">
          <Badge variant="secondary">{product.condition.replace('_', ' ')}</Badge>
          <Badge variant="outline">{product.category}</Badge>
        </CardFooter>
      </Card>
    </Link>
  )
}
