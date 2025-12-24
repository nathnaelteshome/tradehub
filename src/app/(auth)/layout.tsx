import Link from 'next/link'
import Image from 'next/image'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="fixed inset-0 mesh-gradient -z-10" />

      {/* Subtle overlay for better contrast */}
      <div className="fixed inset-0 bg-background/30 backdrop-blur-[2px] -z-10" />

      {/* Floating orbs for depth */}
      <div className="fixed top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse -z-10" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse -z-10" style={{ animationDelay: '1s' }} />

      {/* Logo */}
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-2xl font-bold relative z-10 glass-subtle px-4 py-2 rounded-full"
      >
        <Image
          src="/shopping-cart-svgrepo-com.svg"
          alt="TradeHub Logo"
          width={40}
          height={40}
          className="h-10 w-10"
        />
        <span>TradeHub</span>
      </Link>

      {/* Form container */}
      <div className="w-full max-w-md relative z-10">
        {children}
      </div>
    </div>
  )
}
