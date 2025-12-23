import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProductGrid } from '@/components/products/product-grid'
import { getFeaturedProducts } from '@/actions/products'
import { ArrowRight, ShoppingBag, Shield, Users } from 'lucide-react'

export default async function HomePage() {
  const products = await getFeaturedProducts()

  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-muted/50 to-background">
        <div className="container text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Buy & Sell with Confidence
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            TradeHub is the trusted marketplace where buyers and sellers connect.
            List your items, find great deals, and trade with peace of mind.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/products">
                Browse Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/register">Start Selling</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Easy Selling</h3>
              <p className="mt-2 text-muted-foreground">
                List your items in minutes with our simple listing process.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Secure Transactions</h3>
              <p className="mt-2 text-muted-foreground">
                Our dispute resolution system protects both buyers and sellers.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Trusted Community</h3>
              <p className="mt-2 text-muted-foreground">
                Join thousands of verified buyers and sellers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container">
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

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container text-center">
          <h2 className="text-3xl font-bold">Ready to start trading?</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Join TradeHub today and become part of our growing marketplace community.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/auth/register">Create Free Account</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
