'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  Camera,
  Package,
  Loader2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  X,
  CheckCircle,
  Maximize2,
  Minimize2
} from 'lucide-react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

interface Product {
  id: string
  asin: string
  title: string
  mainImage: string
  secondaryImages: string[]
  totalImages: number
}

interface SecondaryImagePullerProps {
  nicheId: string
  nicheName: string
}

export default function SecondaryImagePuller({ nicheId, nicheName }: SecondaryImagePullerProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [showAll, setShowAll] = useState(true)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [maxImages, setMaxImages] = useState(0)
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (nicheId) {
      fetchSecondaryImages()
    } else {
      console.log('No nicheId provided to SecondaryImagePuller')
      setLoading(false)
    }
  }, [nicheId])

  const fetchSecondaryImages = async () => {
    if (!nicheId) {
      console.error('Cannot fetch secondary images: nicheId is missing')
      return
    }
    
    try {
      setLoading(true)
      console.log('Fetching secondary images for nicheId:', nicheId)
      const response = await fetch(`/api/admin/niches/${nicheId}/secondary-images`)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Failed to fetch secondary images:', errorData)
        throw new Error(errorData.error || 'Failed to fetch secondary images')
      }
      
      const data = await response.json()
      console.log('Received secondary images data:', data)
      setProducts(data.products || [])
      
      // Find the maximum number of secondary images across all products
      const max = data.products ? data.products.reduce((max: number, p: Product) => 
        Math.max(max, p.secondaryImages ? p.secondaryImages.length : 0), 0
      ) : 0
      
      console.log('Maximum secondary images found:', max)
      console.log('First product secondary images:', data.products?.[0]?.secondaryImages)
      setMaxImages(max)
    } catch (error) {
      console.error('Error fetching secondary images:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleImageSelection = (imageKey: string) => {
    const newSelection = new Set(selectedImages)
    if (newSelection.has(imageKey)) {
      newSelection.delete(imageKey)
    } else {
      newSelection.add(imageKey)
    }
    setSelectedImages(newSelection)
  }

  const selectAll = () => {
    const allImageKeys = new Set<string>()
    products.forEach(product => {
      product.secondaryImages.forEach((_, index) => {
        allImageKeys.add(`${product.id}_${index}`)
      })
    })
    setSelectedImages(allImageKeys)
  }

  const deselectAll = () => {
    setSelectedImages(new Set())
  }

  const downloadImage = async (imageUrl: string, asin: string, position: number) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const filename = `${asin}_secondary_${position}.jpg`
      saveAs(blob, filename)
    } catch (error) {
      console.error('Error downloading image:', error)
    }
  }

  const downloadSelectedImages = async () => {
    if (selectedImages.size === 0) return
    
    setDownloading(true)
    const zip = new JSZip()

    try {
      for (const imageKey of selectedImages) {
        const [productId, imageIndex] = imageKey.split('_')
        const product = products.find(p => p.id === productId)
        if (product && product.secondaryImages[parseInt(imageIndex)]) {
          try {
            const response = await fetch(product.secondaryImages[parseInt(imageIndex)])
            const blob = await response.blob()
            const filename = `${product.asin}_secondary_${parseInt(imageIndex) + 2}.jpg`
            zip.file(filename, blob)
          } catch (error) {
            console.error(`Failed to download image for ${product.asin} position ${parseInt(imageIndex) + 2}:`, error)
          }
        }
      }

      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, `${nicheName.replace(/[^a-z0-9]/gi, '_')}_secondary_images.zip`)
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
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No niche selected</p>
            <p className="text-sm text-gray-500 mt-2">Please select a niche to view secondary images</p>
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
            <h3 className="text-lg font-semibold">Secondary Product Images</h3>
            <p className="text-sm text-gray-600 mt-1">
              Compare secondary images across products in a grid layout
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const totalImages = products.reduce((sum, p) => sum + p.secondaryImages.length, 0)
                if (selectedImages.size === totalImages) {
                  deselectAll()
                } else {
                  selectAll()
                }
              }}
            >
              {selectedImages.size === products.reduce((sum, p) => sum + p.secondaryImages.length, 0) ? 'Deselect All' : 'Select All'}
            </Button>
            <Button
              size="sm"
              onClick={downloadSelectedImages}
              disabled={selectedImages.size === 0 || downloading}
            >
              {downloading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download Selected ({selectedImages.size})
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
      {maxImages > 0 ? (
        <div className={isFullscreen 
          ? "fixed inset-0 z-50 bg-gray-50 overflow-hidden" 
          : ""
        }>
          {isFullscreen && (
            <div className="absolute top-0 left-0 right-0 bg-white border-b p-4 flex justify-between items-center z-30">
              <h3 className="text-lg font-semibold">Secondary Product Images</h3>
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
            ? "bg-white h-screen overflow-x-auto overflow-y-auto"
            : "bg-white rounded-lg border overflow-x-auto overflow-y-auto relative max-h-[800px]"
          }>
            <table className="w-full">
            <thead className="sticky top-0 z-20">
              <tr className="border-b bg-white">
                <th className="p-4 text-left text-sm font-medium text-gray-700 sticky left-0 bg-white z-30">Position</th>
                {displayedProducts.map((product) => (
                  <th key={product.id} className="p-4 text-center bg-white">
                    <Badge variant="secondary" className="text-xs">
                      {product.asin}
                    </Badge>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: maxImages }, (_, i) => i).map((imageIndex) => (
                <tr key={imageIndex} className="border-b">
                  <td className="p-4 text-sm font-medium text-gray-700 sticky left-0 bg-gray-50 z-10">
                    Image #{imageIndex + 2}
                  </td>
                  {displayedProducts.map((product) => (
                    <td key={product.id} className="p-4">
                      {product.secondaryImages[imageIndex] ? (
                        <div className="relative group">
                          <div 
                            className={`aspect-square bg-white border-2 rounded-lg overflow-hidden w-72 h-72 mx-auto cursor-pointer transition-all ${
                              selectedImages.has(`${product.id}_${imageIndex}`) 
                                ? 'border-blue-500 shadow-md' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => toggleImageSelection(`${product.id}_${imageIndex}`)}
                          >
                            {/* Selection Indicator */}
                            <div className={`absolute top-2 right-2 z-10 transition-opacity ${
                              selectedImages.has(`${product.id}_${imageIndex}`) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                selectedImages.has(`${product.id}_${imageIndex}`) 
                                  ? 'bg-blue-500 text-white' 
                                  : 'bg-white border-2 border-gray-300'
                              }`}>
                                {selectedImages.has(`${product.id}_${imageIndex}`) && (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                              </div>
                            </div>
                            
                            <img
                              src={product.secondaryImages[imageIndex]}
                              alt={`${product.asin} secondary ${imageIndex + 2}`}
                              className="w-full h-full object-contain p-2"
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/300x300?text=No+Image'
                              }}
                            />
                          </div>
                          {/* Action Buttons */}
                          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-7 w-7 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setPreviewImage(product.secondaryImages[imageIndex])
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
                                  downloadImage(product.secondaryImages[imageIndex], product.asin, imageIndex + 2)
                                }}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No Secondary Images Available</p>
              <p className="text-sm text-gray-500 mt-2 max-w-md">
                The products in this niche currently only have main images stored. 
                Secondary images would need to be fetched from an external data source like Keepa API.
              </p>
            </div>
          </CardContent>
        </Card>
      )}


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