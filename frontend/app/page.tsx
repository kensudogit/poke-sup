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
    if (isAuthenticated && user) {
      console.log('Already authenticated, redirecting to dashboard')
      router.push('/dashboard')
      router.refresh()
    }
  }, [isAuthenticated, user, accessToken, router])

  if (isAuthenticated && user) {
    return null
  }

  return <LoginPage />
}

