'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import api from '@/lib/api'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'

interface Reminder {
  id: number
  title: string
  scheduled_at: string
  reminder_type?: string
}

interface HealthData {
  id: number
  data_type: string
  recorded_at: string
}

export default function CalendarPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [healthData, setHealthData] = useState<HealthData[]>([])

  const fetchData = useCallback(async () => {
    try {
      const startDate = startOfMonth(currentDate)
      const endDate = endOfMonth(currentDate)

      const [remindersRes, healthDataRes] = await Promise.all([
        api.get('/reminders', {
          params: {
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
          },
        }),
        api.get('/health-data', {
          params: {
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
          },
        }),
      ])

      setReminders(remindersRes.data || [])
      setHealthData(healthDataRes.data || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }, [currentDate])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
      return
    }
    fetchData()
  }, [isAuthenticated, router, fetchData])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getDayEvents = (day: Date) => {
    const dayReminders = reminders.filter((r) =>
      isSameDay(new Date(r.scheduled_at), day)
    )
    const dayHealthData = healthData.filter((d) =>
      isSameDay(new Date(d.recorded_at), day)
    )
    return { reminders: dayReminders, healthData: dayHealthData }
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <CalendarIcon className="w-8 h-8 text-primary-600" />
            カレンダー
          </h1>
          <p className="text-gray-600">リマインダーと健康データをカレンダーで確認</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              {format(currentDate, 'yyyy年MM月', { locale: ja })}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
              <div key={day} className="text-center font-semibold text-gray-700 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => {
              const { reminders: dayReminders, healthData: dayHealthData } =
                getDayEvents(day)
              const isToday = isSameDay(day, new Date())
              const isCurrentMonth = day.getMonth() === currentDate.getMonth()

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[100px] p-2 border rounded-lg ${
                    isToday
                      ? 'bg-primary-50 border-primary-300'
                      : 'bg-white border-gray-200'
                  } ${!isCurrentMonth ? 'opacity-50' : ''}`}
                >
                  <div
                    className={`text-sm font-semibold mb-1 ${
                      isToday ? 'text-primary-600' : 'text-gray-700'
                    }`}
                  >
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayReminders.slice(0, 2).map((reminder) => (
                      <div
                        key={reminder.id}
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded truncate"
                        title={reminder.title}
                      >
                        📅 {reminder.title}
                      </div>
                    ))}
                    {dayHealthData.length > 0 && (
                      <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        📊 {dayHealthData.length}件のデータ
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 rounded"></div>
              <span className="text-gray-600">リマインダー</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 rounded"></div>
              <span className="text-gray-600">健康データ</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}


