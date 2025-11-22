'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ConversationsList from '@/components/conversations/ConversationsList'
import HealthDataDashboard from '@/components/health/HealthDataDashboard'
import RemindersList from '@/components/reminders/RemindersList'
import StatsCard from '@/components/dashboard/StatsCard'
import WelcomeBanner from '@/components/dashboard/WelcomeBanner'
import QuickActions from '@/components/dashboard/QuickActions'
import { MessageSquare, Activity, Bell, Calendar } from 'lucide-react'
import api from '@/lib/api'

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const [stats, setStats] = useState({
    conversations: 0,
    healthData: 0,
    reminders: 0,
    upcomingReminders: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 認証状態とトークンの両方を確認
    const token = localStorage.getItem('access_token')
    if (!isAuthenticated || !user || !token) {
      console.log('Not authenticated, redirecting to login', { isAuthenticated, hasUser: !!user, hasToken: !!token })
      router.push('/')
      return
    }
    console.log('Authenticated, fetching stats')
    fetchStats()
  }, [isAuthenticated, user, router])

  const fetchStats = async () => {
    try {
      const [conversationsRes, healthDataRes, remindersRes] = await Promise.all([
        api.get('/conversations'),
        api.get('/health-data'),
        api.get('/reminders?upcoming_only=true&is_completed=false'),
      ])

      setStats({
        conversations: conversationsRes.data.length,
        healthData: healthDataRes.data.length,
        reminders: remindersRes.data.length,
        upcomingReminders: remindersRes.data.filter(
          (r: any) => new Date(r.scheduled_at) >= new Date()
        ).length,
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <WelcomeBanner />
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ダッシュボード</h1>
          <p className="text-gray-600">ようこそ、{user?.name}さん</p>
        </div>

        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="会話"
              value={stats.conversations}
              icon={MessageSquare}
              color="primary"
            />
            <StatsCard
              title="健康データ"
              value={stats.healthData}
              icon={Activity}
              color="success"
            />
            <StatsCard
              title="リマインダー"
              value={stats.reminders}
              icon={Bell}
              color="warning"
            />
            <StatsCard
              title="今後の予定"
              value={stats.upcomingReminders}
              icon={Calendar}
              color="secondary"
            />
          </div>
        )}

        <QuickActions />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-1">
            <ConversationsList />
          </div>
          <div className="lg:col-span-1">
            <RemindersList />
          </div>
        </div>
        <HealthDataDashboard />
      </div>
    </DashboardLayout>
  )
}

