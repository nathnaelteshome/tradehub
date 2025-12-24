import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types'

export interface ProfileResult {
  profile: Profile | null
  error: string | null
}

export async function getProfile(): Promise<ProfileResult> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { profile: null, error: null }
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('Error fetching profile:', profileError.message)
      return { profile: null, error: profileError.message }
    }

    return { profile: profile as Profile | null, error: null }
  } catch (error) {
    console.error('Unexpected error in getProfile:', error)
    return { profile: null, error: 'Failed to fetch profile' }
  }
}

export async function requireProfile(): Promise<Profile> {
  const { profile, error } = await getProfile()

  if (error || !profile) {
    throw new Error(error || 'Profile not found')
  }

  return profile
}
