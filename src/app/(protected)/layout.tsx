import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth/get-profile'
import { Header } from '@/components/shared/header'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { profile, error } = await getProfile()

  if (error || !profile) {
    console.error('Protected layout: Profile error:', error)
    redirect('/auth/login?error=profile_error')
  }

  if (profile.suspended) {
    redirect('/suspended')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={profile} />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-4">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <Image
                src="/shopping-cart-svgrepo-com.svg"
                alt="TradeHub Logo"
                width={24}
                height={24}
                className="h-6 w-6"
              />
              <span>TradeHub</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} TradeHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
