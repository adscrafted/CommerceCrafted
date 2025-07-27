'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Package, BarChart3, Image as ImageIcon, Settings } from 'lucide-react'
import MainImagePuller from '../../components/MainImagePuller'

interface NicheDetailPageProps {
  params: Promise<{ id: string }>
}

export default function NicheDetailPage({ params }: NicheDetailPageProps) {
  const router = useRouter()
  const [niche, setNiche] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadNiche() {
      const { id } = await params
      const supabase = createClient()

      // Fetch niche details
      const { data: nicheData, error: nicheError } = await supabase
        .from('niches')
        .select('*')
        .eq('id', id)
        .single()

      if (nicheError) {
        console.error('Error fetching niche:', nicheError)
        setLoading(false)
        return
      }

      if (!nicheData) {
        console.error('No niche data found for ID:', id)
        setLoading(false)
        return
      }

      console.log('Loaded niche:', nicheData)
      setNiche(nicheData)
      
      // Fetch products by ASINs
      const asins = nicheData.asins ? nicheData.asins.split(',').map((asin: string) => asin.trim()) : []
      
      if (asins.length > 0) {
        const { data: productsData, error: productsError } = await supabase
          .from('product')
          .select('*')
          .in('asin', asins)
        
        if (productsError) {
          console.error('Error fetching products:', productsError)
        } else {
          setProducts(productsData || [])
        }
      }
      
      setLoading(false)
    }

    loadNiche()
  }, [params])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!niche) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Niche not found</h2>
          <Button onClick={() => router.push('/admin/niche')}>
            Back to Niches
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/niche')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Niches
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{niche.niche_name || niche.name}</h1>
            <p className="text-gray-600">{niche.description}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={niche.status === 'completed' ? 'default' : 'secondary'}>
              {niche.status}
            </Badge>
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/niche/edit/${niche.id}`)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Edit Niche
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.length > 0
                ? (products.reduce((sum, p) => sum + (p.rating || 0), 0) / products.length).toFixed(1)
                : '0.0'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${products.length > 0
                ? (products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length).toFixed(2)
                : '0.00'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.reduce((sum, p) => sum + (p.review_count || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">
            <Package className="mr-2 h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="images">
            <ImageIcon className="mr-2 h-4 w-4" />
            Image Puller
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Products in this Niche</CardTitle>
              <CardDescription>
                All products that have been added to this niche
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div>
                        <h3 className="font-medium">{product.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>ASIN: {product.asin}</span>
                          <span>${product.price}</span>
                          <span>⭐ {product.rating}</span>
                          <span>{product.review_count} reviews</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/products/${product.asin}`)}
                    >
                      View Details
                    </Button>
                  </div>
                ))}
                {products.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No products added to this niche yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          {niche && niche.id ? (
            <MainImagePuller nicheId={niche.id} nicheName={niche.niche_name || niche.name || 'Unnamed Niche'} />
          ) : (
            <div className="text-center py-12 text-gray-500">
              Loading niche data...
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Niche Analytics</CardTitle>
              <CardDescription>
                Performance metrics and insights for this niche
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                Analytics coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}