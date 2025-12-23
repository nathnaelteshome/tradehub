import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthUser } from '../../_lib/auth'
import { successResponse, errorResponse } from '../../_lib/response'
import { productSchema } from '@/lib/validations/product'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('products')
      .select('*, seller:profiles(*), reviews(*, author:profiles(*))')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Product not found', 'Product not found', 404)
      }
      return errorResponse(error.message, 'Failed to fetch product', 500)
    }

    return successResponse(data, 'Product fetched successfully')
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      'Failed to fetch product',
      500
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
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

    // Verify ownership
    const { data: existing } = await supabase
      .from('products')
      .select('seller_id')
      .eq('id', id)
      .single()

    if (!existing) {
      return errorResponse('Product not found', 'Product not found', 404)
    }

    if (existing.seller_id !== user.id) {
      return errorResponse('Not authorized', 'You can only update your own products', 403)
    }

    const { data, error } = await supabase
      .from('products')
      .update(validated.data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return errorResponse(error.message, 'Failed to update product', 500)
    }

    return successResponse(data, 'Product updated successfully')
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      'Failed to update product',
      500
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const { user, error: authError } = await getAuthUser()
    if (authError || !user) {
      return errorResponse(authError || 'Unauthorized', 'Authentication required', 401)
    }

    const supabase = await createClient()

    // Verify ownership or admin
    const { data: existing } = await supabase
      .from('products')
      .select('seller_id')
      .eq('id', id)
      .single()

    if (!existing) {
      return errorResponse('Product not found', 'Product not found', 404)
    }

    if (existing.seller_id !== user.id && user.role !== 'ADMIN') {
      return errorResponse('Not authorized', 'You can only delete your own products', 403)
    }

    const { error } = await supabase.from('products').delete().eq('id', id)

    if (error) {
      return errorResponse(error.message, 'Failed to delete product', 500)
    }

    return successResponse(null, 'Product deleted successfully')
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      'Failed to delete product',
      500
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const { user, error: authError } = await getAuthUser()
    if (authError || !user) {
      return errorResponse(authError || 'Unauthorized', 'Authentication required', 401)
    }

    const body = await request.json()
    const { active } = body

    if (typeof active !== 'boolean') {
      return errorResponse('Invalid active value', 'Validation failed', 400)
    }

    const supabase = await createClient()

    // Verify ownership
    const { data: existing } = await supabase
      .from('products')
      .select('seller_id')
      .eq('id', id)
      .single()

    if (!existing) {
      return errorResponse('Product not found', 'Product not found', 404)
    }

    if (existing.seller_id !== user.id) {
      return errorResponse('Not authorized', 'You can only update your own products', 403)
    }

    const { data, error } = await supabase
      .from('products')
      .update({ active })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return errorResponse(error.message, 'Failed to update product', 500)
    }

    return successResponse(data, `Product ${active ? 'activated' : 'deactivated'} successfully`)
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      'Failed to update product',
      500
    )
  }
}
