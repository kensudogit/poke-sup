'use client'

import { useState } from 'react'
import { Download, FileText, FileSpreadsheet } from 'lucide-react'
import { toast } from '../common/Toast'
import api from '@/lib/api'

interface ExportButtonProps {
  healthData: any[]
}

export default function ExportButton({ healthData }: ExportButtonProps) {
  const [loading, setLoading] = useState(false)

  const exportToCSV = () => {
    if (healthData.length === 0) {
      toast.warning('エクスポートするデータがありません')
      return
    }

    setLoading(true)
    try {
      const headers = ['ID', 'データタイプ', '値', '単位', 'メモ', '記録日時']
      const rows = healthData.map((data) => [
        data.id,
        data.data_type,
        data.value,
        data.unit || '',
        data.notes || '',
        new Date(data.recorded_at).toLocaleString('ja-JP'),
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n')

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `health_data_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('CSVファイルをダウンロードしました')
    } catch (error) {
      toast.error('エクスポートに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const exportToJSON = () => {
    if (healthData.length === 0) {
      toast.warning('エクスポートするデータがありません')
      return
    }

    setLoading(true)
    try {
      const jsonContent = JSON.stringify(healthData, null, 2)
      const blob = new Blob([jsonContent], { type: 'application/json' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `health_data_${new Date().toISOString().split('T')[0]}.json`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('JSONファイルをダウンロードしました')
    } catch (error) {
      toast.error('エクスポートに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative group">
      <button
        disabled={loading || healthData.length === 0}
        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="w-4 h-4" />
        エクスポート
      </button>
      <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[180px]">
        <button
          onClick={exportToCSV}
          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
        >
          <FileSpreadsheet className="w-4 h-4" />
          CSV形式でエクスポート
        </button>
        <button
          onClick={exportToJSON}
          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm border-t border-gray-200"
        >
          <FileText className="w-4 h-4" />
          JSON形式でエクスポート
        </button>
      </div>
    </div>
  )
}

