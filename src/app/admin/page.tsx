'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, Users, BarChart3, ArrowRight } from 'lucide-react'

// Navigation configuration
const ADMIN_SECTIONS = [
  {
    href: '/admin/niche',
    label: 'Niche',
    description: 'Manage product research niches and opportunities',
    icon: Home,
    color: 'bg-blue-500'
  },
  {
    href: '/admin/users',
    label: 'Users',
    description: 'Manage user accounts, roles, and subscriptions',
    icon: Users,
    color: 'bg-green-500'
  },
  {
    href: '/admin/analytics',
    label: 'Analytics',
    description: 'View system analytics, user metrics, and performance data',
    icon: BarChart3,
    color: 'bg-purple-500'
  }
]

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Select a section to manage</p>
      </div>

      {/* Navigation Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ADMIN_SECTIONS.map((section) => {
          const Icon = section.icon
          return (
            <Card key={section.href} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${section.color} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{section.label}</CardTitle>
                </div>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={section.href}>
                  <Button className="w-full" variant="outline">
                    Open {section.label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}