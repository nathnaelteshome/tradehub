import Link from 'next/link'
import Image from 'next/image'
import { getMyProducts, deleteProduct, toggleProductActive } from '@/actions/products'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate } from '@/lib/utils'
import { Plus, Edit, Trash2, Eye, EyeOff, Package } from 'lucide-react'
import { revalidatePath } from 'next/cache'

async function handleDelete(id: string) {
  'use server'
  await deleteProduct(id)
  revalidatePath('/dashboard/products')
}

async function handleToggleActive(id: string, active: boolean) {
  'use server'
  await toggleProductActive(id, active)
  revalidatePath('/dashboard/products')
}

export default async function ProductsPage() {
  const products = await getMyProducts()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Products</h1>
        <Button asChild>
          <Link href="/dashboard/products/new">
            <Plus className="mr-2 h-4 w-4" />
            New Product
          </Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No products yet</h2>
          <p className="text-muted-foreground mb-4">
            Start selling by creating your first product listing.
          </p>
          <Button asChild>
            <Link href="/dashboard/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Product
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {products.map((product: any) => (
            <Card key={product.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        fill
                        className="object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold line-clamp-1">{product.title}</h3>
                        <p className="text-2xl font-bold text-primary">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Badge variant={product.active ? 'default' : 'secondary'}>
                          {product.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{product.category}</span>
                      <span>{product.condition.replace('_', ' ')}</span>
                      <span>{product.quantity} in stock</span>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/products/${product.id}`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      <form action={handleToggleActive.bind(null, product.id, !product.active)}>
                        <Button variant="outline" size="sm" type="submit">
                          {product.active ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-1" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>
                      </form>
                      <form action={handleDelete.bind(null, product.id)}>
                        <Button variant="outline" size="sm" type="submit" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
