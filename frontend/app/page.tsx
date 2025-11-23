'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // ログイン処理をパスして、直接ダッシュボードにリダイレクト
    if (globalThis.window && globalThis.window.location.pathname !== '/dashboard') {
      globalThis.window.location.href = '/dashboard'
    }
  }, [])

  return null
}

