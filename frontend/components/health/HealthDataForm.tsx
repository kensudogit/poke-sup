'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '@/lib/api'
import { X } from 'lucide-react'
import { toast } from '../common/Toast'

const healthDataSchema = z.object({
  data_type: z.string().min(1, 'データタイプを選択してください'),
  value: z.number().min(0, '値は0以上である必要があります'),
  unit: z.string().optional(),
  notes: z.string().optional(),
  recorded_at: z.string(),
})

type HealthDataForm = z.infer<typeof healthDataSchema>

interface HealthDataFormProps {
  data?: {
    id: number
    data_type: string
    value: number
    unit?: string
    notes?: string
    recorded_at: string
  }
  onClose: () => void
  onSuccess: () => void
}

export default function HealthDataForm({ data, onClose, onSuccess }: HealthDataFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isEdit = !!data

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HealthDataForm>({
    resolver: zodResolver(healthDataSchema),
    defaultValues: data
      ? {
          data_type: data.data_type,
          value: data.value,
          unit: data.unit || '',
          notes: data.notes || '',
          recorded_at: new Date(data.recorded_at).toISOString().slice(0, 16),
        }
      : {
          recorded_at: new Date().toISOString().slice(0, 16),
        },
  })

  const onSubmit = async (formData: HealthDataForm) => {
    setError(null)
    setLoading(true)

    try {
      if (isEdit && data) {
        await api.put(`/health-data/${data.id}`, formData)
        toast.success('健康データを更新しました')
      } else {
        await api.post('/health-data', formData)
        toast.success('健康データを追加しました')
      }
      onSuccess()
      onClose()
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        (isEdit ? 'データの更新に失敗しました' : 'データの追加に失敗しました')
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? '健康データを編集' : '健康データを追加'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              データタイプ
            </label>
            <select
              {...register('data_type')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">選択してください</option>
              <option value="blood_pressure">血圧</option>
              <option value="weight">体重</option>
              <option value="blood_sugar">血糖値</option>
              <option value="temperature">体温</option>
            </select>
            {errors.data_type && (
              <p className="mt-1 text-sm text-red-600">{errors.data_type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">値</label>
            <input
              {...register('value', { valueAsNumber: true })}
              type="number"
              step="0.1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {errors.value && (
              <p className="mt-1 text-sm text-red-600">{errors.value.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">単位</label>
            <input
              {...register('unit')}
              type="text"
              placeholder="例: mmHg, kg, mg/dL"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">記録日時</label>
            <input
              {...register('recorded_at')}
              type="datetime-local"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">メモ</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="任意のメモを入力..."
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {loading ? (isEdit ? '更新中...' : '追加中...') : isEdit ? '更新' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

