'use client'

import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface HealthData {
  id: number
  data_type: string
  value: number
  unit?: string
  notes?: string
  recorded_at: string
}

interface DataComparisonProps {
  data: HealthData[]
  dataType: string
  period: 'week' | 'month' | 'year'
}

export default function DataComparison({ data, dataType, period }: DataComparisonProps) {
  const comparison = useMemo(() => {
    const filteredData = data.filter((d) => d.data_type === dataType)
    if (filteredData.length < 2) return null

    const now = new Date()
    let periodStart: Date

    switch (period) {
      case 'week':
        periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        periodStart = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
    }

    const recentData = filteredData.filter(
      (d) => new Date(d.recorded_at) >= periodStart
    )
    const olderData = filteredData.filter(
      (d) => new Date(d.recorded_at) < periodStart
    )

    if (recentData.length === 0 || olderData.length === 0) return null

    const recentAvg =
      recentData.reduce((sum, d) => sum + d.value, 0) / recentData.length
    const olderAvg =
      olderData.reduce((sum, d) => sum + d.value, 0) / olderData.length

    const change = recentAvg - olderAvg
    const changePercent = olderAvg !== 0 ? (change / olderAvg) * 100 : 0

    return {
      recentAvg,
      olderAvg,
      change,
      changePercent,
      unit: filteredData[0]?.unit || '',
    }
  }, [data, dataType, period])

  if (!comparison) return null

  const getPeriodLabel = () => {
    switch (period) {
      case 'week':
        return '過去1週間'
      case 'month':
        return '過去1ヶ月'
      case 'year':
        return '過去1年'
    }
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">
        {getPeriodLabel()}との比較
      </h4>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">平均値の変化</p>
          <p className="text-lg font-bold text-gray-900">
            {comparison.change > 0 ? '+' : ''}
            {comparison.change.toFixed(1)}
            {comparison.unit && (
              <span className="text-sm text-gray-500 ml-1">{comparison.unit}</span>
            )}
          </p>
        </div>
        <div className="text-right">
          <div
            className={`flex items-center gap-1 ${
              comparison.change > 0
                ? 'text-green-600'
                : comparison.change < 0
                ? 'text-red-600'
                : 'text-gray-600'
            }`}
          >
            {comparison.change > 0 ? (
              <TrendingUp className="w-5 h-5" />
            ) : comparison.change < 0 ? (
              <TrendingDown className="w-5 h-5" />
            ) : (
              <Minus className="w-5 h-5" />
            )}
            <span className="text-sm font-semibold">
              {comparison.changePercent > 0 ? '+' : ''}
              {comparison.changePercent.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

