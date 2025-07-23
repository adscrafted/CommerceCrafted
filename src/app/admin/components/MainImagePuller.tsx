'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Download, 
  Image as ImageIcon, 
  Package,
  AlertCircle,
  CheckCircle,
  X,
  ExternalLink,
  Loader2,
  Grid3x3,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2
} from 'lucide-react'
import Image from 'next/image'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

interface Product {
  id: string
  asin: string
  title: string
  image_url: string
  price: number
  bsr: number
  rating: number
  review_count: number
}

interface MainImagePullerProps {
  nicheId: string
  nicheName: string
}

export default function MainImagePuller({ nicheId, nicheName }: MainImagePullerProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [downloading, setDownloading] = useState(false)
  const [showAll, setShowAll] = useState(true)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (nicheId) {
      fetchProducts()
    } else {
      console.log('No nicheId provided to MainImagePuller')
      setLoading(false)
    }
  }, [nicheId])

  const fetchProducts = async () => {
    if (!nicheId) {
      console.error('Cannot fetch products: nicheId is missing')
      return
    }
    
    try {
      setLoading(true)
      console.log('Fetching products for nicheId:', nicheId)
      const response = await fetch(`/api/admin/niches/${nicheId}/products`)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Failed to fetch products:', errorData)
        throw new Error(errorData.error || 'Failed to fetch products')
      }
      
      const data = await response.json()
      console.log('Received products:', data)
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleProductSelection = (productId: string) => {
    const newSelection = new Set(selectedProducts)
    if (newSelection.has(productId)) {
      newSelection.delete(productId)
    } else {
      newSelection.add(productId)
    }
    setSelectedProducts(newSelection)
  }

  const selectAll = () => {
    const allIds = new Set(products.map(p => p.id))
    setSelectedProducts(allIds)
  }

  const deselectAll = () => {
    setSelectedProducts(new Set())
  }

  const downloadImage = async (product: Product) => {
    try {
      const response = await fetch(product.image_url)
      const blob = await response.blob()
      const filename = `${product.asin}_${product.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50)}.jpg`
      saveAs(blob, filename)
    } catch (error) {
      console.error('Error downloading image:', error)
    }
  }

  const downloadSelectedImages = async () => {
    if (selectedProducts.size === 0) return

    setDownloading(true)
    const zip = new JSZip()
    const selectedProductsList = products.filter(p => selectedProducts.has(p.id))

    try {
      for (const product of selectedProductsList) {
        try {
          const response = await fetch(product.image_url)
          const blob = await response.blob()
          const filename = `${product.asin}_${product.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50)}.jpg`
          zip.file(filename, blob)
        } catch (error) {
          console.error(`Failed to download image for ${product.asin}:`, error)
        }
      }

      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, `${nicheName.replace(/[^a-z0-9]/gi, '_')}_product_images.zip`)
    } catch (error) {
      console.error('Error creating zip:', error)
    } finally {
      setDownloading(false)
    }
  }

  const displayedProducts = products

  if (!nicheId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No niche selected</p>
            <p className="text-sm text-gray-500 mt-2">Please select a niche to view product images</p>
          </div>
        </CardContent>
      </Card>
    )
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Product Images ({products.length})</h3>
            <p className="text-sm text-gray-600 mt-1">
              Download high-quality product images for marketing materials
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={selectedProducts.size === products.length ? deselectAll : selectAll}
            >
              {selectedProducts.size === products.length ? 'Deselect All' : 'Select All'}
            </Button>
            <Button
              size="sm"
              onClick={downloadSelectedImages}
              disabled={selectedProducts.size === 0 || downloading}
            >
              {downloading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download Selected ({selectedProducts.size})
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="h-4 w-4 mr-2" />
                  Exit Fullscreen
                </>
              ) : (
                <>
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Expand
                </>
              )}
            </Button>
          </div>
        </div>

      </div>

      {/* Image Grid */}
      <div className={isFullscreen 
        ? "fixed inset-0 z-50 bg-gray-50 overflow-hidden" 
        : ""
      }>
        {isFullscreen && (
          <div className="absolute top-0 left-0 right-0 bg-white border-b p-4 flex justify-between items-center z-30">
            <h3 className="text-lg font-semibold">Product Images</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(false)}
            >
              <Minimize2 className="h-4 w-4 mr-2" />
              Exit Fullscreen
            </Button>
          </div>
        )}
        <div className={isFullscreen 
          ? "bg-white h-screen overflow-auto p-6 pt-20"
          : ""
        }>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayedProducts.map((product) => (
          <div key={product.id} className="group relative">
            <div 
              className={`relative overflow-hidden rounded-lg border-2 transition-all cursor-pointer ${
                selectedProducts.has(product.id) 
                  ? 'border-blue-500 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleProductSelection(product.id)}
            >
              {/* Selection Indicator */}
              <div className={`absolute top-2 right-2 z-10 transition-opacity ${
                selectedProducts.has(product.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  selectedProducts.has(product.id) 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white border-2 border-gray-300'
                }`}>
                  {selectedProducts.has(product.id) && (
                    <CheckCircle className="h-4 w-4" />
                  )}
                </div>
              </div>

              {/* Image */}
              <div className="aspect-square bg-white p-2">
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/300x300?text=No+Image'
                  }}
                />
              </div>

              {/* ASIN Badge Only */}
              <div className="p-2 bg-gray-50">
                <Badge variant="secondary" className="text-xs w-full justify-center">
                  {product.asin}
                </Badge>
              </div>

              {/* Action Buttons */}
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPreviewImage(product.image_url)
                    }}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      downloadImage(product)
                    }}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
          </div>
        </div>
      </div>


      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <Button
              variant="secondary"
              size="sm"
              className="absolute -top-10 right-0 text-white hover:text-gray-200"
              onClick={() => setPreviewImage(null)}
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain bg-white rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  )
}