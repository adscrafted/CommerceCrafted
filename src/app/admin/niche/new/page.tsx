import { NicheAnalysisFormEnhanced } from '@/components/admin/NicheAnalysisFormEnhanced'
import { createNicheWithAnalysis } from './actions'

export default function NewNicheAnalysisPage() {
  return (
    <div className="container mx-auto py-8">
      <NicheAnalysisFormEnhanced
        onSave={createNicheWithAnalysis}
        isNew={true}
      />
    </div>
  )
}