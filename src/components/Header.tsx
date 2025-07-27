'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Package, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function Header() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const isActive = (path: string) => {
    return pathname === path
  }

  const navigation: Array<{ name: string; href: string; badge?: string }> = [
    { name: 'Product of the Day', href: '/product-of-the-day' },
    { name: 'Database', href: '/database' },
    { name: 'Trends', href: '/trends' },
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
  ]

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 z-10">
            <Package className="h-6 w-6 text-blue-600" />
            <span className="text-blue-600 text-xl sm:text-2xl font-bold">CommerceCrafted</span>
          </Link>
          
          {/* Desktop Navigation - centered */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 absolute left-1/2 transform -translate-x-1/2">
            {navigation.map((item, index) => (
              <Link
                key={`${item.name}-${index}`}
                href={item.href}
                className={`flex items-center text-sm xl:text-base ${
                  isActive(item.href)
                    ? 'text-blue-600 font-medium'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {item.name}
                {item.badge && (
                  <Badge className="ml-2 bg-blue-100 text-blue-600 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </nav>
          
          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4 z-10">
            <Link href="/auth/signin">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-blue-600 hover:bg-blue-700" size="sm">Sign Up</Button>
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden z-10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item, index) => (
                <Link
                  key={`mobile-${item.name}-${index}`}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-2 py-2 rounded-md ${
                    isActive(item.href)
                      ? 'text-blue-600 font-medium bg-blue-50'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                  {item.badge && (
                    <Badge className="ml-2 bg-blue-100 text-blue-600 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                <Link href="/auth/signin" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="bg-blue-600 hover:bg-blue-700 w-full">Sign Up</Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}