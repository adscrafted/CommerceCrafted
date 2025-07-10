import { notFound } from 'next/navigation'
import { NicheDetailView } from '@/components/admin/NicheDetailView'
import { checkAnalysisStatus } from '@/app/admin/niche/new/actions'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function NicheDetailPage({ params }: PageProps) {
  const { id } = await params
  
  // Fetch the niche data and analysis status
  let analysisData
  try {
    analysisData = await checkAnalysisStatus(id)
  } catch (error) {
    console.error('Error fetching niche:', error)
    notFound()
  }

  if (!analysisData || !analysisData.data) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <NicheDetailView
        nicheId={id}
        initialData={analysisData.data}
      />
    </div>
  )
}