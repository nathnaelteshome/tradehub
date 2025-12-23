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

  if (authError || !user) {
    return { user: null, error: 'Not authenticated' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, suspended')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return { user: null, error: 'Profile not found' }
  }

  const profileData = profile as { id: string; role: UserRole; suspended: boolean }

  if (profileData.suspended) {
    return { user: null, error: 'Account suspended' }
  }

  return {
    user: {
      id: user.id,
      email: user.email!,
      role: profileData.role,
      suspended: profileData.suspended,
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
