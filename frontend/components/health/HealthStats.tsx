'use client'

import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react'

interface HealthData {
  id: number
  data_type: string
  value: number
  unit?: string
  recorded_at: string
}

interface HealthStatsProps {
  data: HealthData[]
  dataType: string
}

export default function HealthStats({ data, dataType }: HealthStatsProps) {
  const filteredData = useMemo(() => {
    return data.filter((d) => d.data_type === dataType)
  }, [data, dataType])

  const stats = useMemo(() => {
    if (filteredData.length === 0) {
      return null
    }

    const values = filteredData.map((d) => d.value)
    const sum = values.reduce((a, b) => a + b, 0)
    const avg = sum / values.length
    const max = Math.max(...values)
    const min = Math.min(...values)

    // Calculate trend (compare last 2 values)
    let trend: 'up' | 'down' | 'stable' = 'stable'
    if (values.length >= 2) {
      const recent = values.slice(-2)
      if (recent[1] > recent[0]) {
        trend = 'up'
      } else if (recent[1] < recent[0]) {
        trend = 'down'
      }
    }

    return {
      count: filteredData.length,
      average: avg,
      max,
      min,
      trend,
      unit: filteredData[0]?.unit || '',
    }
  }, [filteredData])

  if (!stats) {
    return null
  }

  const getTrendIcon = () => {
    switch (stats.trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      default:
        return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const getDataTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      blood_pressure: '血圧',
      weight: '体重',
      blood_sugar: '血糖値',
      temperature: '体温',
    }
    return labels[type] || type
  }

  return (
    <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-6 border border-primary-100">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          {getDataTypeLabel(dataType)}の統計
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">記録数</p>
          <p className="text-2xl font-bold text-gray-900">{stats.count}</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">平均値</p>
          <p className="text-2xl font-bold text-gray-900">
            {stats.average.toFixed(1)}
            {stats.unit && <span className="text-sm text-gray-500 ml-1">{stats.unit}</span>}
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">最大値</p>
          <p className="text-2xl font-bold text-gray-900">
            {stats.max.toFixed(1)}
            {stats.unit && <span className="text-sm text-gray-500 ml-1">{stats.unit}</span>}
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">最小値</p>
          <p className="text-2xl font-bold text-gray-900">
            {stats.min.toFixed(1)}
            {stats.unit && <span className="text-sm text-gray-500 ml-1">{stats.unit}</span>}
          </p>
        </div>
      </div>

      {stats.count >= 2 && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className="text-gray-600">傾向:</span>
          {getTrendIcon()}
          <span className="text-gray-900 font-medium">
            {stats.trend === 'up'
              ? '上昇傾向'
              : stats.trend === 'down'
              ? '下降傾向'
              : '安定'}
          </span>
        </div>
      )}
    </div>
  )
}

