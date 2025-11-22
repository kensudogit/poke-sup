'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import LoginPage from '@/components/auth/LoginPage'
import { useRef } from 'react'

export default function Home() {
  const router = useRouter()
  const hasRedirected = useRef(false)

  // 認証状態をチェック（レンダリング中に直接チェック）
  if (globalThis.window !== undefined && !hasRedirected.current) {
    const state = useAuthStore.getState()
    const localStorageToken = localStorage.getItem('access_token')
    const finalToken = state.accessToken || localStorageToken
    const finalUser = state.user
    const finalIsAuth = state.isAuthenticated
    
    // 認証済みでユーザー情報とトークンがある場合のみリダイレクト
    if (finalIsAuth && finalUser && finalToken) {
      console.log('Already authenticated, redirecting to dashboard')
      hasRedirected.current = true
      // 次のティックでリダイレクト（レンダリング中に直接pushしない）
      setTimeout(() => {
        router.push('/dashboard')
      }, 0)
    }
  }

  // 認証済みの場合は何も表示しない（リダイレクト中）
  const state = useAuthStore.getState()
  if (state.isAuthenticated && state.user && state.accessToken) {
    return null
  }

  return <LoginPage />
}

