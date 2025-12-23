import Image from 'next/image'
import { getAllProducts, deleteAnyProduct } from '@/actions/admin'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice, formatDate } from '@/lib/utils'
import { Package, Trash2 } from 'lucide-react'
import { revalidatePath } from 'next/cache'

interface ProductsPageProps {
  searchParams: Promise<{ page?: string }>
}

async function handleDelete(productId: string) {
  'use server'
  await deleteAnyProduct(productId)
  revalidatePath('/admin/products')
}

export default async function AdminProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const page = params.page ? Number(params.page) : 1
  const { products, total } = await getAllProducts(page)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <p className="text-muted-foreground">{total} total products</p>
      </div>

      <div className="space-y-4">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {products?.map((product: any) => (
          <Card key={product.id}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="relative w-20 h-20 flex-shrink-0">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      className="object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold line-clamp-1">{product.title}</h3>
                      <p className="text-lg font-bold text-primary">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                    <Badge variant={product.active ? 'default' : 'secondary'}>
                      {product.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span>Seller: {product.seller?.name}</span>
                    <span>{product.category}</span>
                    <span>{formatDate(product.created_at)}</span>
                  </div>
                </div>

                <form action={handleDelete.bind(null, product.id)}>
                  <Button variant="outline" size="sm" type="submit" className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
