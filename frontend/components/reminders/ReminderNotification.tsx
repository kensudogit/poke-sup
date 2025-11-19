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

        const response = await api.get('/reminders', {
          params: {
            is_completed: 'false',
          },
        })

        const reminders: Reminder[] = response.data

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
      } catch (error) {
        console.error('Failed to check reminders:', error)
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


