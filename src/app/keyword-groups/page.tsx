'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Plus, 
  Search, 
  Trash2, 
  RefreshCw, 
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'

interface KeywordGroup {
  id: string
  name: string
  marketplace: string
  status: string
  asins: string[]
  total_keywords_found: number
  total_keywords_processed: number
  created_at: string
  completed_at: string | null
}

export default function KeywordGroupsPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<KeywordGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Create group dialog state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [asins, setAsins] = useState('')

  // Fetch keyword groups
  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/keyword-groups')
      if (!response.ok) throw new Error('Failed to fetch groups')
      
      const data = await response.json()
      setGroups(data.groups || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load keyword groups')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  // Create new group
  const handleCreateGroup = async () => {
    if (!groupName.trim() || !asins.trim()) {
      setError('Please enter a group name and at least one ASIN')
      return
    }

    setCreateLoading(true)
    setError(null)

    try {
      const asinList = asins.trim()
        .split(/[,\s]+/)
        .map(a => a.trim())
        .filter(a => a.length > 0)

      const response = await fetch('/api/keyword-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: groupName,
          asins: asinList,
          marketplace: 'US'
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create group')
      }

      setIsCreateOpen(false)
      setGroupName('')
      setAsins('')
      await fetchGroups()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group')
    } finally {
      setCreateLoading(false)
    }
  }

  // Delete group
  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this keyword group?')) return

    try {
      const response = await fetch(`/api/keyword-groups?id=${groupId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete group')
      
      await fetchGroups()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete group')
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Filter groups
  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.asins.some(asin => asin.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Keyword Groups</h1>
        <p className="text-muted-foreground">
          Process and analyze keyword targets for multiple ASINs
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Actions Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search groups or ASINs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Keyword Group</DialogTitle>
              <DialogDescription>
                Process keyword targets for a group of ASINs
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="group-name">Group Name</Label>
                <Input
                  id="group-name"
                  placeholder="e.g., Wireless Headphones Q4 2024"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="asins">ASINs (comma or space separated)</Label>
                <textarea
                  id="asins"
                  className="w-full min-h-[100px] px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-input bg-background rounded-md"
                  placeholder="Enter ASINs separated by commas or spaces&#10;e.g., B014LDT0ZM, B08N5WRWNW, B07FZ8S74R"
                  value={asins}
                  onChange={(e) => setAsins(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {asins.trim() && `${asins.trim().split(/[,\s]+/).filter(a => a.length > 0).length} ASIN(s) entered`}
                </p>
              </div>
              <Button
                onClick={handleCreateGroup}
                disabled={createLoading || !groupName.trim() || !asins.trim()}
                className="w-full"
              >
                {createLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Group'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Groups Grid */}
      {filteredGroups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No keyword groups found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first keyword group to get started'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Group
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map((group) => (
            <Card key={group.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {group.asins.length} ASIN{group.asins.length !== 1 ? 's' : ''} • {group.marketplace}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(group.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(group.status)}
                      {group.status}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Keywords Count */}
                  {group.status === 'completed' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Keywords Found:</span>
                      <span className="font-medium">{group.total_keywords_processed.toLocaleString()}</span>
                    </div>
                  )}

                  {/* ASINs Preview */}
                  <div className="text-sm">
                    <span className="text-muted-foreground">ASINs:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {group.asins.slice(0, 3).map((asin) => (
                        <Badge key={asin} variant="secondary" className="text-xs">
                          {asin}
                        </Badge>
                      ))}
                      {group.asins.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{group.asins.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className="text-sm text-muted-foreground">
                    Created {format(new Date(group.created_at), 'MMM d, yyyy')}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {group.status === 'completed' ? (
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        onClick={() => router.push(`/keyword-groups/${group.id}`)}
                      >
                        View Results
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    ) : group.status === 'processing' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => router.push(`/keyword-groups/${group.id}`)}
                      >
                        View Progress
                        <RefreshCw className="h-4 w-4 ml-1" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        disabled
                      >
                        {group.status === 'failed' ? 'Processing Failed' : 'Pending'}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteGroup(group.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}