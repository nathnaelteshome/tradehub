'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ShoppingCart, User, LogOut, Package, Settings, LayoutDashboard, ChevronDown, Plus, Grid3X3 } from 'lucide-react'
import { useCart } from '@/stores/cart'
import { logout } from '@/actions/auth'
import { getInitials } from '@/lib/utils'
import { useState } from 'react'
import { ThemeToggle } from './theme-toggle'
import { PRODUCT_CATEGORIES } from '@/lib/constants'
import type { Profile } from '@/types'

interface HeaderProps {
  user: Profile | null
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname()
  const { getItemCount } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const itemCount = getItemCount()

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Browse' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2.5 text-xl font-bold group">
            <div className="relative">
              <Image
                src="/shopping-cart-svgrepo-com.svg"
                alt="TradeHub Logo"
                width={32}
                height={32}
                className="h-8 w-8 transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <span className="hidden sm:inline tracking-tight">TradeHub</span>
          </Link>
        </div>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                pathname === link.href
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Categories Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={`px-4 py-2 h-auto text-sm font-medium rounded-lg transition-all duration-200 ${
                  pathname.startsWith('/products?category')
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                Categories
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56 p-2">
              <DropdownMenuItem asChild>
                <Link href="/products" className="cursor-pointer font-medium">
                  All Categories
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="grid grid-cols-1 gap-1">
                {PRODUCT_CATEGORIES.map((category) => (
                  <DropdownMenuItem key={category} asChild>
                    <Link
                      href={`/products?category=${encodeURIComponent(category)}`}
                      className="cursor-pointer"
                    >
                      {category}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Link href="/cart" className="relative group">
            <Button variant="ghost" size="icon" className="rounded-full transition-all duration-200 hover:bg-muted">
              <ShoppingCart className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-foreground text-background text-xs flex items-center justify-center font-medium animate-fade-in-up">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Sell Button */}
          {user && (
            <Button asChild size="sm" className="hidden sm:flex rounded-lg gap-1.5 font-medium">
              <Link href="/dashboard/products/new">
                <Plus className="h-4 w-4" />
                Sell
              </Link>
            </Button>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-border/50 hover:ring-foreground/20 transition-all duration-200">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
                    <AvatarFallback className="bg-muted text-foreground font-medium text-sm">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
                <div className="flex items-center gap-3 p-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-0.5 leading-none">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[140px]">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/products" className="cursor-pointer">
                    <Package className="mr-2 h-4 w-4" />
                    My Products
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                {user.role === 'ADMIN' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="text-destructive focus:text-destructive">
                  <form action={logout}>
                    <button className="flex w-full items-center cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2 ml-2">
              <Button variant="ghost" size="sm" asChild className="rounded-lg text-muted-foreground hover:text-foreground">
                <Link href="/auth/login">Sign in</Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="rounded-lg">
                <Link href="/auth/register">Get started</Link>
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className="relative w-5 h-5 flex items-center justify-center">
              <span className={`absolute h-0.5 w-4 bg-current transition-all duration-200 ${mobileMenuOpen ? 'rotate-45' : '-translate-y-1.5'}`} />
              <span className={`absolute h-0.5 w-4 bg-current transition-all duration-200 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`absolute h-0.5 w-4 bg-current transition-all duration-200 ${mobileMenuOpen ? '-rotate-45' : 'translate-y-1.5'}`} />
            </div>
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden border-t border-border/30 bg-background/95 backdrop-blur-xl overflow-hidden transition-all duration-300 ${mobileMenuOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'}`}>
        <nav className="flex flex-col p-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                pathname === link.href
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {/* Categories Section */}
          <div className="pt-2 mt-2 border-t border-border/30">
            <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Categories
            </p>
            <div className="grid grid-cols-2 gap-1">
              {PRODUCT_CATEGORIES.map((category) => (
                <Link
                  key={category}
                  href={`/products?category=${encodeURIComponent(category)}`}
                  className="px-4 py-2.5 text-sm font-medium rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>

          {/* Sell Button for mobile */}
          {user && (
            <div className="pt-2 mt-2 border-t border-border/30">
              <Button asChild className="w-full justify-center rounded-xl gap-2">
                <Link href="/dashboard/products/new" onClick={() => setMobileMenuOpen(false)}>
                  <Plus className="h-4 w-4" />
                  Start Selling
                </Link>
              </Button>
            </div>
          )}

          {!user && (
            <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-border/30">
              <Button variant="ghost" asChild className="justify-center rounded-xl">
                <Link href="/auth/login">Sign in</Link>
              </Button>
              <Button variant="outline" asChild className="justify-center rounded-xl">
                <Link href="/auth/register">Get started</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
