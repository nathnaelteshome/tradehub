import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateProduct } from '@/actions/products'
import { ProductForm } from '@/components/products/product-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getProfile } from '@/lib/auth/get-profile'

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { profile } = await getProfile()
  if (!profile) notFound()

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('seller_id', profile.id)
    .single()

  if (error || !product) {
    notFound()
  }

  const updateProductWithId = updateProduct.bind(null, id)

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Edit Product</h1>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            Update your product information below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm product={product} action={updateProductWithId} />
        </CardContent>
      </Card>
    </div>
  )
}
