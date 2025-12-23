import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthUser } from '../_lib/auth'
import { successResponse, errorResponse } from '../_lib/response'
import { productSchema } from '@/lib/validations/product'
import { ITEMS_PER_PAGE, PRODUCT_CONDITIONS } from '@/lib/constants'
import type { ProductCondition } from '@/types/database'

const CONDITION_VALUES = PRODUCT_CONDITIONS.map((condition) => condition.value) as ProductCondition[]

const parseProductCondition = (value: string | null): ProductCondition | undefined => {
  if (!value) {
    return undefined
  }
  return CONDITION_VALUES.includes(value as ProductCondition) ? (value as ProductCondition) : undefined
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const category = searchParams.get('category')
    const condition = parseProductCondition(searchParams.get('condition'))
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const search = searchParams.get('search')

    let query = supabase
      .from('products')
      .select('*, seller:profiles(*)', { count: 'exact' })
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }
    if (condition) {
      query = query.eq('condition', condition)
    }
    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice))
    }
    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice))
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const from = (page - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      return errorResponse(error.message, 'Failed to fetch products', 500)
    }

    return successResponse(
      {
        products: data,
        pagination: {
          page,
          limit: ITEMS_PER_PAGE,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE),
        },
      },
      'Products fetched successfully'
    )
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      'Failed to fetch products',
      500
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthUser()
    if (authError || !user) {
      return errorResponse(authError || 'Unauthorized', 'Authentication required', 401)
    }

    const body = await request.json()
    const validated = productSchema.safeParse(body)

    if (!validated.success) {
      return errorResponse(validated.error.issues[0].message, 'Validation failed', 400)
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('products')
      .insert({ ...validated.data, seller_id: user.id })
      .select()
      .single()

    if (error) {
      return errorResponse(error.message, 'Failed to create product', 500)
    }

    return successResponse(data, 'Product created successfully', 201)
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      'Failed to create product',
      500
    )
  }
}
