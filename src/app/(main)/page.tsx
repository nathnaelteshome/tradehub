import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProductGrid } from '@/components/products/product-grid'
import { getFeaturedProducts } from '@/actions/products'
import { getProfile } from '@/lib/auth/get-profile'
import { ArrowRight, ShoppingBag, Shield, TrendingUp, Users, DollarSign, Package } from 'lucide-react'
import { AnimatedCounter } from '@/components/shared/animated-counter'

export default async function HomePage() {
  const [products, { profile }] = await Promise.all([
    getFeaturedProducts(),
    getProfile()
  ])

  const isLoggedIn = !!profile

  return (
    <div>
      {/* Hero Section - Enhanced */}
      <section className="py-24 px-4 relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 -z-10" />

        {/* Decorative blurred orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10" />

        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-fade-in-up">
            Buy & Sell with <span className="text-primary">Confidence</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in-up delay-100">
            TradeHub is the trusted marketplace where buyers and sellers connect.
            List your items, find great deals, and trade with peace of mind.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-200">
            <Button size="lg" className="glow-sm hover:glow transition-shadow" asChild>
              <Link href="/products">
                Browse Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="glass-subtle hover:bg-background/80" asChild>
              <Link href={isLoggedIn ? "/dashboard/products/new" : "/auth/register"}>
                Start Selling
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section - NEW */}
      <section className="py-16 px-4 border-y border-border/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-subtle rounded-2xl p-8 text-center hover:scale-105 transition-transform">
              <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <div className="text-4xl font-bold text-primary">
                <AnimatedCounter end={12500} suffix="+" />
              </div>
              <p className="mt-2 text-muted-foreground font-medium">Active Users</p>
            </div>

            <div className="glass-subtle rounded-2xl p-8 text-center hover:scale-105 transition-transform">
              <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <DollarSign className="h-7 w-7 text-primary" />
              </div>
              <div className="text-4xl font-bold text-primary">
                <AnimatedCounter end={2500000} prefix="$" suffix="+" />
              </div>
              <p className="mt-2 text-muted-foreground font-medium">Transactions</p>
            </div>

            <div className="glass-subtle rounded-2xl p-8 text-center hover:scale-105 transition-transform">
              <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Package className="h-7 w-7 text-primary" />
              </div>
              <div className="text-4xl font-bold text-primary">
                <AnimatedCounter end={48000} suffix="+" />
              </div>
              <p className="mt-2 text-muted-foreground font-medium">Products Sold</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Glass Cards */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-subtle rounded-2xl text-center p-8 hover:scale-105 transition-transform">
              <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <ShoppingBag className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Easy Selling</h3>
              <p className="mt-2 text-muted-foreground">
                List your items in minutes with our simple listing process.
              </p>
            </div>
            <div className="glass-subtle rounded-2xl text-center p-8 hover:scale-105 transition-transform">
              <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Secure Transactions</h3>
              <p className="mt-2 text-muted-foreground">
                Our dispute resolution system protects both buyers and sellers.
              </p>
            </div>
            <div className="glass-subtle rounded-2xl text-center p-8 hover:scale-105 transition-transform">
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
      <section className="py-16 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent -z-10" />
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Featured Products</h2>
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

      {/* CTA Section - Glass card */}
      {!isLoggedIn && (
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="glass rounded-3xl p-12 text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold">Ready to start trading?</h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                Join TradeHub today and become part of our growing marketplace community.
              </p>
              <Button size="lg" className="mt-8 glow-sm hover:glow transition-shadow" asChild>
                <Link href="/auth/register">Create Free Account</Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
