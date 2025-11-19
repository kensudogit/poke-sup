'use client'

import { useState } from 'react'
import { Edit, Trash2, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import HealthDataForm from './HealthDataForm'
import { toast } from '../common/Toast'
import api from '@/lib/api'

interface HealthData {
  id: number
  data_type: string
  value: number
  unit?: string
  notes?: string
  recorded_at: string
}

interface HealthDataItemProps {
  data: HealthData
  onUpdate: () => void
}

export default function HealthDataItem({ data, onUpdate }: HealthDataItemProps) {
  const [showEditForm, setShowEditForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('このデータを削除しますか？')) {
      return
    }

    setLoading(true)
    try {
      await api.delete(`/health-data/${data.id}`)
      toast.success('健康データを削除しました')
      onUpdate()
    } catch (error: any) {
      toast.error(error.response?.data?.error || '削除に失敗しました')
    } finally {
      setLoading(false)
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
    <>
      <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-gray-900">
                {getDataTypeLabel(data.data_type)}
              </h3>
              <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full">
                {data.data_type}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold text-gray-900">
                {data.value}
              </span>
              {data.unit && (
                <span className="text-sm text-gray-500">{data.unit}</span>
              )}
            </div>
            {data.notes && (
              <p className="text-sm text-gray-600 mb-2">{data.notes}</p>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>
                {format(new Date(data.recorded_at), 'yyyy年MM月dd日 HH:mm', {
                  locale: ja,
                })}
              </span>
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => setShowEditForm(true)}
              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              title="編集"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              title="削除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showEditForm && (
        <HealthDataForm
          data={data}
          onClose={() => setShowEditForm(false)}
          onSuccess={() => {
            onUpdate()
            setShowEditForm(false)
          }}
        />
      )}
    </>
  )
}


