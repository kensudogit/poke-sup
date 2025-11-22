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
  const mounted = useRef(false)

  useEffect(() => {
    // マウント時のみ実行（無限ループを防ぐ）
    if (mounted.current || hasRedirected.current) {
      return
    }
    mounted.current = true
    
    // 既にダッシュボードにいる場合は何もしない
    if (pathname === '/dashboard') {
      return
    }
    
    // トークンを確認（localStorageとstateの両方）
    const localStorageToken = localStorage.getItem('access_token')
    const state = useAuthStore.getState()
    const finalToken = state.accessToken || localStorageToken
    const finalUser = state.user
    const finalIsAuth = state.isAuthenticated
    
    // 認証済みでユーザー情報とトークンがある場合のみリダイレクト
    if (finalIsAuth && finalUser && finalToken) {
      console.log('Already authenticated, redirecting to dashboard')
      hasRedirected.current = true
      router.push('/dashboard')
    }
    // 依存配列を空にして、マウント時のみ実行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 認証済みの場合は何も表示しない（リダイレクト中）
  if (isAuthenticated && user && accessToken) {
    return null
  }

  return <LoginPage />
}

