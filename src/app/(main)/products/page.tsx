import { Suspense } from 'react'
import { getProducts } from '@/actions/products'
import { ProductGrid } from '@/components/products/product-grid'
import { ProductFilters } from '@/components/products/product-filters'
import { ProductSearch } from '@/components/products/product-search'
import { Pagination } from '@/components/shared/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { PRODUCT_CONDITIONS } from '@/lib/constants'
import type { ProductCondition } from '@/types/database'

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string
    condition?: string
    minPrice?: string
    maxPrice?: string
    search?: string
    page?: string
  }>
}

const CONDITION_VALUES = PRODUCT_CONDITIONS.map((condition) => condition.value) as ProductCondition[]

function parseCondition(value?: string): ProductCondition | undefined {
  if (!value) {
    return undefined
  }
  return CONDITION_VALUES.includes(value as ProductCondition) ? (value as ProductCondition) : undefined
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      ))}
    </div>
  )
}

async function ProductsContent({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const condition = parseCondition(params.condition)
  const filters = {
    category: params.category,
    condition,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    search: params.search,
    page: params.page ? Number(params.page) : 1
  }

  const { products, totalPages, currentPage } = await getProducts(filters)

  return (
    <>
      <ProductGrid products={products} />
      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </>
  )
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const condition = parseCondition(params.condition)

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <h1 className="text-3xl font-bold">Browse Products</h1>
          <ProductSearch defaultValue={params.search} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <ProductFilters
              currentFilters={{
                category: params.category,
                condition,
                minPrice: params.minPrice ? Number(params.minPrice) : undefined,
                maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
              }}
            />
          </aside>

          <main className="lg:col-span-3">
            <Suspense fallback={<ProductGridSkeleton />}>
              <ProductsContent searchParams={searchParams} />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  )
}
