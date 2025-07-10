'use client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import React, { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  User,
  Mail,
  Lock,
  Shield,
  CreditCard,
  Settings,
  LogOut,
  Save,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Crown,
  Calendar
} from 'lucide-react'

interface ProfileFormData {
  name: string
  email: string
  emailSubscribed: boolean
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  
  const [formData, setFormData] = useState<ProfileFormData>({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    emailSubscribed: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  React.useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
        emailSubscribed: false, // We'd need to fetch this from the user profile
      })
    }
  }, [session])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Profile updated successfully')
        // Update the session
        await update()
      } else {
        setError(data.error || 'Failed to update profile')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'pro':
        return (
          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Crown className="h-3 w-3 mr-1" />
            Pro
          </div>
        )
      case 'enterprise':
        return (
          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <Crown className="h-3 w-3 mr-1" />
            Enterprise
          </div>
        )
      default:
        return (
          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Free
          </div>
        )
    }
  }

  const formatDate = (date?: Date) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your CommerceCrafted account preferences
          </p>
        </div>

        {/* Status Messages */}
        {message && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Account Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Account Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Subscription Tier</Label>
                <div className="mt-1">
                  {getTierBadge(session.user.subscriptionTier)}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Account Role</Label>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Shield className="h-3 w-3 mr-1" />
                    {session.user.role}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Email Verification</Label>
                <div className="mt-1">
                  {session.user.emailVerified ? (
                    <span className="inline-flex items-center text-sm text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-sm text-red-600">
                      <XCircle className="h-4 w-4 mr-1" />
                      Not Verified
                    </span>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Member Since</Label>
                <div className="mt-1 text-sm text-gray-600">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  {formatDate(new Date())} {/* We'd need to pass createdAt from session */}
                </div>
              </div>
            </div>

            {session.user.subscriptionExpiresAt && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900">Subscription Status</h4>
                <p className="text-xs text-blue-800 mt-1">
                  Your {session.user.subscriptionTier} subscription expires on{' '}
                  {formatDate(session.user.subscriptionExpiresAt)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Profile Settings
            </CardTitle>
            <CardDescription>
              Update your personal information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Changing your email will require verification
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="emailSubscribed"
                  checked={formData.emailSubscribed}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, emailSubscribed: checked })
                  }
                />
                <Label htmlFor="emailSubscribed" className="text-sm">
                  Subscribe to newsletter and product updates
                </Label>
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Manage your account security and password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button variant="outline" asChild className="w-full justify-start">
                <a href="/auth/forgot-password">
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </a>
              </Button>
              
              {!session.user.emailVerified && (
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Resend Verification Email
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subscription Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Subscription Management
            </CardTitle>
            <CardDescription>
              Manage your billing and subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button asChild className="w-full justify-start">
                <a href="/pricing">
                  <Crown className="h-4 w-4 mr-2" />
                  {session.user.subscriptionTier === 'free' ? 'Upgrade Plan' : 'Change Plan'}
                </a>
              </Button>
              
              {session.user.subscriptionTier !== 'free' && (
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Billing Portal
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Card>
          <CardContent className="pt-6">
            <Separator className="mb-4" />
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}