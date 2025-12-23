import { createProduct } from '@/actions/products'
import { ProductForm } from '@/components/products/product-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Create New Listing</h1>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            Fill in the details below to list your product for sale.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm action={createProduct} />
        </CardContent>
      </Card>
    </div>
  )
}
