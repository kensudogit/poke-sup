'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '@/lib/api'
import { X } from 'lucide-react'
import { toast } from '../common/Toast'

const healthGoalSchema = z.object({
  data_type: z.string().min(1, 'データタイプを選択してください'),
  target_value: z.number().min(0, '目標値は0以上である必要があります'),
  unit: z.string().optional(),
  deadline: z.string().optional(),
})

type HealthGoalForm = z.infer<typeof healthGoalSchema>

interface HealthGoalFormProps {
  goal?: {
    id: number
    data_type: string
    target_value: number
    unit?: string
    deadline?: string
  }
  onClose: () => void
  onSuccess: () => void
}

export default function HealthGoalForm({ goal, onClose, onSuccess }: HealthGoalFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isEdit = !!goal

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HealthGoalForm>({
    resolver: zodResolver(healthGoalSchema),
    defaultValues: goal
      ? {
          data_type: goal.data_type,
          target_value: goal.target_value,
          unit: goal.unit || '',
          deadline: goal.deadline
            ? new Date(goal.deadline).toISOString().slice(0, 16)
            : '',
        }
      : undefined,
  })

  const onSubmit = async (data: HealthGoalForm) => {
    setError(null)
    setLoading(true)

    try {
      if (isEdit && goal) {
        await api.put(`/health-goals/${goal.id}`, data)
        toast.success('健康目標を更新しました')
      } else {
        await api.post('/health-goals', data)
        toast.success('健康目標を追加しました')
      }
      onSuccess()
      onClose()
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        (isEdit ? '目標の更新に失敗しました' : '目標の追加に失敗しました')
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const dataTypes = [
    { value: 'blood_pressure', label: '血圧' },
    { value: 'weight', label: '体重' },
    { value: 'blood_sugar', label: '血糖値' },
    { value: 'temperature', label: '体温' },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? '健康目標を編集' : '健康目標を追加'}
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
              {dataTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.data_type && (
              <p className="mt-1 text-sm text-red-600">{errors.data_type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              目標値
            </label>
            <input
              {...register('target_value', { valueAsNumber: true })}
              type="number"
              step="0.1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {errors.target_value && (
              <p className="mt-1 text-sm text-red-600">{errors.target_value.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              単位（任意）
            </label>
            <input
              {...register('unit')}
              type="text"
              placeholder="例: mmHg, kg, mg/dL"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              期限（任意）
            </label>
            <input
              {...register('deadline')}
              type="datetime-local"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
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


