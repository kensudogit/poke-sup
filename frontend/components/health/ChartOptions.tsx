'use client'

import { BarChart3, LineChart, TrendingUp } from 'lucide-react'

interface ChartOptionsProps {
  chartType: 'line' | 'bar' | 'area'
  onChartTypeChange: (type: 'line' | 'bar' | 'area') => void
}

export default function ChartOptions({ chartType, onChartTypeChange }: ChartOptionsProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
      <span className="text-sm text-gray-600 mr-2">グラフタイプ:</span>
      <button
        onClick={() => onChartTypeChange('line')}
        className={`p-2 rounded transition-colors ${
          chartType === 'line'
            ? 'bg-primary-600 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-200'
        }`}
        title="折れ線グラフ"
      >
        <LineChart className="w-4 h-4" />
      </button>
      <button
        onClick={() => onChartTypeChange('bar')}
        className={`p-2 rounded transition-colors ${
          chartType === 'bar'
            ? 'bg-primary-600 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-200'
        }`}
        title="棒グラフ"
      >
        <BarChart3 className="w-4 h-4" />
      </button>
      <button
        onClick={() => onChartTypeChange('area')}
        className={`p-2 rounded transition-colors ${
          chartType === 'area'
            ? 'bg-primary-600 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-200'
        }`}
        title="エリアグラフ"
      >
        <TrendingUp className="w-4 h-4" />
      </button>
    </div>
  )
}


