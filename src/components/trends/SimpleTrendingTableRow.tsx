import React from 'react'
import { ExternalLink, ArrowUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { TrendChart } from './TrendChart'

interface TrendingKeyword {
  searchTerm: string
  currentRank: number
  previousRank?: number
  rankImprovement: number
  totalClickShare: number
  totalConversionShare: number
}

interface SimpleTrendingTableRowProps {
  keyword: TrendingKeyword
  getAmazonSearchUrl: (keyword: string) => string
}

export const SimpleTrendingTableRow = React.memo(({ keyword, getAmazonSearchUrl }: SimpleTrendingTableRowProps) => {
  // Mock trend data for trending keywords (since they don't have historical data yet)
  const getTrendData = () => {
    // Generate some mock trend data for visualization
    return [
      { week: 'Week 1', rank: keyword.currentRank + 10, clickShare: keyword.totalClickShare * 0.8, conversionShare: keyword.totalConversionShare * 0.7 },
      { week: 'Week 2', rank: keyword.currentRank + 5, clickShare: keyword.totalClickShare * 0.9, conversionShare: keyword.totalConversionShare * 0.85 },
      { week: 'Week 3', rank: keyword.currentRank, clickShare: keyword.totalClickShare, conversionShare: keyword.totalConversionShare }
    ]
  }

  // Tooltip formatters for different chart types
  const rankTooltip = (value: any, name: any, props: any) => {
    if (value === null || value === undefined || !props) return null
    return (
      <div className="bg-gray-800 text-white p-2 rounded text-xs">
        <div>Rank: {value}</div>
        <div>Week: {props.payload?.week || 'Current'}</div>
      </div>
    )
  }

  const clickTooltip = (value: any, name: any, props: any) => {
    if (value === null || value === undefined || !props) return null
    return (
      <div className="bg-gray-800 text-white p-2 rounded text-xs">
        <div>Click Share: {typeof value === 'number' ? value.toFixed(1) : value}%</div>
        <div>Week: {props.payload?.week || 'Current'}</div>
      </div>
    )
  }

  const conversionTooltip = (value: any, name: any, props: any) => {
    if (value === null || value === undefined || !props) return null
    return (
      <div className="bg-gray-800 text-white p-2 rounded text-xs">
        <div>Conversion Share: {typeof value === 'number' ? value.toFixed(1) : value}%</div>
        <div>Week: {props.payload?.week || 'Current'}</div>
      </div>
    )
  }
  return (
    <tr className="border-b hover:bg-gray-50 transition-colors">
      <td className="p-3">
        <div className="flex items-center gap-2">
          <div className="font-medium text-blue-600 hover:text-blue-700">
            {keyword.searchTerm}
          </div>
          <a
            href={getAmazonSearchUrl(keyword.searchTerm)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-500 hover:text-orange-600 transition-colors"
            title={`Search "${keyword.searchTerm}" on Amazon`}
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </td>

      <td className="p-3 text-center">
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-1">
            <span className="font-semibold text-lg">{keyword.currentRank}</span>
            {keyword.previousRank && (
              <div className="flex items-center gap-0.5">
                <ArrowUp className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600">
                  {keyword.rankImprovement.toLocaleString()}
                </span>
              </div>
            )}
          </div>
          <TrendChart 
            data={getTrendData()} 
            dataKey="rank" 
            color="#3b82f6" 
            tooltipFormatter={rankTooltip}
          />
        </div>
      </td>

      <td className="p-3 text-center">
        <div className="space-y-2">
          <div className="font-bold text-lg text-green-600">{Math.round(keyword.totalClickShare)}%</div>
          <TrendChart 
            data={getTrendData()} 
            dataKey="clickShare" 
            color="#10b981" 
            tooltipFormatter={clickTooltip}
          />
        </div>
      </td>

      <td className="p-3 text-center">
        <div className="space-y-2">
          <div className="font-bold text-lg text-orange-600">{Math.round(keyword.totalConversionShare)}%</div>
          <TrendChart 
            data={getTrendData()} 
            dataKey="conversionShare" 
            color="#f59e0b" 
            tooltipFormatter={conversionTooltip}
          />
        </div>
      </td>

      <td className="p-3">
        <div className="space-y-3">
          {/* Labels */}
          <div className="flex justify-center gap-6 text-xs font-medium text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span>Clicks</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
              <span>Conversions</span>
            </div>
          </div>
          
          {/* Coming Soon for ASINs */}
          <div className="flex items-center justify-center">
            <Badge variant="outline" className="text-xs">
              Coming Soon
            </Badge>
          </div>
        </div>
      </td>
    </tr>
  )
})

SimpleTrendingTableRow.displayName = 'SimpleTrendingTableRow'