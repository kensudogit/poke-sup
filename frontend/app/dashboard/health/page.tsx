'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import HealthDataDashboard from '@/components/health/HealthDataDashboard'
import HealthGoals from '@/components/health/HealthGoals'

export default function HealthPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">健康データ</h1>
          <p className="text-gray-600">健康状態を記録・管理</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <HealthDataDashboard />
          </div>
          <div className="lg:col-span-1">
            <HealthGoals />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

