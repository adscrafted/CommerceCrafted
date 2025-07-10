import React from 'react'
import { ExternalLink } from 'lucide-react'
import { TrendData } from '@/hooks/useSearchTerms'
import { Badge } from '@/components/ui/badge'
import { TrendChart } from './TrendChart'

interface SimpleTrendTableRowProps {
  trend: TrendData
  getAmazonSearchUrl: (keyword: string) => string
}

export const SimpleTrendTableRow = React.memo(({ trend, getAmazonSearchUrl }: SimpleTrendTableRowProps) => {
  // Get trend direction based on historical data
  const getTrendIndicator = () => {
    if (!trend.weeklyData || trend.weeklyData.length < 2) return null
    
    const current = trend.weeklyData[trend.weeklyData.length - 1]
    const previous = trend.weeklyData[trend.weeklyData.length - 2]
    
    if (current.search_frequency_rank < previous.search_frequency_rank) {
      return <span className="text-green-600 text-xs">↑</span>
    } else if (current.search_frequency_rank > previous.search_frequency_rank) {
      return <span className="text-red-600 text-xs">↓</span>
    }
    return <span className="text-gray-400 text-xs">→</span>
  }

  // Get trend data for visualization using actual historical data
  const getTrendData = (dataKey: string) => {
    // Use actual weekly data if available, otherwise fall back to current week only
    if (trend.weeklyData && trend.weeklyData.length > 0) {
      return trend.weeklyData.map((week: any, index: number) => {
        // Handle date extraction - check if it's an object with value property
        const dateValue = typeof week.week_start_date === 'object' ? 
          week.week_start_date.value : week.week_start_date
        
        return {
          week: `Week ${index + 1}`,
          date: dateValue || `Data Point ${index + 1}`,
          rank: week.search_frequency_rank,
          clickShare: (week.total_click_share || 0) * 100, // Convert to percentage
          conversionShare: (week.total_conversion_share || 0) * 100 // Convert to percentage
        }
      })
    }
    
    // Fallback to current week only
    return [{
      week: 'Current',
      date: '2025-04-06',
      rank: trend.searchFrequencyRank,
      clickShare: trend.topClickShare,
      conversionShare: trend.top3ConversionShare
    }]
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
            {trend.keyword}
          </div>
          <a
            href={getAmazonSearchUrl(trend.keyword)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-500 hover:text-orange-600 transition-colors"
            title={`Search "${trend.keyword}" on Amazon`}
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </td>

      <td className="p-3 text-center">
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-1">
            <span className="font-semibold text-lg">{trend.searchFrequencyRank}</span>
            {getTrendIndicator()}
          </div>
          <TrendChart 
            data={getTrendData('rank')} 
            dataKey="rank" 
            color="#3b82f6" 
            tooltipFormatter={rankTooltip}
          />
        </div>
      </td>

      <td className="p-3 text-center">
        <div className="space-y-2">
          <div className="font-bold text-lg text-green-600">{Math.round(trend.topClickShare)}%</div>
          <TrendChart 
            data={getTrendData('clickShare')} 
            dataKey="clickShare" 
            color="#10b981" 
            tooltipFormatter={clickTooltip}
          />
        </div>
      </td>

      <td className="p-3 text-center">
        <div className="space-y-2">
          <div className="font-bold text-lg text-orange-600">{Math.round(trend.top3ConversionShare)}%</div>
          <TrendChart 
            data={getTrendData('conversionShare')} 
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
          
          {/* ASINs */}
          <div className="flex items-start gap-3 justify-center">
            {trend.top3ASINs.filter(asin => asin.asin && asin.asin !== 'N/A').slice(0, 3).map((asin, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                {/* Product Image */}
                <div className="w-12 h-12 bg-gray-100 rounded border flex-shrink-0 overflow-hidden">
                  <img 
                    src={`https://images-na.ssl-images-amazon.com/images/P/${asin.asin}.01.THUMBZZZ.jpg`}
                    alt={`Product ${asin.asin}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `
                        <div class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      `;
                    }}
                  />
                </div>
                
                {/* ASIN Badge */}
                <div className="group relative">
                  <Badge variant="outline" className="text-xs font-mono cursor-help">
                    {asin.asin}
                  </Badge>
                  <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-1 p-2 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-10">
                    <div>ASIN: {asin.asin}</div>
                    <div>Clicks: {Math.round(asin.clickShare)}%</div>
                    <div>Conversions: {Math.round(asin.conversionShare || 0)}%</div>
                  </div>
                </div>
                
                {/* Individual Percentages Under Image */}
                <div className="text-center space-y-0.5">
                  <div className="text-green-600 font-semibold text-xs">
                    {Math.round(asin.clickShare)}%
                  </div>
                  <div className="text-orange-600 font-semibold text-xs">
                    {Math.round(asin.conversionShare || 0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </td>
    </tr>
  )
})

SimpleTrendTableRow.displayName = 'SimpleTrendTableRow'