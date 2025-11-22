'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import LoginPage from '@/components/auth/LoginPage'

export default function Home() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, accessToken } = useAuthStore()
  const hasRedirected = useRef(false)
  const checkCount = useRef(0)

  useEffect(() => {
    // 既にリダイレクト済み、または既にダッシュボードにいる場合は何もしない
    if (hasRedirected.current || pathname === '/dashboard') {
      return
    }
    
    // チェック回数を制限（無限ループを防ぐ）
    checkCount.current++
    if (checkCount.current > 1) {
      return
    }
    
    // トークンを確認（localStorageとstateの両方）
    const localStorageToken = localStorage.getItem('access_token')
    const finalToken = accessToken || localStorageToken
    
    // 認証済みでユーザー情報とトークンがある場合のみリダイレクト
    if (isAuthenticated && user && finalToken) {
      console.log('Already authenticated, redirecting to dashboard')
      hasRedirected.current = true
      router.push('/dashboard')
    }
    // 依存配列を最小限に（pathnameとrouterは安定しているため除外）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, accessToken])

  // 認証済みの場合は何も表示しない（リダイレクト中）
  if (isAuthenticated && user && accessToken) {
    return null
  }

  return <LoginPage />
}

