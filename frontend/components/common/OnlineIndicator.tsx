'use client'

import { Circle } from 'lucide-react'

interface OnlineIndicatorProps {
  isOnline: boolean
  className?: string
}

export default function OnlineIndicator({ isOnline, className = '' }: OnlineIndicatorProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Circle
        className={`w-2 h-2 ${
          isOnline ? 'text-green-500 fill-green-500' : 'text-gray-400 fill-gray-400'
        }`}
      />
      <span className="text-xs text-gray-600">{isOnline ? 'オンライン' : 'オフライン'}</span>
    </div>
  )
}

