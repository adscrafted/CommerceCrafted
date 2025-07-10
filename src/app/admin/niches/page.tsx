import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { NichesList } from '@/components/admin/NichesList'

export default function NichesPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Niche Analysis</h1>
          <p className="text-gray-600 mt-2">
            Manage and analyze product niches with AI-powered insights
          </p>
        </div>
        <Link href="/admin/niche/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Niche Analysis
          </Button>
        </Link>
      </div>

      <NichesList />
    </div>
  )
}