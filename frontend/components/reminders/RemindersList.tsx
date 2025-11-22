'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Bell, Plus } from 'lucide-react'
import ReminderForm from './ReminderForm'
import ReminderItem from './ReminderItem'
import SearchBar from '../common/SearchBar'

interface Reminder {
  id: number
  title: string
  description?: string
  reminder_type?: string
  scheduled_at: string
  is_completed: boolean
}

export default function RemindersList() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [filteredReminders, setFilteredReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // トークンが確実に保存されるまで少し待ってからフェッチ
    const checkAndFetch = async () => {
      // トークンを確認（複数回試行）
      let token = localStorage.getItem('access_token')
      if (!token) {
        // Zustandのストレージからも確認
        try {
          const authStorage = localStorage.getItem('auth-storage')
          if (authStorage) {
            const parsed = JSON.parse(authStorage)
            token = parsed?.state?.accessToken
            if (token && typeof token === 'string') {
              localStorage.setItem('access_token', token)
            }
          }
        } catch (e) {
          console.warn('Failed to parse auth-storage:', e)
        }
      }
      
      if (!token) {
        // トークンが見つからない場合、少し待ってから再試行
        setTimeout(() => {
          const retryToken = localStorage.getItem('access_token')
          if (retryToken) {
            fetchReminders()
          } else {
            console.warn('No token found for RemindersList, skipping fetch')
            setLoading(false)
          }
        }, 500)
      } else {
        // トークンが見つかった場合、少し待ってからフェッチ（確実に保存されるまで）
        setTimeout(() => {
          fetchReminders()
        }, 300)
      }
    }
    
    checkAndFetch()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredReminders(reminders)
    } else {
      const filtered = reminders.filter(
        (reminder) =>
          reminder.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          reminder.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          reminder.reminder_type?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredReminders(filtered)
    }
  }, [searchQuery, reminders])

  const fetchReminders = async () => {
    try {
      const response = await api.get('/reminders', {
        params: { 
          upcoming_only: 'true', 
          is_completed: 'false' 
        },
      })
      setReminders(response.data || [])
      setFilteredReminders(response.data || [])
    } catch (error: any) {
      console.error('Failed to fetch reminders:', error)
      if (error.response?.status === 422) {
        console.error('422 Unprocessable Entity:', {
          status: error.response.status,
          data: error.response.data,
          url: error.config?.url,
          params: error.config?.params,
        })
      }
      // エラーが発生しても空配列を設定
      setReminders([])
      setFilteredReminders([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }


  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="w-6 h-6 text-primary-600" />
          リマインダー
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          追加
        </button>
      </div>

      <div className="mb-4">
        <SearchBar
          placeholder="リマインダーを検索..."
          onSearch={handleSearch}
        />
      </div>

      <div className="space-y-3">
        {filteredReminders.length === 0 && reminders.length > 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>検索結果が見つかりません</p>
          </div>
        ) : filteredReminders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>リマインダーがありません</p>
            <p className="text-sm">新しいリマインダーを作成してください</p>
          </div>
        ) : (
          filteredReminders.map((reminder) => (
            <ReminderItem key={reminder.id} reminder={reminder} onUpdate={fetchReminders} />
          ))
        )}
      </div>

      {showForm && (
        <ReminderForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            fetchReminders()
            setShowForm(false)
          }}
        />
      )}
    </div>
  )
}

