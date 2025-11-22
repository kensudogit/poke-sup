'use client'

import LoginPage from '@/components/auth/LoginPage'
import { useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// グローバルフラグでリダイレクトの重複を防ぐ
let globalRedirectCheckDone = false
let globalRedirectInProgress = false

export default function Home() {
  const router = useRouter()
  const hasChecked = useRef(false)

  useEffect(() => {
    // グローバルフラグとローカルフラグの両方をチェック
    if (globalRedirectCheckDone || hasChecked.current || globalRedirectInProgress) {
      return
    }
    
    hasChecked.current = true
    
    // 認証状態をチェック（一度だけ、同期的に）
    const checkAuth = () => {
      // 既にリダイレクト中なら何もしない
      if (globalRedirectInProgress) {
        return
      }
      
      try {
        const token = localStorage.getItem('access_token')
        if (!token) {
          globalRedirectCheckDone = true
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
              globalRedirectCheckDone = true
              globalRedirectInProgress = true
              
              // window.locationを使用して確実にリダイレクト
              if (globalThis.window && globalThis.window.location.pathname !== '/dashboard') {
                globalThis.window.location.href = '/dashboard'
              }
              return
            }
          }
        } catch (e) {
          console.warn('Failed to parse auth-storage:', e)
        }
      } catch (e) {
        console.warn('Auth check failed:', e)
      }
      
      globalRedirectCheckDone = true
    }
    
    // 少し待ってからチェック（状態の更新を待つ）
    setTimeout(checkAuth, 1000)
    // 依存配列を空にして、マウント時のみ実行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <LoginPage />
}

