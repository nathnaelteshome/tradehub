import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/shared/header'
import { getProfile } from '@/lib/auth/get-profile'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  // For public pages, profile is optional (null for guests)
  // If there's an error fetching profile for a logged-in user,
  // getProfile logs it and returns null, which is acceptable here
  const { profile } = await getProfile()

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
