'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import api from '@/lib/api'
import { getSocket } from '@/lib/socket'
import { Send, ArrowLeft } from 'lucide-react'
import MessageItem from '@/components/conversations/MessageItem'
import MessageSearch from '@/components/conversations/MessageSearch'
import { NotificationService } from '@/lib/notifications'

interface Message {
  id: number
  user_id: number
  content: string
  created_at: string
  is_read?: boolean
  user?: { name: string; email: string }
}

export default function ConversationPage() {
  const router = useRouter()
  const params = useParams()
  const conversationId = parseInt(params.id as string)
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const socket = getSocket()

  useEffect(() => {
    if (!socket) return

    fetchMessages()
    markMessagesAsRead()

    socket.emit('join_conversation', { conversation_id: conversationId })

    socket.on('new_message', async (message: Message) => {
      setMessages((prev) => {
        const updated = [...prev, message]
        setDisplayedMessages(updated)
        return updated
      })
      
      // Show notification if message is from another user
      if (message.user_id !== user?.id && message.user) {
        await NotificationService.showMessage(
          message.user.name,
          message.content
        )
      }
      
      // Mark as read if current user is viewing
      if (message.user_id !== user?.id) {
        markMessageAsRead(message.id)
      }
    })

    return () => {
      socket.emit('leave_conversation', { conversation_id: conversationId })
    }
  }, [conversationId, socket, user])

  useEffect(() => {
    markMessagesAsRead()
  }, [messages, user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/messages/conversation/${conversationId}`)
      setMessages(response.data)
      setDisplayedMessages(response.data)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMessageSearch = (filteredMessages: Message[]) => {
    setDisplayedMessages(filteredMessages)
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !socket) return

    try {
      socket.emit('send_message', {
        conversation_id: conversationId,
        content: newMessage,
      })
      setNewMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const markMessageAsRead = async (messageId: number) => {
    try {
      await api.put(`/messages/${messageId}/read`)
    } catch (error) {
      console.error('Failed to mark message as read:', error)
    }
  }

  const markMessagesAsRead = async () => {
    if (!user) return
    
    const unreadMessages = messages.filter(
      (msg) => msg.user_id !== user.id && !msg.is_read
    )
    
    for (const message of unreadMessages) {
      await markMessageAsRead(message.id)
    }
    
    // Refresh messages to update read status
    if (unreadMessages.length > 0) {
      fetchMessages()
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse">Loading...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="bg-white rounded-xl shadow-sm h-[calc(100vh-8rem)] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">会話</h2>
        </div>

        <div className="p-4 border-b border-gray-200">
          <MessageSearch messages={messages} onSearch={handleMessageSearch} />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {displayedMessages.length === 0 && messages.length > 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>検索結果が見つかりません</p>
            </div>
          ) : (
            displayedMessages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                onUpdate={fetchMessages}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="メッセージを入力..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              送信
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

