import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProductGrid } from '@/components/products/product-grid'
import { getFeaturedProducts } from '@/actions/products'
import { getProfile } from '@/lib/auth/get-profile'
import { ArrowRight, ShoppingBag, Shield, TrendingUp, Check } from 'lucide-react'

export default async function HomePage() {
  const [products, { profile }] = await Promise.all([
    getFeaturedProducts(),
    getProfile()
  ])

  const isLoggedIn = !!profile

  return (
    <div>
      {/* Hero Section - Clean & Minimal */}
      <section className="py-24 md:py-32 px-4 relative overflow-hidden min-h-[85vh] flex items-center">
        {/* Subtle background */}
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-background -z-10" />

        {/* Floating 3D Cards - Left Side */}
        <div className="absolute left-[5%] top-[25%] hidden lg:block animate-float">
          <div className="glass rounded-2xl p-4 w-48 tilt-3d">
            <div className="w-full h-24 bg-muted rounded-lg mb-3" />
            <div className="h-3 bg-muted-foreground/20 rounded w-3/4 mb-2" />
            <div className="h-2 bg-muted-foreground/10 rounded w-1/2" />
          </div>
        </div>

        {/* Floating 3D Cards - Right Side */}
        <div className="absolute right-[5%] top-[20%] hidden lg:block animate-float-reverse">
          <div className="glass rounded-2xl p-4 w-44 tilt-3d-reverse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-muted" />
              <div>
                <div className="h-2 bg-muted-foreground/20 rounded w-16 mb-1" />
                <div className="h-2 bg-muted-foreground/10 rounded w-12" />
              </div>
            </div>
            <div className="h-2 bg-muted-foreground/10 rounded w-full" />
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight animate-fade-in-up">
            Buy & Sell with
            <br />
            <span className="text-primary">Confidence</span>
          </h1>

          <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up delay-100">
            TradeHub is the trusted marketplace where buyers and sellers connect.
            List your items, find great deals, and trade with peace of mind.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-200">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="/products">
                Browse Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
              <Link href={isLoggedIn ? "/dashboard/products/new" : "/auth/register"}>
                Start Selling
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-muted-foreground animate-fade-in-up delay-300">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span className="text-sm">Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span className="text-sm">Fast Transactions</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span className="text-sm">Verified Sellers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 border-t">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Why Choose TradeHub?</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Everything you need for a seamless trading experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-subtle rounded-2xl text-center p-8 hover:scale-[1.02] transition-transform">
              <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <ShoppingBag className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Easy Selling</h3>
              <p className="mt-2 text-muted-foreground">
                List your items in minutes with our simple listing process.
              </p>
            </div>
            <div className="glass-subtle rounded-2xl text-center p-8 hover:scale-[1.02] transition-transform">
              <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Secure Transactions</h3>
              <p className="mt-2 text-muted-foreground">
                Our dispute resolution system protects both buyers and sellers.
              </p>
            </div>
            <div className="glass-subtle rounded-2xl text-center p-8 hover:scale-[1.02] transition-transform">
              <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Trusted Community</h3>
              <p className="mt-2 text-muted-foreground">
                Join thousands of verified buyers and sellers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products - Glass background */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent -z-10" />
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Featured Products</h2>
              <p className="text-muted-foreground mt-1">Discover amazing deals today</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/products">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <ProductGrid products={products} />
        </div>
      </section>

      {/* CTA Section */}
      {!isLoggedIn && (
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="glass rounded-3xl p-12 text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold">Ready to start trading?</h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                Join TradeHub today and become part of our growing marketplace community.
              </p>
              <Button size="lg" className="mt-8 text-lg px-8" asChild>
                <Link href="/auth/register">Create Free Account</Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
