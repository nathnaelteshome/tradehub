import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth/get-profile'
import { Header } from '@/components/shared/header'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { profile, error } = await getProfile()

  if (error || !profile) {
    console.error('Admin layout: Profile error:', error)
    redirect('/auth/login?error=profile_error')
  }

  if (profile.suspended) {
    redirect('/suspended')
  }

  if (profile.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={profile} />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
