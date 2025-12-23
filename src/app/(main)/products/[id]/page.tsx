import { notFound } from 'next/navigation'
import { getProduct } from '@/actions/products'
import { ProductDetail } from '@/components/products/product-detail'

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params

  try {
    const product = await getProduct(id)

    if (!product) {
      notFound()
    }

    return (
      <div className="container py-8">
        <ProductDetail product={product} />
      </div>
    )
  } catch {
    notFound()
  }
}
