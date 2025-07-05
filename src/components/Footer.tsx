'use client'

import Link from 'next/link'
import { Package, Mail, Globe, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    // In production, this would call your newsletter API
    setIsSubscribed(true)
    setTimeout(() => setIsSubscribed(false), 3000)
    setEmail('')
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Newsletter Section */}
        <div className="bg-gray-800 rounded-lg p-8 mb-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">Get Daily Amazon Product Opportunities</h3>
            <p className="text-gray-400 mb-6">
              Join 15,000+ entrepreneurs receiving our daily product analysis
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {isSubscribed ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Subscribed!
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Subscribe
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Package className="h-6 w-6 text-blue-500" />
              <span className="text-xl font-bold">CommerceCrafted</span>
            </div>
            <p className="text-gray-400 text-sm">
              Discover profitable Amazon product opportunities with AI-powered market analysis.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-100 mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/products" className="hover:text-white">Product Database</Link></li>
              <li><Link href="/trends" className="hover:text-white">Market Trends</Link></li>
              <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-100 mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/features" className="hover:text-white">Features</Link></li>
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              <li><Link href="/frequently-asked-questions" className="hover:text-white">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-100 mb-4">Legal & Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/contact" className="hover:text-white">Support</Link></li>
              <li><Link href="/account" className="hover:text-white">Account</Link></li>
              <li>
                <a href="mailto:support@commercecrafted.com" className="hover:text-white">
                  support@commercecrafted.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © 2025 CommerceCrafted. All rights reserved.
            </div>
            <div className="flex items-center space-x-6">
              <button className="text-sm text-gray-400 hover:text-white flex items-center">
                <Globe className="h-4 w-4 mr-1" />
                English
              </button>
              <Link href="/api/health" className="text-sm text-gray-400 hover:text-white">
                System Status
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}