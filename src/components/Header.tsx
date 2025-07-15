'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function Header() {
  const pathname = usePathname()
  
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
          <Link href="/" className="flex items-center space-x-2">
            <Package className="h-6 w-6 text-blue-600" />
            <span className="text-blue-600 text-2xl font-bold">CommerceCrafted</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
            {navigation.map((item, index) => (
              <Link
                key={`${item.name}-${index}`}
                href={item.href}
                className={`flex items-center ${
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
          
          <div className="flex items-center space-x-4">
            <Link href="/auth/signin">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-blue-600 hover:bg-blue-700">Sign Up</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}