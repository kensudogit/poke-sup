'use client'

import { useState } from 'react'
import { Edit, Trash2, Clock, Check, Repeat } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import ReminderForm from './ReminderForm'
import { toast } from '../common/Toast'
import api from '@/lib/api'

interface Reminder {
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

interface ReminderItemProps {
  reminder: Reminder
  onUpdate: () => void
}

export default function ReminderItem({ reminder, onUpdate }: ReminderItemProps) {
  const [showEditForm, setShowEditForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('このリマインダーを削除しますか？')) {
      return
    }

    setLoading(true)
    try {
      await api.delete(`/reminders/${reminder.id}`)
      toast.success('リマインダーを削除しました')
      onUpdate()
    } catch (error: any) {
      toast.error(error.response?.data?.error || '削除に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    if (reminder.is_completed) return

    setLoading(true)
    try {
      await api.put(`/reminders/${reminder.id}/complete`)
      toast.success('リマインダーを完了しました')
      onUpdate()
    } catch (error: any) {
      toast.error(error.response?.data?.error || '完了に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const getReminderTypeLabel = (type?: string) => {
    const labels: Record<string, string> = {
      medication: '服薬',
      appointment: '診察',
      exercise: '運動',
      other: 'その他',
    }
    return labels[type || ''] || type || 'その他'
  }

  return (
    <>
      <div
        className={`p-4 border rounded-lg transition-all ${
          reminder.is_completed
            ? 'border-gray-200 bg-gray-50 opacity-75'
            : 'border-gray-200 hover:border-primary-300'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3
                className={`font-semibold ${
                  reminder.is_completed ? 'text-gray-500 line-through' : 'text-gray-900'
                }`}
              >
                {reminder.title}
              </h3>
              {reminder.reminder_type && (
                <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full">
                  {getReminderTypeLabel(reminder.reminder_type)}
                </span>
              )}
              {reminder.is_completed && (
                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                  完了
                </span>
              )}
            </div>
            {reminder.description && (
              <p
                className={`text-sm mb-2 ${
                  reminder.is_completed ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {reminder.description}
              </p>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>
                  {format(new Date(reminder.scheduled_at), 'yyyy年MM月dd日 HH:mm', {
                    locale: ja,
                  })}
                </span>
              </div>
              {reminder.repeat_type && reminder.repeat_type !== 'none' && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Repeat className="w-3 h-3" />
                  <span>
                    {reminder.repeat_type === 'daily' && '毎日'}
                    {reminder.repeat_type === 'weekly' && `毎週（${reminder.repeat_interval || 1}週間ごと）`}
                    {reminder.repeat_type === 'monthly' && `毎月（${reminder.repeat_interval || 1}ヶ月ごと）`}
                    {reminder.end_date &&
                      ` - ${format(new Date(reminder.end_date), 'yyyy年MM月dd日まで', {
                        locale: ja,
                      })}`}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            {!reminder.is_completed && (
              <>
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                  title="完了"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowEditForm(true)}
                  className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="編集"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </>
            )}
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
        <ReminderForm
          reminder={reminder}
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

