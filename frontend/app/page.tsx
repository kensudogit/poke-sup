'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import LoginPage from '@/components/auth/LoginPage'
import { useRef, useEffect } from 'react'

export default function Home() {
  const router = useRouter()
  const hasRedirected = useRef(false)
  const mounted = useRef(false)

  useEffect(() => {
    // マウント時のみ実行（無限ループを防ぐ）
    if (mounted.current || hasRedirected.current) {
      return
    }
    mounted.current = true
    
    // 認証状態をチェック
    const state = useAuthStore.getState()
    const localStorageToken = globalThis.window !== undefined ? localStorage.getItem('access_token') : null
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
  const state = useAuthStore.getState()
  if (state.isAuthenticated && state.user && state.accessToken) {
    return null
  }

  return <LoginPage />
}

