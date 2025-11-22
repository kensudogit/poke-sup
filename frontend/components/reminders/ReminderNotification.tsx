'use client'

import { useEffect } from 'react'
import api from '@/lib/api'
import { NotificationService } from '@/lib/notifications'
import { useAuthStore } from '@/store/authStore'

interface Reminder {
  id: number
  title: string
  description?: string
  scheduled_at: string
  is_completed: boolean
}

export default function ReminderNotification() {
  const { user } = useAuthStore()

  useEffect(() => {
    if (!user) return

    // Request notification permission on mount
    NotificationService.requestPermission()

    // Check for upcoming reminders every minute
    const checkReminders = async () => {
      try {
        const now = new Date()
        const in5Minutes = new Date(now.getTime() + 5 * 60 * 1000)

        // トークンを確認
        const token = localStorage.getItem('access_token')
        if (!token) {
          console.warn('No token found, skipping reminder check')
          return
        }

        const response = await api.get('/reminders', {
          params: {
            is_completed: 'false',
            upcoming_only: 'true',
          },
        })

        const reminders: Reminder[] = response.data || []

        for (const reminder of reminders) {
          const scheduledAt = new Date(reminder.scheduled_at)
          
          // Show notification if reminder is within 5 minutes
          if (
            scheduledAt <= in5Minutes &&
            scheduledAt > now &&
            !reminder.is_completed
          ) {
            await NotificationService.showReminder(
              reminder.title,
              reminder.description || 'リマインダーの時間です'
            )
          }
        }
      } catch (error: any) {
        // 422エラーなどの詳細をログに記録
        if (error.response?.status === 422) {
          console.error('Failed to check reminders (422 Unprocessable Entity):', {
            status: error.response.status,
            data: error.response.data,
            url: error.config?.url,
            baseURL: error.config?.baseURL,
            params: error.config?.params,
            headers: error.config?.headers,
            error_message: error.message,
            error_code: error.code,
          })
          // エラーレスポンスの詳細を表示
          if (error.response.data) {
            console.error('Error response data:', JSON.stringify(error.response.data, null, 2))
          }
        } else {
          console.error('Failed to check reminders:', {
            error,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
          })
        }
        // エラーが発生してもアプリケーションを続行
      }
    }

    // Check immediately
    checkReminders()

    // Check every minute
    const interval = setInterval(checkReminders, 60 * 1000)

    return () => clearInterval(interval)
  }, [user])

  return null
}


