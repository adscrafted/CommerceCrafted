'use client'

import React, { useState, useEffect } from 'react'
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
  Users,
  Search,
  Filter,
  UserPlus,
  MoreHorizontal,
  Mail,
  Crown,
  Shield,
  Ban,
  CheckCircle,
  Eye,
  Edit,
  Download,
  RefreshCw
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
  subscriptionTier: string
  subscriptionExpiresAt?: Date
  emailSubscribed: boolean
  createdAt: Date
  lastLoginAt?: Date
  analysisCount: number
  status: 'active' | 'inactive' | 'suspended'
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedPlan, setSelectedPlan] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const usersPerPage = 10

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      // Mock data - in production this would be an API call
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@email.com',
          role: 'USER',
          subscriptionTier: 'pro',
          subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          emailSubscribed: true,
          createdAt: new Date('2024-01-15'),
          lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          analysisCount: 234,
          status: 'active'
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          role: 'USER',
          subscriptionTier: 'enterprise',
          subscriptionExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          emailSubscribed: true,
          createdAt: new Date('2023-11-20'),
          lastLoginAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          analysisCount: 1247,
          status: 'active'
        },
        {
          id: '3',
          name: 'Mike Wilson',
          email: 'mike.wilson@email.com',
          role: 'USER',
          subscriptionTier: 'free',
          emailSubscribed: false,
          createdAt: new Date('2024-02-10'),
          lastLoginAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          analysisCount: 3,
          status: 'active'
        },
        {
          id: '4',
          name: 'Admin User',
          email: 'admin@commercecrafted.com',
          role: 'ADMIN',
          subscriptionTier: 'enterprise',
          emailSubscribed: true,
          createdAt: new Date('2023-01-01'),
          lastLoginAt: new Date(Date.now() - 10 * 60 * 1000),
          analysisCount: 0,
          status: 'active'
        },
        {
          id: '5',
          name: 'Inactive User',
          email: 'inactive@email.com',
          role: 'USER',
          subscriptionTier: 'free',
          emailSubscribed: false,
          createdAt: new Date('2023-12-01'),
          lastLoginAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          analysisCount: 12,
          status: 'inactive'
        }
      ]
      setUsers(mockUsers)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    const matchesPlan = selectedPlan === 'all' || user.subscriptionTier === selectedPlan
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus
    
    return matchesSearch && matchesRole && matchesPlan && matchesStatus
  })

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
  const startIndex = (currentPage - 1) * usersPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage)

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge className="bg-red-100 text-red-800"><Shield className="h-3 w-3 mr-1" />Admin</Badge>
      case 'ANALYST':
        return <Badge className="bg-blue-100 text-blue-800">Analyst</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">User</Badge>
    }
  }

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return <Badge className="bg-purple-100 text-purple-800"><Crown className="h-3 w-3 mr-1" />Enterprise</Badge>
      case 'pro':
        return <Badge className="bg-yellow-100 text-yellow-800"><Crown className="h-3 w-3 mr-1" />Pro</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Free</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800"><Ban className="h-3 w-3 mr-1" />Suspended</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000)
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage user accounts and subscriptions</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Crown className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Paid Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.subscriptionTier !== 'free').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Subscribers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.emailSubscribed).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="ANALYST">Analyst</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="plan">Plan</Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            <Button variant="outline" size="sm" onClick={loadUsers}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-700">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">{user.name}</h3>
                        {getRoleBadge(user.role)}
                        {getPlanBadge(user.subscriptionTier)}
                        {getStatusBadge(user.status)}
                      </div>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span>Joined {formatDate(user.createdAt)}</span>
                        {user.lastLoginAt && (
                          <span>Last login {getTimeAgo(user.lastLoginAt)}</span>
                        )}
                        <span>{user.analysisCount} analyses</span>
                        {user.emailSubscribed && (
                          <span className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            Subscribed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
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
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}