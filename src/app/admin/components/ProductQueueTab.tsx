'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import {
  Plus,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Trash2,
  Edit,
  Eye
} from 'lucide-react'

interface NicheQueueItem {
  id: string
  nicheName: string
  asins: string[]
  status: 'pending' | 'analyzing' | 'completed' | 'scheduled'
  addedDate: string
  scheduledDate: string
  category: string
  totalProducts: number
  avgBsr: number
  avgPrice: number
  avgRating: number
  totalReviews: number
  totalMonthlyRevenue: number
  opportunityScore?: number
  competitionLevel: string
  processTime?: string
  analystAssigned?: string
  nicheKeywords: string[]
  marketSize: number
}

export default function ProductQueueTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const [newNicheName, setNewNicheName] = useState('')
  const [newAsins, setNewAsins] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [nicheQueue, setNicheQueue] = useState<NicheQueueItem[]>([])

  useEffect(() => {
    fetchNiches()
  }, [])

  const fetchNiches = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/niches', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      if (!response.ok) {
        console.error('Niches API error:', response.status, response.statusText)
        // For now, just use empty array if API fails
        setNicheQueue([])
      } else {
        const niches = await response.json()
        setNicheQueue(niches)
      }
    } catch (error) {
      console.error('Error fetching niches:', error)
      setNicheQueue([]) // Use empty array on error
    } finally {
      setLoading(false)
    }
  }

  const handleAddNiche = async () => {
    if (!newNicheName || !newAsins || !selectedDate) return

    const asinList = newAsins.split(',').map(asin => asin.trim()).filter(asin => asin.length > 0)
    if (asinList.length === 0) return

    try {
      const response = await fetch('/api/admin/niches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nicheName: newNicheName,
          asins: newAsins,
          scheduledDate: selectedDate
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create niche')
      }

      const newNiche = await response.json()
      setNicheQueue([...nicheQueue, newNiche])
      setNewNicheName('')
      setNewAsins('')
      setSelectedDate('')
    } catch (error) {
      console.error('Error creating niche:', error)
      alert('Failed to create niche. Please try again.')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/niches/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete niche')
      }

      setNicheQueue(nicheQueue.filter(item => item.id !== id))
    } catch (error) {
      console.error('Error deleting niche:', error)
      alert('Failed to delete niche. Please try again.')
    }
  }

  const handleAnalyzeNow = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/niches/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'analyzing'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update niche status')
      }

      setNicheQueue(nicheQueue.map(item => 
        item.id === id ? { ...item, status: 'analyzing' } : item
      ))
    } catch (error) {
      console.error('Error updating niche status:', error)
      alert('Failed to update niche status. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'analyzing': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'scheduled': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'analyzing': return <RefreshCw className="h-4 w-4 animate-spin" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'failed': return <AlertCircle className="h-4 w-4" />
      default: return null
    }
  }

  const filteredQueue = nicheQueue.filter(item =>
    item.nicheName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.asins.some(asin => asin.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add New Niche */}
      <Card>
        <CardHeader>
          <CardTitle>Add Niche to Queue</CardTitle>
          <CardDescription>Schedule a collection of related products for deep research analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nicheName" className="text-sm font-medium text-gray-700">Niche Name</Label>
                <Input
                  id="nicheName"
                  placeholder="e.g., Bluetooth Sleep Masks"
                  value={newNicheName}
                  onChange={(e) => setNewNicheName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium text-gray-700">Scheduled Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="asins" className="text-sm font-medium text-gray-700">Amazon ASINs (comma-separated)</Label>
              <Input
                id="asins"
                placeholder="e.g., B08MVBRNKV, B07SHBQY7Z, B07KC5DWCC"
                value={newAsins}
                onChange={(e) => setNewAsins(e.target.value)}
                className="font-mono mt-1"
              />
              <p className="text-sm text-gray-500 mt-2">Enter 3-10 related ASINs separated by commas</p>
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={handleAddNiche} disabled={!newNicheName || !newAsins || !selectedDate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Niche to Queue
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Niche Queue Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Niche Queue</CardTitle>
              <CardDescription>Manage scheduled niche analyses</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search niches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-y">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niche Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ASINs</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQueue.map((niche) => (
                  <tr key={niche.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{niche.nicheName}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs text-gray-600 font-mono">
                        {niche.asins.slice(0, 2).join(', ')}
                        {niche.asins.length > 2 && ` +${niche.asins.length - 2} more`}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{niche.totalProducts}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge className={getStatusColor(niche.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(niche.status)}
                          {niche.status}
                        </span>
                      </Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(niche.scheduledDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {niche.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAnalyzeNow(niche.id)}
                          >
                            Process
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(niche.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}