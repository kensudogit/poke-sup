'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'

interface Message {
  id: number
  content: string
  created_at: string
  user?: { name: string }
}

interface MessageSearchProps {
  messages: Message[]
  onSearch: (filteredMessages: Message[]) => void
}

export default function MessageSearch({ messages, onSearch }: MessageSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    
    if (query.trim() === '') {
      onSearch(messages)
      return
    }

    const filtered = messages.filter((message) =>
      message.content.toLowerCase().includes(query.toLowerCase())
    )
    onSearch(filtered)
  }

  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="メッセージを検索..."
        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
      {searchQuery && (
        <button
          onClick={() => handleSearch('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

