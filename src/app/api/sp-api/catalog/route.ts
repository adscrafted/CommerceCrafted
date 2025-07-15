import { NextRequest, NextResponse } from 'next/server'
import { amazonSpApi } from '@/lib/integrations/amazon-sp-api'

export async function POST(request: NextRequest) {
  try {
    const { requests } = await request.json()

    if (!Array.isArray(requests) || requests.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request format. Expected array of search requests.' },
        { status: 400 }
      )
    }

    // Process each request
    const results = await Promise.all(
      requests.map(async (searchRequest: any) => {
        const { keywords, marketplaceIds, includedData } = searchRequest
        
        if (!keywords || !marketplaceIds) {
          return {
            catalogItems: [],
            error: 'Keywords and marketplaceIds are required'
          }
        }

        try {
          // Use the search catalog items method
          const catalogItems = await amazonSpApi.searchCatalogItems(keywords, 50)
          
          // Transform the results to match your expected format
          const transformedItems = catalogItems.map(item => ({
            asin: item.asin,
            title: item.summaries?.[0]?.itemName || item.productTitle || 'Unknown Product',
            brand: item.brand || item.attributeSets?.[0]?.Brand || '',
            imageUrl: item.images?.find(img => img.variant === 'MAIN')?.link || '',
            salesRank: item.salesRankings?.[0]?.rank || undefined,
            category: item.productCategory || item.summaries?.[0]?.itemClassification || '',
            price: undefined, // Would need separate pricing API call
            currency: 'USD'
          }))

          return {
            catalogItems: transformedItems,
            totalResults: transformedItems.length
          }
        } catch (error) {
          console.error('Error searching catalog:', error)
          return {
            catalogItems: [],
            error: 'Failed to search catalog'
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: {
        results
      }
    })

  } catch (error) {
    console.error('Error in catalog search:', error)
    return NextResponse.json(
      { 
        error: 'Catalog search failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}