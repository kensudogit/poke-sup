'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { MessageSquare, Plus } from 'lucide-react'
import CreateConversationModal from './CreateConversationModal'
import SearchBar from '../common/SearchBar'
import UnreadBadge from './UnreadBadge'

interface Conversation {
  id: number
  patient_id: number
  provider_id: number
  patient?: { name: string; email: string }
  provider?: { name: string; email: string }
  updated_at?: string
  unread_count?: number
}

export default function ConversationsList() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
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
            fetchConversations()
          } else {
            console.warn('No token found for ConversationsList, skipping fetch')
            setLoading(false)
          }
        }, 500)
      } else {
        // トークンが見つかった場合、少し待ってからフェッチ（確実に保存されるまで）
        setTimeout(() => {
          fetchConversations()
        }, 300)
      }
    }
    
    checkAndFetch()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredConversations(conversations)
    } else {
      const filtered = conversations.filter(
        (conv) =>
          conv.patient?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conv.provider?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conv.patient?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conv.provider?.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredConversations(filtered)
    }
  }, [searchQuery, conversations])

  const fetchConversations = async () => {
    try {
      const response = await api.get('/conversations')
      setConversations(response.data)
      setFilteredConversations(response.data)
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleConversationClick = (conversationId: number) => {
    router.push(`/dashboard/conversations/${conversationId}`)
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
          <MessageSquare className="w-6 h-6 text-primary-600" />
          会話
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新規会話
        </button>
      </div>

      <div className="mb-4">
        <SearchBar
          placeholder="会話を検索..."
          onSearch={handleSearch}
        />
      </div>

      <div className="space-y-3">
        {filteredConversations.length === 0 && conversations.length > 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>検索結果が見つかりません</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>会話がありません</p>
            <p className="text-sm">新しい会話を開始してください</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => handleConversationClick(conversation.id)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                conversation.unread_count && conversation.unread_count > 0
                  ? 'border-primary-300 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">
                      {conversation.patient?.name || '患者'} ↔{' '}
                      {conversation.provider?.name || '医療従事者'}
                    </p>
                    <UnreadBadge count={conversation.unread_count || 0} />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {conversation.updated_at
                      ? new Date(conversation.updated_at).toLocaleString('ja-JP')
                      : ''}
                  </p>
                </div>
                <MessageSquare className="w-5 h-5 text-primary-600" />
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <CreateConversationModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchConversations()
            setShowCreateModal(false)
          }}
        />
      )}
    </div>
  )
}

