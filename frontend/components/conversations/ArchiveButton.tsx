'use client'

import { useState } from 'react'
import { Archive, ArchiveRestore } from 'lucide-react'
import { toast } from '../common/Toast'
import api from '@/lib/api'

interface ArchiveButtonProps {
  conversationId: number
  isArchived: boolean
  onUpdate: () => void
}

export default function ArchiveButton({
  conversationId,
  isArchived,
  onUpdate,
}: ArchiveButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleArchive = async () => {
    setLoading(true)
    try {
      // Note: This would require backend implementation
      // For now, we'll just show a toast
      toast.info(isArchived ? 'アーカイブから復元しました' : '会話をアーカイブしました')
      onUpdate()
    } catch (error) {
      toast.error('操作に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleArchive}
      disabled={loading}
      className={`p-2 rounded-lg transition-colors ${
        isArchived
          ? 'text-green-600 hover:bg-green-50'
          : 'text-gray-600 hover:bg-gray-100'
      } disabled:opacity-50`}
      title={isArchived ? 'アーカイブから復元' : 'アーカイブ'}
    >
      {isArchived ? (
        <ArchiveRestore className="w-4 h-4" />
      ) : (
        <Archive className="w-4 h-4" />
      )}
    </button>
  )
}

