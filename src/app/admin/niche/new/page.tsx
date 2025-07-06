import { redirect } from 'next/navigation'
import { NicheAnalysisForm } from '@/components/admin/NicheAnalysisForm'

export default function NewNicheAnalysisPage() {
  const handleSave = async (data: any) => {
    'use server'
    // Implement save logic here
    console.log('Creating new niche analysis:', data)
    // After saving, redirect to the edit page or admin dashboard
    redirect('/admin')
  }

  return (
    <div className="container mx-auto py-8">
      <NicheAnalysisForm
        onSave={handleSave}
        isNew={true}
      />
    </div>
  )
}