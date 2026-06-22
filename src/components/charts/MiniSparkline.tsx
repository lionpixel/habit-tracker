'use client'

import {
  AreaChart, Area, ResponsiveContainer,
} from 'recharts'

interface MiniSparklineProps {
  data:   number[]
  color?: string
  width?: number
  height?: number
}

export function MiniSparkline({ data, color = '#7c3aed', width = 64, height = 24 }: MiniSparklineProps) {
  const chartData = data.map((v, i) => ({ i, v }))

  return (
    <ResponsiveContainer width={width} height={height}>
      <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
        <defs>
          <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#spark-${color.replace('#', '')})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
