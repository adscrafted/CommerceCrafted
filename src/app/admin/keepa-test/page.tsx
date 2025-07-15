'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

export default function KeepaTestPage() {
  const [asin, setAsin] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testKeepaFetch = async () => {
    if (!asin.trim()) {
      setError('Please enter a valid ASIN')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/keepa/fetch-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ asin: asin.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch product data')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const checkProduct = async () => {
    if (!asin.trim()) {
      setError('Please enter a valid ASIN')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`/api/keepa/fetch-product?asin=${asin.trim()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check product')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Keepa Integration Test</CardTitle>
          <CardDescription>
            Test the Keepa API integration by entering an Amazon ASIN
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter ASIN (e.g., B08N5WRWNW)"
              value={asin}
              onChange={(e) => setAsin(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && testKeepaFetch()}
            />
            <Button onClick={checkProduct} variant="outline" disabled={loading}>
              Check Existing
            </Button>
            <Button onClick={testKeepaFetch} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Fetch from Keepa
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  Data source: {result.source === 'cache' ? 'Cached' : 'Fresh from API'}
                </AlertDescription>
              </Alert>

              {result.exists !== undefined && (
                <Card>
                  <CardHeader>
                    <CardTitle>Product Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Product exists in database: {result.exists ? 'Yes' : 'No'}</p>
                    {result.lastSync && (
                      <p>Last synced: {new Date(result.lastSync).toLocaleString()}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {result.data && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Product Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div><strong>ASIN:</strong> {result.data.asin}</div>
                      <div><strong>Title:</strong> {result.data.title}</div>
                      <div><strong>Brand:</strong> {result.data.brand || 'N/A'}</div>
                      {result.data.brandStoreName && (
                        <div><strong>Brand Store:</strong> {result.data.brandStoreName}</div>
                      )}
                      <div><strong>Category:</strong> {result.data.category || 'N/A'}</div>
                      <div><strong>Subcategory:</strong> {result.data.subcategory || 'N/A'}</div>
                      <div><strong>Product Group:</strong> {result.data.productGroup || 'N/A'}</div>
                      <div><strong>Product Type:</strong> {result.data.productGroupType || 'N/A'}</div>
                      <div><strong>Price:</strong> ${result.data.currentPrice || 'N/A'}</div>
                      <div><strong>Rating:</strong> {result.data.currentRating || 'N/A'} / 5</div>
                      <div><strong>Reviews:</strong> {result.data.currentReviewCount?.toLocaleString() || 0}</div>
                      <div><strong>BSR:</strong> {result.data.currentBsr?.toLocaleString() || 'N/A'}</div>
                      {result.data.parentAsin && (
                        <div><strong>Parent ASIN:</strong> {result.data.parentAsin}</div>
                      )}
                      {result.data.listedSince && (
                        <div><strong>Listed Since:</strong> {new Date(result.data.listedSince).toLocaleDateString()}</div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Product Dimensions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div><strong>Length:</strong> {result.data.dimensions?.length ? `${result.data.dimensions.length} mm` : 'N/A'}</div>
                      <div><strong>Width:</strong> {result.data.dimensions?.width ? `${result.data.dimensions.width} mm` : 'N/A'}</div>
                      <div><strong>Height:</strong> {result.data.dimensions?.height ? `${result.data.dimensions.height} mm` : 'N/A'}</div>
                      <div><strong>Weight:</strong> {result.data.dimensions?.weight ? `${result.data.dimensions.weight} g` : 'N/A'}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Bullet Points</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {result.data.bulletPoints?.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1">
                          {result.data.bulletPoints.map((point: string, index: number) => (
                            <li key={index}>{point}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground">No bullet points available</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Historical Data</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div><strong>Price History Points:</strong> {result.data.priceHistory?.length || 0}</div>
                      <div><strong>BSR History Points:</strong> {result.data.bsrHistory?.length || 0}</div>
                      <div><strong>Rating History Points:</strong> {result.data.ratingHistory?.length || 0}</div>
                      <div><strong>Review History Points:</strong> {result.data.reviewCountHistory?.length || 0}</div>
                    </CardContent>
                  </Card>

                  {(result.data.model || result.data.partNumber || result.data.color || result.data.size || 
                    result.data.eanList?.length > 0 || result.data.upcList?.length > 0) && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Product Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {result.data.model && <div><strong>Model:</strong> {result.data.model}</div>}
                        {result.data.partNumber && <div><strong>Part Number:</strong> {result.data.partNumber}</div>}
                        {result.data.color && <div><strong>Color:</strong> {result.data.color}</div>}
                        {result.data.size && <div><strong>Size:</strong> {result.data.size}</div>}
                        {result.data.eanList?.length > 0 && (
                          <div><strong>EAN:</strong> {result.data.eanList.join(', ')}</div>
                        )}
                        {result.data.upcList?.length > 0 && (
                          <div><strong>UPC:</strong> {result.data.upcList.join(', ')}</div>
                        )}
                        {result.data.gtinList?.length > 0 && (
                          <div><strong>GTIN:</strong> {result.data.gtinList.join(', ')}</div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {result.data.frequentlyBoughtTogether?.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Frequently Bought Together</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1">
                          {result.data.frequentlyBoughtTogether.map((asin: string, index: number) => (
                            <div key={index} className="font-mono text-sm">
                              {asin}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {result.data.fbaFees && (
                    <Card>
                      <CardHeader>
                        <CardTitle>FBA Fees</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {result.data.fbaFees.pickAndPackFee && (
                          <div><strong>Pick & Pack Fee:</strong> ${(result.data.fbaFees.pickAndPackFee / 100).toFixed(2)}</div>
                        )}
                        {result.data.fbaFees.lastUpdate && (
                          <div><strong>Last Updated:</strong> {new Date((result.data.fbaFees.lastUpdate + 21564000) * 60000).toLocaleDateString()}</div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle>Images ({result.data.imageUrls?.length || 0})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {result.data.imageUrls?.length > 0 ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-2">
                            {result.data.imageUrls.slice(0, 6).map((url: string, index: number) => (
                              <img
                                key={index}
                                src={url}
                                alt={`Product image ${index + 1}`}
                                className="w-full h-32 object-cover rounded border"
                              />
                            ))}
                          </div>
                          {result.data.imageUrls.length > 6 && (
                            <p className="text-sm text-muted-foreground">
                              Showing 6 of {result.data.imageUrls.length} images
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No images available</p>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}

              {result.product && (
                <Card>
                  <CardHeader>
                    <CardTitle>Database Record</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs overflow-auto p-2 bg-muted rounded">
                      {JSON.stringify(result.product, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {result.data && (
                <Card>
                  <CardHeader>
                    <CardTitle>Full Transformed Data (All Fields)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs overflow-auto p-2 bg-muted rounded max-h-96">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {result.rawKeepaData && (
                <Card>
                  <CardHeader>
                    <CardTitle>Raw Keepa API Response</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs overflow-auto p-2 bg-muted rounded max-h-96">
                      {JSON.stringify(result.rawKeepaData, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}