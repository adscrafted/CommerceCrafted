'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { NicheAnalysisFormData } from '@/types/niche'
import { cookies } from 'next/headers'

interface CreateNicheResponse {
  data?: {
    id: string
    name: string
    status: string
  }
  error?: string
  details?: any
}

interface AnalyzeNicheResponse {
  data?: {
    jobId: string
    type: string
    estimatedTime: string
    statusUrl: string
  }
  error?: string
  message?: string
}

interface AnalysisStatusResponse {
  data?: {
    status: 'pending' | 'processing' | 'completed' | 'failed'
    progress?: number
    message?: string
    error?: string
    analysis?: any
  }
  error?: string
}

export async function createNicheWithAnalysis(formData: NicheAnalysisFormData) {
  try {
    // Get auth token from cookies
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth-token')?.value
    
    if (!authToken) {
      throw new Error('Authentication required')
    }

    // Step 1: Create the niche
    const createResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/niches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth-token=${authToken}`,
      },
      body: JSON.stringify({
        name: formData.nicheName,
        description: formData.aiAnalysis?.whyThisProduct || '',
        category: formData.category,
        tags: formData.nicheKeywords,
        status: 'draft',
      }),
    })

    if (!createResponse.ok) {
      const error = await createResponse.json()
      throw new Error(error.error || 'Failed to create niche')
    }

    const createResult: CreateNicheResponse = await createResponse.json()
    const nicheId = createResult.data?.id

    if (!nicheId) {
      throw new Error('No niche ID returned')
    }

    // Step 2: Add products to the niche
    if (formData.asins.length > 0) {
      const addProductsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/niches/by-id/products?id=${nicheId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `auth-token=${authToken}`,
        },
        body: JSON.stringify({
          asins: formData.asins,
        }),
      })

      if (!addProductsResponse.ok) {
        console.error('Failed to add products:', await addProductsResponse.text())
      }
    }

    // Step 3: Trigger analysis
    const analyzeResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/niches/by-id/analyze?id=${nicheId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth-token=${authToken}`,
      },
      body: JSON.stringify({
        type: 'full',
        force: false,
      }),
    })

    if (!analyzeResponse.ok) {
      const error = await analyzeResponse.json()
      console.error('Failed to trigger analysis:', error)
      // Don't throw here - niche is created, just analysis failed
    }

    // Revalidate admin pages
    revalidatePath('/admin')
    revalidatePath('/admin/niches')
    
    // Redirect to the niche detail page
    redirect(`/admin/niches/${nicheId}`)
  } catch (error) {
    console.error('Error creating niche:', error)
    throw error
  }
}

export async function checkAnalysisStatus(nicheId: string): Promise<AnalysisStatusResponse> {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth-token')?.value
    
    if (!authToken) {
      throw new Error('Authentication required')
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/niches/${nicheId}/status`, {
      headers: {
        'Cookie': `auth-token=${authToken}`,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to check status')
    }

    return await response.json()
  } catch (error) {
    console.error('Error checking analysis status:', error)
    throw error
  }
}