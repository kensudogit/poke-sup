'use client'

import { useState } from 'react'
import { Edit, Trash2, Check, X } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { toast } from '../common/Toast'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

interface Message {
  id: number
  user_id: number
  content: string
  created_at: string
  is_read?: boolean
  user?: { name: string; email: string }
}

interface MessageItemProps {
  message: Message
  onUpdate: () => void
}

export default function MessageItem({ message, onUpdate }: MessageItemProps) {
  const { user } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const [loading, setLoading] = useState(false)
  const isOwn = message.user_id === user?.id

  const handleEdit = async () => {
    if (!editContent.trim()) {
      toast.error('メッセージを入力してください')
      return
    }

    setLoading(true)
    try {
      await api.put(`/messages/${message.id}`, { content: editContent })
      toast.success('メッセージを更新しました')
      setIsEditing(false)
      onUpdate()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'メッセージの編集に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('このメッセージを削除しますか？')) {
      return
    }

    setLoading(true)
    try {
      await api.delete(`/messages/${message.id}`)
      toast.success('メッセージを削除しました')
      onUpdate()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'メッセージの削除に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (isEditing) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <div className="max-w-xs lg:max-w-md w-full">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full px-4 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            rows={3}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleEdit}
              disabled={loading}
              className="px-3 py-1 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <Check className="w-4 h-4" />
              保存
            </button>
            <button
              onClick={() => {
                setIsEditing(false)
                setEditContent(message.content)
              }}
              className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              キャンセル
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
      <div className="max-w-xs lg:max-w-md relative">
        {!isOwn && (
          <p className="text-xs font-semibold mb-1 text-gray-600">
            {message.user?.name}
          </p>
        )}
        <div
          className={`px-4 py-2 rounded-lg ${
            isOwn
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          <p className="text-sm">{message.content}</p>
          <div className="flex items-center gap-2 mt-1">
            <p
              className={`text-xs ${
                isOwn ? 'text-primary-100' : 'text-gray-500'
              }`}
            >
              {format(new Date(message.created_at), 'HH:mm', { locale: ja })}
            </p>
            {isOwn && (
              <span
                className={`text-xs ${
                  message.is_read ? 'text-primary-200' : 'text-primary-100'
                }`}
                title={message.is_read ? '既読' : '未読'}
              >
                {message.is_read ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        </div>
        {isOwn && (
          <div className="absolute -right-12 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
              title="編集"
            >
              <Edit className="w-3 h-3" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="削除"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

