'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ProfileModal from '@/components/dashboard/ProfileModal'
import { User, Bell, Shield, Globe, Palette } from 'lucide-react'
import { toast } from '@/components/common/Toast'

export default function SettingsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [showProfileModal, setShowProfileModal] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  const settingsSections = [
    {
      title: 'プロフィール',
      description: 'アカウント情報を編集',
      icon: User,
      action: () => setShowProfileModal(true),
      color: 'primary',
    },
    {
      title: '通知設定',
      description: '通知の設定を管理',
      icon: Bell,
      action: () => toast.info('通知設定機能は準備中です'),
      color: 'secondary',
      disabled: true,
    },
    {
      title: 'プライバシー',
      description: 'プライバシー設定を管理',
      icon: Shield,
      action: () => toast.info('プライバシー設定機能は準備中です'),
      color: 'success',
      disabled: true,
    },
    {
      title: '言語設定',
      description: '表示言語を変更',
      icon: Globe,
      action: () => toast.info('言語設定機能は準備中です'),
      color: 'warning',
      disabled: true,
    },
    {
      title: 'テーマ設定',
      description: 'ダークモードなどの設定',
      icon: Palette,
      action: () => toast.info('テーマ設定機能は準備中です'),
      color: 'danger',
      disabled: true,
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">設定</h1>
          <p className="text-gray-600">アカウント設定とアプリケーション設定を管理</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {settingsSections.map((section) => {
            const Icon = section.icon
            const colorClasses = {
              primary: 'bg-primary-50 text-primary-600',
              secondary: 'bg-secondary-50 text-secondary-600',
              success: 'bg-green-50 text-green-600',
              warning: 'bg-yellow-50 text-yellow-600',
              danger: 'bg-red-50 text-red-600',
            }

            return (
              <button
                key={section.title}
                onClick={section.action}
                disabled={section.disabled}
                className={`bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all text-left ${
                  section.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg ${colorClasses[section.color]} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.title}</h3>
                <p className="text-sm text-gray-600">{section.description}</p>
                {section.disabled && (
                  <span className="inline-block mt-2 text-xs text-gray-400">準備中</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </DashboardLayout>
  )
}

