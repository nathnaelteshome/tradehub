'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS } from '@/lib/constants'

interface ProductFiltersProps {
  currentFilters: {
    category?: string
    condition?: string
    minPrice?: number
    maxPrice?: number
  }
}

export function ProductFilters({ currentFilters }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page') // Reset to page 1 when filtering
    router.push(`/products?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/products')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={currentFilters.category || 'all'}
            onValueChange={(value) => updateFilter('category', value === 'all' ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {PRODUCT_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Condition</Label>
          <Select
            value={currentFilters.condition || 'all'}
            onValueChange={(value) => updateFilter('condition', value === 'all' ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any condition</SelectItem>
              {PRODUCT_CONDITIONS.map((condition) => (
                <SelectItem key={condition.value} value={condition.value}>
                  {condition.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Min Price</Label>
          <Input
            type="number"
            placeholder="0"
            defaultValue={currentFilters.minPrice}
            onChange={(e) => updateFilter('minPrice', e.target.value || undefined)}
          />
        </div>

        <div className="space-y-2">
          <Label>Max Price</Label>
          <Input
            type="number"
            placeholder="Any"
            defaultValue={currentFilters.maxPrice}
            onChange={(e) => updateFilter('maxPrice', e.target.value || undefined)}
          />
        </div>

        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Clear filters
        </Button>
      </CardContent>
    </Card>
  )
}
