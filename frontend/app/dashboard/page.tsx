'use client'

import { useState, useRef, useEffect } from 'react'
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

  const hasCheckedAuth = useRef(false)
  const hasFetchedStats = useRef(false)

  const fetchStats = async () => {
    try {
      // 認証状態を再確認（APIリクエスト前に）
      const token = localStorage.getItem('access_token')
      const state = useAuthStore.getState()
      const finalToken = state.accessToken || token
      
      if (!finalToken) {
        console.warn('No token found, skipping stats fetch')
        setLoading(false)
        return
      }
      
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
    } catch (error: any) {
      console.error('Failed to fetch stats:', error)
      // 401エラーの場合は、リダイレクトはapi.tsのインターセプターで処理される
      if (error.response?.status === 401) {
        console.log('401 error in fetchStats, redirect will be handled by interceptor')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // マウント時のみ実行（無限ループを防ぐ）
    if (hasCheckedAuth.current) {
      return
    }
    hasCheckedAuth.current = true
    
    // 認証状態とトークンの両方を確認
    const token = localStorage.getItem('access_token')
    const state = useAuthStore.getState()
    const finalToken = state.accessToken || token
    const finalUser = state.user
    const finalIsAuth = state.isAuthenticated
    
    if (!finalIsAuth || !finalUser || !finalToken) {
      console.log('Not authenticated, redirecting to login', { 
        isAuthenticated: finalIsAuth, 
        hasUser: !!finalUser, 
        hasToken: !!finalToken
      })
      // 状態をクリアしてからリダイレクト
      try {
        localStorage.removeItem('access_token')
        localStorage.removeItem('auth-storage')
        useAuthStore.getState().logout()
      } catch (e) {
        console.warn('Failed to clear auth state:', e)
      }
      // リダイレクト（少し待ってから実行）
      setTimeout(() => {
        router.push('/')
      }, 100)
      return
    }
    
    if (!hasFetchedStats.current) {
      hasFetchedStats.current = true
      console.log('Authenticated, waiting for token to be saved before fetching stats')
      // トークンが確実に保存されるまで少し待つ
      setTimeout(() => {
        const token = localStorage.getItem('access_token')
        if (token) {
          console.log('Token confirmed, fetching stats')
          fetchStats()
        } else {
          console.warn('Token not found after delay, retrying...')
          // もう一度試行
          setTimeout(() => {
            const retryToken = localStorage.getItem('access_token')
            if (retryToken) {
              console.log('Token found on retry, fetching stats')
              fetchStats()
            } else {
              console.error('Token still not found, skipping stats fetch')
              setLoading(false)
            }
          }, 500)
        }
      }, 300) // 300ms待機
    }
    // 依存配列を空にして、マウント時のみ実行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

