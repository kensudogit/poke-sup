'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { 
  MessageSquare, 
  Activity, 
  Bell, 
  LogOut, 
  User,
  Menu,
  X,
  Settings,
  Calendar
} from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import ProfileModal from './ProfileModal'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const navItems = [
    { href: '/dashboard', icon: MessageSquare, label: '会話' },
    { href: '/dashboard/health', icon: Activity, label: '健康データ' },
    { href: '/dashboard/reminders', icon: Bell, label: 'リマインダー' },
    { href: '/dashboard/calendar', icon: Calendar, label: 'カレンダー' },
    { href: '/dashboard/settings', icon: Settings, label: '設定' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-full overflow-hidden shadow-md ring-2 ring-white animate-sway">
            <img
              src="/utsubo_image1.png"
              alt="ポケさぽロゴ"
              className="object-cover w-full h-full"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out`}
        >
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-md ring-2 ring-white animate-sway">
                  <img
                    src="/utsubo_image1.png"
                    alt="ポケさぽロゴ"
                    className="object-cover w-full h-full"
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-50 text-gray-700 hover:text-primary-600 transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="p-4 border-t border-gray-200">
              <div 
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-3 px-4 py-3 mb-2 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <Settings className="w-4 h-4 text-gray-400" />
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">ログアウト</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 lg:ml-0 p-4 lg:p-8">
          {children}
        </main>
      </div>

      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </div>
  )
}

