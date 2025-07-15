'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Search,
  Filter,
  Mail,
  Crown,
  Shield,
  Ban,
  CheckCircle,
  Eye,
  Edit,
  RefreshCw,
  User as UserIcon,
  Save,
  Loader2
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string | null
  email: string
  role: string
  subscription_tier: string
  subscription_expires_at: string | null
  email_subscribed: boolean
  created_at: string
  last_login_at: string | null
  is_active: boolean
  email_verified: string | null
  stripe_customer_id: string | null
  updated_at: string
}

// Cache users data
let cachedUsers: User[] | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 60000 // 1 minute

export default function UsersTab() {
  const [users, setUsers] = useState<User[]>(cachedUsers || [])
  const [loading, setLoading] = useState(!cachedUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedPlan, setSelectedPlan] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [savingUserId, setSavingUserId] = useState<string | null>(null)
  const router = useRouter()
  const usersPerPage = 25

  const loadUsers = useCallback(async (forceRefresh = false) => {
    // Check cache
    if (!forceRefresh && cachedUsers && Date.now() - cacheTimestamp < CACHE_DURATION) {
      setUsers(cachedUsers)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching users:', error)
      } else if (data) {
        cachedUsers = data
        cacheTimestamp = Date.now()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const updateUserRole = async (userId: string, newRole: string) => {
    setSavingUserId(userId)
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      // Update local state and cache
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      )
      setUsers(updatedUsers)
      cachedUsers = updatedUsers
    } catch (error) {
      console.error('Error updating user role:', error)
      alert('Failed to update user role')
    } finally {
      setSavingUserId(null)
    }
  }

  const updateUserPlan = async (userId: string, newPlan: string) => {
    setSavingUserId(userId)
    try {
      const { error } = await supabase
        .from('users')
        .update({ subscription_tier: newPlan })
        .eq('id', userId)

      if (error) throw error

      // Update local state and cache
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, subscription_tier: newPlan } : user
      )
      setUsers(updatedUsers)
      cachedUsers = updatedUsers
    } catch (error) {
      console.error('Error updating user plan:', error)
      alert('Failed to update user plan')
    } finally {
      setSavingUserId(null)
    }
  }

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesRole = selectedRole === 'all' || user.role === selectedRole
      const matchesPlan = selectedPlan === 'all' || user.subscription_tier === selectedPlan
      const matchesStatus = selectedStatus === 'all' || 
                          (selectedStatus === 'active' && user.is_active) ||
                          (selectedStatus === 'inactive' && !user.is_active)
      
      return matchesSearch && matchesRole && matchesPlan && matchesStatus
    })
  }, [users, searchTerm, selectedRole, selectedPlan, selectedStatus])

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  )

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      USER: { icon: UserIcon, label: 'User', className: 'bg-gray-100 text-gray-700' },
      ADMIN: { icon: Shield, label: 'Admin', className: 'bg-red-100 text-red-700' },
      ANALYST: { icon: Crown, label: 'Analyst', className: 'bg-purple-100 text-purple-700' }
    }
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.USER
    const Icon = config.icon
    
    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const getPlanBadge = (plan: string) => {
    const planConfig = {
      free: { label: 'Free', className: 'bg-gray-100 text-gray-700' },
      pro: { label: 'Pro', className: 'bg-blue-100 text-blue-700' },
      enterprise: { label: 'Enterprise', className: 'bg-purple-100 text-purple-700' }
    }
    const config = planConfig[plan as keyof typeof planConfig] || planConfig.free
    
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-700">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-700">
        <Ban className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Management</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {filteredUsers.length} users found
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => loadUsers(true)}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedRole} onValueChange={(value) => {
              setSelectedRole(value)
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="ANALYST">Analyst</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPlan} onValueChange={(value) => {
              setSelectedPlan(value)
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Plans" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={(value) => {
              setSelectedStatus(value)
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                </TableCell>
              </TableRow>
            ) : paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <p className="text-gray-500">No users found</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.name || 'Unnamed User'}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) => updateUserRole(user.id, value)}
                      disabled={savingUserId === user.id}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">User</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="ANALYST">Analyst</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.subscription_tier}
                      onValueChange={(value) => updateUserPlan(user.id, value)}
                      disabled={savingUserId === user.id}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{getStatusBadge(user.is_active)}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/admin/users/manage/${user.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <p className="text-sm text-gray-600">
              Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}