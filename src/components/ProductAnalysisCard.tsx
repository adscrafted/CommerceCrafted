import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Star, TrendingUp, DollarSign, Eye } from 'lucide-react'
import { Product } from '@/types/product'
import Link from 'next/link'
import Image from 'next/image'

interface ProductAnalysisCardProps {
  product: Product
}

export function ProductAnalysisCard({ product }: ProductAnalysisCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent'
    if (score >= 6) return 'Good'
    if (score >= 4) return 'Fair'
    return 'Poor'
  }

  const getProgressColor = (score: number) => {
    if (score >= 8) return 'bg-green-500'
    if (score >= 6) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="aspect-square bg-gray-50 overflow-hidden">
        <Image
          src={product.imageUrls || '/placeholder-product.jpg'}
          alt={product.title}
          width={300}
          height={300}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <Badge variant="outline" className="text-xs">
            {product.category}
          </Badge>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-3 w-3 ${
                  star <= Math.floor(product.rating || 0)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="text-xs text-gray-600 ml-1">
              ({(product.reviewCount || 0).toLocaleString()})
            </span>
          </div>
        </div>
        
        <CardTitle className="text-sm font-semibold leading-tight line-clamp-2 min-h-[2.5rem]">
          {product.title}
        </CardTitle>
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-green-600">
            ${product.price || 'N/A'}
          </span>
          <Badge variant="secondary" className="text-xs">
            {product.brand}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {product.analysis && (
          <>
            {/* Overall Opportunity Score */}
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(product.analysis.opportunityScore / 10)}`}>
                {(product.analysis.opportunityScore / 10).toFixed(1)}/10
              </div>
              <div className="text-xs text-gray-600">Opportunity Score</div>
              <div className={`text-xs font-medium ${getScoreColor(product.analysis.opportunityScore / 10)}`}>
                {getScoreLabel(product.analysis.opportunityScore / 10)}
              </div>
            </div>

            {/* Detailed Scores */}
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Demand</span>
                  <span className={getScoreColor(product.analysis.demandScore / 10)}>
                    {(product.analysis.demandScore / 10).toFixed(1)}/10
                  </span>
                </div>
                <Progress 
                  value={product.analysis.demandScore} 
                  className="h-1.5"
                />
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Competition</span>
                  <span className={getScoreColor(product.analysis.competitionScore / 10)}>
                    {(product.analysis.competitionScore / 10).toFixed(1)}/10
                  </span>
                </div>
                <Progress 
                  value={product.analysis.competitionScore}
                  className="h-1.5"
                />
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Feasibility</span>
                  <span className={getScoreColor(product.analysis.feasibilityScore / 10)}>
                    {(product.analysis.feasibilityScore / 10).toFixed(1)}/10
                  </span>
                </div>
                <Progress 
                  value={product.analysis.feasibilityScore}
                  className="h-1.5"
                />
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-gray-50 rounded">
                <DollarSign className="h-3 w-3 mx-auto mb-1 text-green-600" />
                <div className="font-semibold">
                  ${(product.analysis.financialAnalysis.projectedMonthlyRevenue / 1000).toFixed(0)}K
                </div>
                <div className="text-gray-600">Est. Revenue</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <TrendingUp className="h-3 w-3 mx-auto mb-1 text-blue-600" />
                <div className="font-semibold">
                  {(product.analysis.financialAnalysis.estimatedProfitMargin * 100).toFixed(0)}%
                </div>
                <div className="text-gray-600">Profit Margin</div>
              </div>
            </div>
          </>
        )}

        {/* Action Button */}
        <Link href={`/products/${product.asin}`} className="block">
          <Button className="w-full" variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            View Analysis
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
} 