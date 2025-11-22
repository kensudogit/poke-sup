'use client'

import { useRouter } from 'next/navigation'
import LoginPage from '@/components/auth/LoginPage'
import { useRef, useEffect } from 'react'

// グローバルフラグでリダイレクトの重複を防ぐ
let globalRedirectCheckDone = false

export default function Home() {
  const router = useRouter()
  const hasChecked = useRef(false)

  useEffect(() => {
    // グローバルフラグとローカルフラグの両方をチェック
    if (globalRedirectCheckDone || hasChecked.current) {
      return
    }
    
    hasChecked.current = true
    globalRedirectCheckDone = true
    
    // 認証状態をチェック（一度だけ、同期的に）
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('access_token')
        if (!token) {
          return
        }
        
        // Zustandのストレージからも確認
        try {
          const authStorage = localStorage.getItem('auth-storage')
          if (authStorage) {
            const parsed = JSON.parse(authStorage)
            const user = parsed?.state?.user
            const accessToken = parsed?.state?.accessToken
            
            if (user && accessToken) {
              console.log('Already authenticated, redirecting to dashboard')
              router.push('/dashboard')
              return
            }
          }
        } catch (e) {
          console.warn('Failed to parse auth-storage:', e)
        }
      } catch (e) {
        console.warn('Auth check failed:', e)
      }
    }
    
    // 少し待ってからチェック（状態の更新を待つ）
    setTimeout(checkAuth, 500)
    // 依存配列を空にして、マウント時のみ実行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <LoginPage />
}

