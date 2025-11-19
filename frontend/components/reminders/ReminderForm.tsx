'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '@/lib/api'
import { X } from 'lucide-react'
import { toast } from '../common/Toast'

const reminderSchema = z.object({
  title: z.string().min(1, 'タイトルを入力してください'),
  description: z.string().optional(),
  reminder_type: z.string().optional(),
  scheduled_at: z.string().min(1, '日時を選択してください'),
  repeat_type: z.string().optional(),
  repeat_interval: z.number().min(1).optional(),
  end_date: z.string().optional(),
})

type ReminderForm = z.infer<typeof reminderSchema>

interface ReminderFormProps {
  reminder?: {
    id: number
    title: string
    description?: string
    reminder_type?: string
    scheduled_at: string
    is_completed: boolean
    repeat_type?: string
    repeat_interval?: number
    end_date?: string
  }
  onClose: () => void
  onSuccess: () => void
}

export default function ReminderForm({ reminder, onClose, onSuccess }: ReminderFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isEdit = !!reminder

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReminderForm>({
    resolver: zodResolver(reminderSchema),
    defaultValues: reminder
      ? {
          title: reminder.title,
          description: reminder.description || '',
          reminder_type: reminder.reminder_type || '',
          scheduled_at: new Date(reminder.scheduled_at).toISOString().slice(0, 16),
          repeat_type: reminder.repeat_type || 'none',
          repeat_interval: reminder.repeat_interval || 1,
          end_date: reminder.end_date
            ? new Date(reminder.end_date).toISOString().slice(0, 16)
            : '',
        }
      : {
          scheduled_at: new Date().toISOString().slice(0, 16),
          repeat_type: 'none',
          repeat_interval: 1,
        },
  })

  const onSubmit = async (data: ReminderForm) => {
    setError(null)
    setLoading(true)

    try {
      if (isEdit && reminder) {
        await api.put(`/reminders/${reminder.id}`, data)
        toast.success('リマインダーを更新しました')
      } else {
        await api.post('/reminders', data)
        toast.success('リマインダーを追加しました')
      }
      onSuccess()
      onClose()
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        (isEdit ? 'リマインダーの更新に失敗しました' : 'リマインダーの追加に失敗しました')
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
            {isEdit ? 'リマインダーを編集' : 'リマインダーを追加'}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">タイトル</label>
            <input
              {...register('title')}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="例: 薬を飲む"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">説明</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="任意の説明を入力..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">種類</label>
            <select
              {...register('reminder_type')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">選択してください</option>
              <option value="medication">服薬</option>
              <option value="appointment">診察</option>
              <option value="exercise">運動</option>
              <option value="other">その他</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">日時</label>
            <input
              {...register('scheduled_at')}
              type="datetime-local"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {errors.scheduled_at && (
              <p className="mt-1 text-sm text-red-600">{errors.scheduled_at.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">繰り返し</label>
            <select
              {...register('repeat_type')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="none">繰り返さない</option>
              <option value="daily">毎日</option>
              <option value="weekly">毎週</option>
              <option value="monthly">毎月</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">間隔</label>
              <input
                {...register('repeat_interval', { valueAsNumber: true })}
                type="number"
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">終了日（任意）</label>
              <input
                {...register('end_date')}
                type="datetime-local"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
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

