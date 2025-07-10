'use client'

import Link from 'next/link'
import { Package, Globe } from 'lucide-react'

export default function Footer() {

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
              <li><Link href="/features" className="hover:text-white">Features</Link></li>
              <li><Link href="/products" className="hover:text-white">Product Database</Link></li>
              <li><Link href="/trends" className="hover:text-white">Market Trends</Link></li>
              <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-100 mb-4">Legal & Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
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
            <div className="flex items-center">
              <button className="text-sm text-gray-400 hover:text-white flex items-center">
                <Globe className="h-4 w-4 mr-1" />
                English
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}