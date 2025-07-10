import React from 'react'

interface TrendSparklineProps {
  data: number[]
  color: string
  label: string
  value: number
}

export const TrendSparkline = React.memo(({ data, color, label, value }: TrendSparklineProps) => {
  // Create a simple SVG sparkline instead of heavy chart library
  const width = 80
  const height = 24
  const padding = 2
  
  if (!data || data.length === 0) {
    return (
      <div className="space-y-1">
        <div className="font-semibold">{value}%</div>
        <div className="h-6 bg-gray-100 rounded" />
      </div>
    )
  }
  
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * (width - 2 * padding) + padding
    const y = height - ((val - min) / range) * (height - 2 * padding) - padding
    return `${x},${y}`
  }).join(' ')
  
  return (
    <div className="space-y-1">
      <div className="font-semibold">{value}%</div>
      <div className="relative group">
        <svg width={width} height={height} className="overflow-visible">
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            points={points}
          />
        </svg>
        <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-gray-800 text-white rounded whitespace-nowrap z-10">
          {label}: {value}%
        </div>
      </div>
    </div>
  )
})

TrendSparkline.displayName = 'TrendSparkline'