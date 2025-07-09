import { notFound, redirect } from 'next/navigation'
import { NicheAnalysisForm } from '@/components/admin/NicheAnalysisForm'
import { NicheAnalysisData, NicheAnalysisFormData, NicheAnalysisPageProps } from '@/types/niche'

// Mock data - replace with actual database fetch
const getNicheAnalysis = async (id: string): Promise<NicheAnalysisData | null> => {
  // This would be replaced with actual database query
  if (id === 'example-niche-1') {
    return {
      id: 'example-niche-1',
      nicheName: 'Eco-Friendly Kitchen Products',
      category: 'Home & Kitchen',
      opportunityScore: 85,
      competitionLevel: 'Medium',
      marketSize: 2500000,
      nicheKeywords: ['sustainable kitchen', 'eco-friendly', 'reusable', 'zero waste'],
      asins: ['B08MVBRNKV', 'B07SHBQY7Z', 'B07KC5DWCC'],
      avgPrice: 24.99,
      totalMonthlyRevenue: 185000,
      aiAnalysis: {
        whyThisProduct: 'Growing environmental consciousness drives demand for sustainable kitchen alternatives...',
        keyHighlights: ['Growing market trend', 'High customer satisfaction', 'Multiple use cases'],
        demandAnalysis: 'Search volume has increased 45% YoY...',
        competitionAnalysis: 'Medium competition with room for differentiation...',
        keywordAnalysis: 'Primary keywords show moderate competition...',
        listingOptimization: {
          title: 'Eco-Friendly Reusable Kitchen Set - Sustainable Alternative to Single-Use Products',
          bulletPoints: ['SUSTAINABLE MATERIALS: Made from 100% organic bamboo', 'MULTIPURPOSE: Perfect for meal prep and storage'],
          description: 'Transform your kitchen with our eco-friendly solution...'
        }
      }
    }
  }
  return null
}

export default async function NicheAnalysisPage({ params }: NicheAnalysisPageProps) {
  const { id } = await params
  const niche = await getNicheAnalysis(id)
  
  if (!niche) {
    notFound()
  }

  const handleSave = async (data: NicheAnalysisFormData) => {
    'use server'
    // Implement save logic here
    console.log('Saving niche analysis:', data)
    redirect('/admin')
  }

  const handleReprocess = async () => {
    'use server'
    // Implement reprocess logic here
    console.log('Reprocessing niche:', id)
  }

  return (
    <div className="container mx-auto py-8">
      <NicheAnalysisForm
        initialData={niche}
        onSave={handleSave}
        onReprocess={handleReprocess}
      />
    </div>
  )
}