import Link from 'next/link'
import Image from 'next/image'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/50 p-4">
      <Link href="/" className="mb-8 flex items-center gap-2 text-2xl font-bold">
        <Image
          src="/shopping-cart-svgrepo-com.svg"
          alt="TradeHub Logo"
          width={40}
          height={40}
          className="h-10 w-10"
        />
        <span>TradeHub</span>
      </Link>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
