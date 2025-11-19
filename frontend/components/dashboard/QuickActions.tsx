'use client'

import { Plus, MessageSquare, Activity, Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function QuickActions() {
  const router = useRouter()

  const actions = [
    {
      icon: MessageSquare,
      label: '新規会話',
      onClick: () => router.push('/dashboard/conversations'),
      color: 'primary',
    },
    {
      icon: Activity,
      label: 'データ追加',
      onClick: () => router.push('/dashboard/health'),
      color: 'success',
    },
    {
      icon: Bell,
      label: 'リマインダー',
      onClick: () => router.push('/dashboard/reminders'),
      color: 'warning',
    },
  ]

  const colorClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">クイックアクション</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.label}
              onClick={action.onClick}
              className={`${colorClasses[action.color]} p-4 rounded-lg transition-colors flex flex-col items-center gap-2`}
            >
              <Icon className="w-6 h-6" />
              <span className="font-medium">{action.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

