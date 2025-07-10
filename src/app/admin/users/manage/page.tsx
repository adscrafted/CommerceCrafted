'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { supabase } from '@/lib/supabase/client'
import { Shield, User, TrendingUp, Save, Loader2 } from 'lucide-react'

interface UserData {
  id: string
  email: string
  name: string
  role: 'USER' | 'ADMIN' | 'ANALYST'
  subscription_tier: string
  created_at: string
  last_login_at: string
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    setSaving(userId)
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole as 'USER' | 'ADMIN' | 'ANALYST' } : user
      ))

      // Show success (you could add a toast here)
      console.log('User role updated successfully')
    } catch (error) {
      console.error('Error updating user role:', error)
      alert('Failed to update user role')
    } finally {
      setSaving(null)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="h-4 w-4" />
      case 'ANALYST':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800'
      case 'ANALYST':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>User Role Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.name || '-'}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      <span className="flex items-center space-x-1">
                        {getRoleIcon(user.role)}
                        <span>{user.role}</span>
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.subscription_tier}</Badge>
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Select
                        value={user.role}
                        onValueChange={(value) => updateUserRole(user.id, value)}
                        disabled={saving === user.id}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USER">
                            <span className="flex items-center space-x-2">
                              <User className="h-4 w-4" />
                              <span>User</span>
                            </span>
                          </SelectItem>
                          <SelectItem value="ANALYST">
                            <span className="flex items-center space-x-2">
                              <TrendingUp className="h-4 w-4" />
                              <span>Analyst</span>
                            </span>
                          </SelectItem>
                          <SelectItem value="ADMIN">
                            <span className="flex items-center space-x-2">
                              <Shield className="h-4 w-4" />
                              <span>Admin</span>
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {saving === user.id && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Descriptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Badge className="bg-gray-100 text-gray-800 mt-1">
              <User className="h-4 w-4 mr-1" />
              USER
            </Badge>
            <div>
              <p className="text-sm font-medium">Regular User</p>
              <p className="text-sm text-gray-600">Can access products, create searches, and use basic features based on their subscription tier.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Badge className="bg-purple-100 text-purple-800 mt-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              ANALYST
            </Badge>
            <div>
              <p className="text-sm font-medium">Analyst</p>
              <p className="text-sm text-gray-600">Has access to advanced analytics, can create and manage product analyses, and view aggregated data.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Badge className="bg-red-100 text-red-800 mt-1">
              <Shield className="h-4 w-4 mr-1" />
              ADMIN
            </Badge>
            <div>
              <p className="text-sm font-medium">Administrator</p>
              <p className="text-sm text-gray-600">Full access to all features, can manage users, view all analytics, and access admin dashboard.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}