import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types/database'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  suspended: boolean
}

export interface AuthResult {
  user: AuthUser | null
  error: string | null
}

export async function getAuthUser(): Promise<AuthResult> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    console.error('API auth error:', authError.message)
    return { user: null, error: 'Authentication error' }
  }

  if (!user) {
    return { user: null, error: 'Not authenticated' }
  }

  // Use maybeSingle() to prevent crash on missing profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, suspended')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profileError) {
    console.error('API profile error:', profileError.message)
    return { user: null, error: 'Profile fetch error' }
  }

  if (!profile) {
    console.error('API profile missing for user:', user.id)
    return { user: null, error: 'Profile not found' }
  }

  if (profile.suspended) {
    return { user: null, error: 'Account suspended' }
  }

  return {
    user: {
      id: user.id,
      email: user.email!,
      role: profile.role,
      suspended: profile.suspended,
    },
    error: null,
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const result = await getAuthUser()
  if (result.error || !result.user) {
    throw new Error(result.error || 'Not authenticated')
  }
  return result.user
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth()
  if (user.role !== 'ADMIN') {
    throw new Error('Admin access required')
  }
  return user
}
