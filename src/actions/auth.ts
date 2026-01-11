'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from '@/lib/validations/auth'

export type AuthActionResult = { error: string } | { success: string } | null

export async function login(prevState: AuthActionResult, formData: FormData): Promise<AuthActionResult> {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const validated = loginSchema.safeParse(data)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}

export async function register(prevState: AuthActionResult, formData: FormData): Promise<AuthActionResult> {
  const supabase = await createClient()

  const data = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  }

  const validated = registerSchema.safeParse(data)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: { name: data.name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    }
  })

  if (error) {
    return { error: error.message }
  }

  // Send welcome email via Resend
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    await fetch(`${appUrl}/api/auth/welcome-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email, name: data.name }),
    })
  } catch (emailError) {
    console.error('Failed to send welcome email:', emailError)
    // Don't fail registration if email fails
  }

  redirect('/dashboard')
}

export async function forgotPassword(prevState: AuthActionResult, formData: FormData): Promise<AuthActionResult> {
  const supabase = await createClient()

  const data = { email: formData.get('email') as string }

  const validated = forgotPasswordSchema.safeParse(data)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Check your email for a password reset link' }
}

export async function resetPassword(prevState: AuthActionResult, formData: FormData): Promise<AuthActionResult> {
  const supabase = await createClient()

  const data = {
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  }

  const validated = resetPasswordSchema.safeParse(data)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const { error } = await supabase.auth.updateUser({ password: data.password })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function signInWithGoogle() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
}
