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

  useEffect(() => {
    // 既にリダイレクト済み、または既にダッシュボードにいる場合は何もしない
    if (hasRedirected.current || pathname === '/dashboard') {
      return
    }
    
    // トークンを確認（localStorageとstateの両方）
    const localStorageToken = localStorage.getItem('access_token')
    const finalToken = accessToken || localStorageToken
    
    console.log('Home page - isAuthenticated:', isAuthenticated, 'user:', user, 'token:', finalToken ? 'present' : 'missing')
    
    // 認証済みでユーザー情報とトークンがある場合のみリダイレクト
    if (isAuthenticated && user && finalToken) {
      console.log('Already authenticated, redirecting to dashboard')
      hasRedirected.current = true
      router.push('/dashboard')
    } else if (isAuthenticated && user && !finalToken) {
      // トークンが失われている場合は、認証状態をリセット
      console.warn('Token missing despite authentication, resetting auth state')
      useAuthStore.getState().logout()
    }
    // pathnameとrouterを依存配列から除外（安定しているため）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, accessToken])

  // 認証済みの場合は何も表示しない（リダイレクト中）
  if (isAuthenticated && user) {
    return null
  }

  return <LoginPage />
}

