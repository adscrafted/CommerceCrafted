'use client'

import React, { useState } from 'react'
import ProductManagement from '@/components/ProductManagement'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Database,
  Upload,
  Download,
  Calendar,
  BarChart3,
  Settings,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Package,
  Clock,
  Target,
  RefreshCw,
  FileText,
  Activity,
  Plus
} from 'lucide-react'

export default function ProductsPage() {
  const [userRole, setUserRole] = useState<'admin' | 'analyst' | 'user'>('admin')
  const [importProgress, setImportProgress] = useState(0)
  const [isImporting, setIsImporting] = useState(false)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsImporting(true)
      setImportProgress(0)
      
      // Simulate import progress
      const interval = setInterval(() => {
        setImportProgress(prev => {
          const next = prev + Math.random() * 15
          if (next >= 100) {
            clearInterval(interval)
            setIsImporting(false)
            return 100
          }
          return next
        })
      }, 200)
    }
  }

  const downloadTemplate = () => {
    // In production, this would use the ProductImportService
    const csvContent = `asin,title,category,brand,price,tags
B08N5WRWNW,Wireless Bluetooth Headphones,Electronics,TechSound,79.99,audio;wireless
B07X8K9PQR,Smart Security Camera,Electronics,SecureVision,149.99,security;smart-home
B09M8N7K6L,Ergonomic Office Chair,Home & Office,ComfortDesk,199.99,office;furniture`
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'product-import-template.csv'
    link.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Product Management System</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive product database management with automated analysis scheduling and bulk operations
          </p>
          
          {/* Role Switcher for Demo */}
          <div className="flex justify-center space-x-2">
            <Button 
              variant={userRole === 'user' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUserRole('user')}
            >
              User View
            </Button>
            <Button 
              variant={userRole === 'analyst' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUserRole('analyst')}
            >
              Analyst View
            </Button>
            <Button 
              variant={userRole === 'admin' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUserRole('admin')}
            >
              Admin View
            </Button>
          </div>
        </div>

        <Tabs defaultValue="management" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="management">Product Management</TabsTrigger>
            <TabsTrigger value="import-export">Import/Export</TabsTrigger>
            <TabsTrigger value="scheduling">Analysis Scheduling</TabsTrigger>
            <TabsTrigger value="features">System Features</TabsTrigger>
          </TabsList>

          {/* Product Management Tab */}
          <TabsContent value="management">
            <ProductManagement userRole={userRole} />
          </TabsContent>

          {/* Import/Export Tab */}
          <TabsContent value="import-export" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Import Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="h-5 w-5 text-blue-600 mr-2" />
                    Import Products
                  </CardTitle>
                  <CardDescription>
                    Bulk import products from CSV files or Amazon API
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isImporting ? (
                    <>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">
                          Drag and drop your CSV file here, or click to browse
                        </p>
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="file-upload"
                        />
                        <label htmlFor="file-upload">
                          <Button variant="outline" className="cursor-pointer">
                            Choose File
                          </Button>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Need a template?</span>
                        <Button variant="outline" size="sm" onClick={downloadTemplate}>
                          <Download className="h-4 w-4 mr-2" />
                          Download Template
                        </Button>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Supported Import Methods</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• CSV file upload (bulk import)</li>
                          <li>• Amazon SP-API integration</li>
                          <li>• Manual product entry</li>
                          <li>• Third-party tool integration</li>
                        </ul>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center">
                        <RefreshCw className="h-8 w-8 text-blue-600 mx-auto mb-2 animate-spin" />
                        <p className="text-sm text-gray-600">Processing import...</p>
                      </div>
                      <Progress value={importProgress} className="w-full" />
                      <p className="text-sm text-center text-gray-600">
                        {Math.round(importProgress)}% complete
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Export Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Download className="h-5 w-5 text-green-600 mr-2" />
                    Export Products
                  </CardTitle>
                  <CardDescription>
                    Export product data in various formats
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                    <Button variant="outline" size="sm">
                      <Database className="h-4 w-4 mr-2" />
                      JSON
                    </Button>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Export Fields</label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {['ASIN', 'Title', 'Category', 'Brand', 'Price', 'Rating', 'Analysis Data', 'Tags'].map(field => (
                          <label key={field} className="flex items-center text-sm">
                            <input type="checkbox" defaultChecked className="mr-2" />
                            {field}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Filters</label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <select className="text-sm border border-gray-300 rounded px-2 py-1">
                          <option>All Categories</option>
                          <option>Electronics</option>
                          <option>Home & Garden</option>
                        </select>
                        <select className="text-sm border border-gray-300 rounded px-2 py-1">
                          <option>All Status</option>
                          <option>Active</option>
                          <option>Inactive</option>
                        </select>
                      </div>
                    </div>

                    <Button className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Export Selected Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Import/Export Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Import/Export Analytics</CardTitle>
                <CardDescription>Track import success rates and data processing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Upload className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-900">147</div>
                    <div className="text-sm text-blue-700">Total Imports</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-900">94.2%</div>
                    <div className="text-sm text-green-700">Success Rate</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Clock className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-900">2.3m</div>
                    <div className="text-sm text-purple-700">Avg Processing</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Database className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-orange-900">1,247</div>
                    <div className="text-sm text-orange-700">Products Added</div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Recent Import Activity</h4>
                  <div className="space-y-2">
                    {[
                      { date: 'Today', products: 45, source: 'CSV Upload', status: 'completed' },
                      { date: 'Yesterday', products: 32, source: 'Amazon API', status: 'completed' },
                      { date: '2 days ago', products: 67, source: 'CSV Upload', status: 'completed' },
                      { date: '3 days ago', products: 23, source: 'Manual Entry', status: 'failed' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <span className="text-sm font-medium">{activity.date}</span>
                          <Badge variant="secondary">{activity.source}</Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{activity.products} products</div>
                          <div className={`text-xs ${
                            activity.status === 'completed' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {activity.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Scheduling Tab */}
          <TabsContent value="scheduling" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                    Analysis Schedules
                  </CardTitle>
                  <CardDescription>
                    Automated analysis scheduling for product monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { type: 'Daily Updates', count: 342, description: 'Price, BSR, reviews tracking' },
                      { type: 'Weekly Deep Analysis', count: 89, description: 'Full market analysis refresh' },
                      { type: 'Monthly Reviews', count: 156, description: 'Comprehensive opportunity scoring' },
                      { type: 'Custom Schedules', count: 23, description: 'User-defined analysis frequency' }
                    ].map((schedule, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{schedule.type}</h4>
                          <p className="text-sm text-gray-600">{schedule.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">{schedule.count}</div>
                          <div className="text-xs text-gray-500">active</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Schedule
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 text-green-600 mr-2" />
                    Processing Queue
                  </CardTitle>
                  <CardDescription>
                    Current analysis jobs and processing status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { id: 'job-001', product: 'Wireless Headphones', status: 'processing', progress: 65 },
                      { id: 'job-002', product: 'Security Camera', status: 'queued', progress: 0 },
                      { id: 'job-003', product: 'Office Chair', status: 'completed', progress: 100 },
                      { id: 'job-004', product: 'Kitchen Knife Set', status: 'failed', progress: 0 }
                    ].map((job, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{job.product}</span>
                          <Badge className={
                            job.status === 'completed' ? 'bg-green-100 text-green-800' :
                            job.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            job.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {job.status}
                          </Badge>
                        </div>
                        {job.status === 'processing' && (
                          <Progress value={job.progress} className="h-2" />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-blue-600">12</div>
                        <div className="text-xs text-gray-600">Processing</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-600">45</div>
                        <div className="text-xs text-gray-600">Queued</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">234</div>
                        <div className="text-xs text-gray-600">Completed</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Schedule Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Schedule Performance Metrics</CardTitle>
                <CardDescription>Analysis completion rates and timing statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Completion Rates</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Daily Updates</span>
                        <span className="font-medium">98.5%</span>
                      </div>
                      <Progress value={98.5} className="h-2" />
                      
                      <div className="flex justify-between text-sm">
                        <span>Weekly Analysis</span>
                        <span className="font-medium">94.2%</span>
                      </div>
                      <Progress value={94.2} className="h-2" />
                      
                      <div className="flex justify-between text-sm">
                        <span>Monthly Reviews</span>
                        <span className="font-medium">96.7%</span>
                      </div>
                      <Progress value={96.7} className="h-2" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Average Processing Time</h4>
                    <div className="space-y-3">
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <div className="text-xl font-bold text-blue-900">2.3m</div>
                        <div className="text-sm text-blue-700">Daily Updates</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded">
                        <div className="text-xl font-bold text-green-900">8.7m</div>
                        <div className="text-sm text-green-700">Deep Analysis</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">System Health</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">API Uptime</span>
                        <Badge className="bg-green-100 text-green-800">99.9%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Queue Status</span>
                        <Badge className="bg-blue-100 text-blue-800">Healthy</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Failed Jobs</span>
                        <Badge className="bg-yellow-100 text-yellow-800">0.8%</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 text-blue-500 mr-2" />
                    Database Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Advanced product filtering and search</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Bulk operations for multiple products</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Real-time status tracking and updates</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Product categorization and tagging</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Duplicate detection and management</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="h-5 w-5 text-green-500 mr-2" />
                    Import/Export System
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">CSV file upload with validation</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Amazon SP-API direct integration</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Multiple export formats (CSV, JSON, Excel)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Error reporting and data validation</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Import progress tracking</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 text-purple-500 mr-2" />
                    Analysis Scheduling
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Automated daily, weekly, monthly analysis</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Custom frequency scheduling</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Priority-based processing queue</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Failure retry mechanisms</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Performance monitoring and alerts</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 text-orange-500 mr-2" />
                    Analytics & Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Real-time processing metrics</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Import/export success tracking</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">System health monitoring</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Performance optimization insights</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Historical data analysis</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Implementation Status */}
            <Card>
              <CardHeader>
                <CardTitle>Implementation Status</CardTitle>
                <CardDescription>Current status of product management system components</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { feature: 'Product Management Interface', status: 'completed', description: 'Advanced product listing and management UI' },
                    { feature: 'Bulk Operations System', status: 'completed', description: 'Multi-select and bulk action capabilities' },
                    { feature: 'Import/Export Service', status: 'completed', description: 'CSV and API-based import/export functionality' },
                    { feature: 'Analysis Scheduling', status: 'completed', description: 'Automated analysis job scheduling system' },
                    { feature: 'Search & Filtering', status: 'completed', description: 'Advanced product search and filtering' },
                    { feature: 'Progress Tracking', status: 'completed', description: 'Real-time import and analysis progress' },
                    { feature: 'Amazon API Integration', status: 'pending', description: 'SP-API connection for live data' },
                    { feature: 'Background Job Processing', status: 'pending', description: 'Queue system for long-running tasks' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.feature}</h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                      <Badge className={item.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {item.status === 'completed' ? (
                          <><CheckCircle className="h-3 w-3 mr-1" /> Completed</>
                        ) : (
                          <><AlertCircle className="h-3 w-3 mr-1" /> Pending</>
                        )}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}