'use client'

interface UnreadBadgeProps {
  count: number
  className?: string
}

export default function UnreadBadge({ count, className = '' }: UnreadBadgeProps) {
  if (count === 0) return null

  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full ${className}`}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}

