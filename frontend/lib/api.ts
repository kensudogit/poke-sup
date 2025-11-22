import axios from 'axios'

// API URLの設定
// ローカル開発環境: localhost:5002
// Railway環境: 同じオリジン（window.location.origin）
const getApiUrl = () => {
  // 環境変数が設定されている場合はそれを使用（優先）
  if (process.env.NEXT_PUBLIC_API_URL) {
    return `${process.env.NEXT_PUBLIC_API_URL}/api`
  }
  
  // ブラウザ環境での判定
  if (globalThis.window !== undefined) {
    const hostname = globalThis.window.location.hostname
    const port = globalThis.window.location.port
    
    // ローカル開発環境（localhostまたは127.0.0.1、かつポート3000番台）
    if ((hostname === 'localhost' || hostname === '127.0.0.1') && (port === '3000' || port === '3002' || port === '')) {
      return 'http://localhost:5002/api'
    }
    
    // Railway環境やその他の本番環境では、現在のオリジンを使用
    return `${globalThis.window.location.origin}/api`
  }
  
  // サーバーサイドレンダリング時はデフォルト値を使用
  return 'http://localhost:5002/api'
}

// 初期baseURLを設定（実行時に動的に更新される）
let baseURL = '/api'

// ブラウザ環境でローカル開発環境を検出
if (globalThis.window !== undefined) {
  const hostname = globalThis.window.location.hostname
  const port = globalThis.window.location.port
  
  // ローカル開発環境の場合のみ絶対URLを使用
  if ((hostname === 'localhost' || hostname === '127.0.0.1') && (port === '3000' || port === '3002' || port === '')) {
    baseURL = 'http://localhost:5002/api'
  }
}

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  // まずlocalStorageから取得を試みる
  let token = localStorage.getItem('access_token')
  
  // localStorageにない場合は、zustandのストレージから取得を試みる
  if (!token) {
    try {
      const authStorage = localStorage.getItem('auth-storage')
      if (authStorage) {
        const parsed = JSON.parse(authStorage)
        const accessToken = parsed?.state?.accessToken
        if (accessToken && typeof accessToken === 'string') {
          token = accessToken
          // localStorageにも保存（確実に保存するため、複数回試行）
          // accessTokenはstring型であることが保証されている
          try {
            localStorage.setItem('access_token', accessToken)
            console.log('Token synced from zustand storage to localStorage')
          } catch (e) {
            console.warn('Failed to save synced token to localStorage:', e)
          }
        }
      }
    } catch (error) {
      console.warn('Failed to parse auth-storage:', error)
    }
  }
  
  // トークンが見つからない場合、もう一度試行
  if (!token) {
    token = localStorage.getItem('access_token')
  }
  
  if (token) {
    // トークンが正しい形式か確認
    const trimmedToken = token.trim()
    if (trimmedToken && !trimmedToken.startsWith('Bearer ')) {
      config.headers.Authorization = `Bearer ${trimmedToken}`
    } else if (trimmedToken) {
      config.headers.Authorization = trimmedToken
    }
    // デバッグ用ログ（開発環境のみ）
    if (process.env.NODE_ENV === 'development') {
      console.log('Adding token to request:', {
        url: config.url,
        hasToken: !!token,
        tokenLength: token?.length,
        tokenPrefix: token?.substring(0, 20),
      })
    }
  } else {
    console.warn('No token found in localStorage for request:', config.url, {
      hasAccessToken: !!localStorage.getItem('access_token'),
      hasAuthStorage: !!localStorage.getItem('auth-storage'),
    })
  }
  return config
})

// Handle token expiration
// グローバルフラグでリダイレクトの重複を防ぐ
let isRedirecting = false
let redirectTimeout: NodeJS.Timeout | null = null

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // リダイレクトの重複を防ぐ（グローバルフラグを使用）
      if (!isRedirecting && globalThis.window !== undefined) {
        isRedirecting = true
        
        // 既存のタイムアウトをクリア
        if (redirectTimeout) {
          clearTimeout(redirectTimeout)
        }
        
        // トークンと認証状態をクリア
        try {
          localStorage.removeItem('access_token')
          localStorage.removeItem('auth-storage')
        } catch (e) {
          console.warn('Failed to clear localStorage:', e)
        }
        
        // Zustandの状態もクリア
        try {
          const { useAuthStore } = require('@/store/authStore')
          useAuthStore.getState().logout()
        } catch (e) {
          console.warn('Failed to clear auth store:', e)
        }
        
        // リダイレクト（少し待ってから実行、重複を防ぐ）
        redirectTimeout = setTimeout(() => {
          if (globalThis.window.location.pathname !== '/') {
            console.log('Redirecting to login due to 401 error')
            globalThis.window.location.href = '/'
          }
          // リダイレクトフラグをリセット（10秒後、十分な時間を確保）
          setTimeout(() => {
            isRedirecting = false
            redirectTimeout = null
          }, 10000)
        }, 200)
      }
    }
    return Promise.reject(error)
  }
)

export default api

