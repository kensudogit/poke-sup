'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { X, Search } from 'lucide-react'

const conversationSchema = z.object({
  provider_id: z.number().min(1, '医療従事者を選択してください'),
})

type ConversationForm = z.infer<typeof conversationSchema>

interface User {
  id: number
  name: string
  email: string
  role: string
}

interface CreateConversationModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function CreateConversationModal({
  onClose,
  onSuccess,
}: CreateConversationModalProps) {
  const { user } = useAuthStore()
  const [providers, setProviders] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ConversationForm>({
    resolver: zodResolver(conversationSchema),
  })

  useEffect(() => {
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      // 実際の実装では、医療従事者のリストを取得するAPIエンドポイントが必要
      // ここでは仮の実装
      const response = await api.get('/users?role=healthcare_provider')
      setProviders(response.data || [])
    } catch (error) {
      console.error('Failed to fetch providers:', error)
    }
  }

  const filteredProviders = providers.filter(
    (provider) =>
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const onSubmit = async (data: ConversationForm) => {
    setError(null)
    setLoading(true)

    try {
      await api.post('/conversations', {
        patient_id: user?.id,
        provider_id: data.provider_id,
      })
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.error || '会話の作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">新しい会話を開始</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              医療従事者を検索
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="名前またはメールアドレスで検索..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {filteredProviders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>医療従事者が見つかりません</p>
              </div>
            ) : (
              filteredProviders.map((provider) => (
                <label
                  key={provider.id}
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 cursor-pointer transition-all"
                >
                  <input
                    type="radio"
                    {...register('provider_id')}
                    value={provider.id}
                    onChange={() => setValue('provider_id', provider.id)}
                    className="mr-3"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{provider.name}</p>
                    <p className="text-sm text-gray-500">{provider.email}</p>
                  </div>
                </label>
              ))
            )}
          </div>

          {errors.provider_id && (
            <p className="text-sm text-red-600">{errors.provider_id.message}</p>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {loading ? '作成中...' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


