import React from 'react'
import { ExternalLink } from 'lucide-react'
import { TrendData } from '@/hooks/useSearchTerms'
import { TrendChart } from './TrendChart'

interface TrendTableRowProps {
  trend: TrendData
  getAmazonSearchUrl: (keyword: string) => string
  getTrendData: (trend: TrendData) => any[]
}

export const TrendTableRow = React.memo(({ trend, getAmazonSearchUrl, getTrendData }: TrendTableRowProps) => {
  const trendData = React.useMemo(() => getTrendData(trend), [trend, getTrendData])

  const rankTooltip = React.useCallback(({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload
      const dateValue = typeof data.date === 'object' ? data.date.value : data.date
      return (
        <div className="bg-white border rounded p-2 text-xs shadow-lg">
          <p className="font-medium text-gray-600 mb-1">{dateValue}</p>
          <p>Rank: {Math.round(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }, [])

  const clickTooltip = React.useCallback(({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload
      const dateValue = typeof data.date === 'object' ? data.date.value : data.date
      return (
        <div className="bg-white border rounded p-2 text-xs shadow-lg">
          <p className="font-medium text-gray-600 mb-1">{dateValue}</p>
          <p>Click: {Math.round(payload[0].value)}%</p>
        </div>
      )
    }
    return null
  }, [])

  const conversionTooltip = React.useCallback(({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload
      const dateValue = typeof data.date === 'object' ? data.date.value : data.date
      return (
        <div className="bg-white border rounded p-2 text-xs shadow-lg">
          <p className="font-medium text-gray-600 mb-1">{dateValue}</p>
          <p>Conv: {Math.round(payload[0].value)}%</p>
        </div>
      )
    }
    return null
  }, [])

  return (
    <tr className="border-b hover:bg-gray-50 transition-colors">
      <td className="p-3">
        <div className="flex items-center gap-2">
          <div className="font-medium text-blue-600">
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
        <div className="space-y-1">
          <div className="font-semibold text-lg">{trend.searchFrequencyRank}</div>
          <TrendChart
            data={trendData}
            dataKey="rank"
            color="#3B82F6"
            tooltipFormatter={rankTooltip}
          />
        </div>
      </td>

      <td className="p-3 text-center">
        <div className="space-y-1">
          <div className="font-semibold">{Math.round(trend.topClickShare)}%</div>
          <TrendChart
            data={trendData}
            dataKey="clickShare"
            color="#10B981"
            tooltipFormatter={clickTooltip}
          />
        </div>
      </td>

      <td className="p-3 text-center">
        <div className="space-y-1">
          <div className="font-semibold">{Math.round(trend.top3ConversionShare)}%</div>
          <TrendChart
            data={trendData}
            dataKey="conversionShare"
            color="#F59E0B"
            tooltipFormatter={conversionTooltip}
          />
        </div>
      </td>

      <td className="p-3">
        <div className="flex items-center gap-3 justify-center">
          {trend.top3ASINs.filter(asin => asin.asin && asin.asin !== 'N/A').map((asin, i) => (
            <div key={i} className="text-center">
              <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden mb-1 mx-auto">
                <img
                  src={`https://via.placeholder.com/40x40/e2e8f0/64748b?text=${asin.asin.slice(-3)}`}
                  alt={asin.asin}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="text-xs font-mono text-gray-600 mb-1">
                {asin.asin}
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="text-xs">
                  <span className="text-gray-500">Clicks:</span>
                  <span className="text-blue-600 font-medium ml-0.5">{Math.round(asin.clickShare)}%</span>
                </div>
                <div className="text-xs">
                  <span className="text-gray-500">Conversions:</span>
                  <span className="text-green-600 font-medium ml-0.5">{Math.round(asin.conversionShare || 0)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </td>
    </tr>
  )
})

TrendTableRow.displayName = 'TrendTableRow'