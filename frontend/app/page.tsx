'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import LoginPage from '@/components/auth/LoginPage'

export default function Home() {
  const router = useRouter()
  const { user, isAuthenticated, accessToken } = useAuthStore()

  useEffect(() => {
    console.log('Home page - isAuthenticated:', isAuthenticated, 'user:', user, 'token:', accessToken)
    // 認証済みでユーザー情報がある場合のみリダイレクト
    // 現在のパスを確認して、既にリダイレクト中でないことを確認
    if (isAuthenticated && user && accessToken) {
      console.log('Already authenticated, redirecting to dashboard')
      router.push('/dashboard')
    }
  }, [isAuthenticated, user, accessToken, router])

  if (isAuthenticated && user) {
    return null
  }

  return <LoginPage />
}

