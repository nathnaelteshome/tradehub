import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (!code) {
    console.error('Auth callback: Missing authorization code')
    return NextResponse.redirect(`${origin}/auth/login?error=Missing authorization code`)
  }

  const supabase = await createClient()
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    console.error('Auth callback: Code exchange failed:', exchangeError.message)
    return NextResponse.redirect(`${origin}/auth/login?error=Authentication failed`)
  }

  // Get the authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('Auth callback: Could not get user:', userError?.message)
    return NextResponse.redirect(`${origin}/auth/login?error=Could not get user`)
  }

  const adminClient = createAdminClient()

  // Extract user metadata
  const name = user.user_metadata?.full_name ||
               user.user_metadata?.name ||
               user.email?.split('@')[0] ||
               'User'
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null

  // Check if profile exists
  const { data: existingProfile } = await adminClient
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingProfile) {
    // Profile exists - update with OAuth metadata if available
    if (avatarUrl || user.user_metadata?.full_name || user.user_metadata?.name) {
      const { error: updateError } = await adminClient
        .from('profiles')
        .update({
          avatar_url: avatarUrl,
          name: name,
        })
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Auth callback: Profile update failed:', updateError.message)
      }
    }
  } else {
    // Profile doesn't exist - create it (trigger might have failed or user existed before trigger)
    const { error: insertError } = await adminClient
      .from('profiles')
      .insert({
        user_id: user.id,
        email: user.email!,
        name: name,
        avatar_url: avatarUrl,
      })

    if (insertError) {
      console.error('Auth callback: Profile creation failed:', insertError.message)
      return NextResponse.redirect(`${origin}/auth/login?error=profile_creation_failed`)
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
