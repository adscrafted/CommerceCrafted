import React from 'react'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'

interface TrendChartProps {
  data: any[]
  dataKey: string
  color: string
  tooltipFormatter: (value: any, name: any, props: any) => React.ReactElement | null
}

export const TrendChart = React.memo(({ data, dataKey, color, tooltipFormatter }: TrendChartProps) => {
  return (
    <div className="h-8 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            fill={color}
            fillOpacity={0.1}
            strokeWidth={1.5}
          />
          <Tooltip content={tooltipFormatter} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
})

TrendChart.displayName = 'TrendChart'