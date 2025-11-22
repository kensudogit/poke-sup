import axios from 'axios'

// API URLの設定
// ローカル開発環境: localhost:5002
// Railway環境: 同じオリジン（window.location.origin）
const getApiUrl = () => {
  // 環境変数が設定されている場合はそれを使用（優先）
  // ただし、localhostを含む場合は、Railway環境では使用しない
  if (process.env.NEXT_PUBLIC_API_URL) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    console.log('NEXT_PUBLIC_API_URL found:', apiUrl)
    
    // ブラウザ環境で、localhost以外のhostnameの場合、NEXT_PUBLIC_API_URLがlocalhostなら無視
    if (globalThis.window !== undefined) {
      const hostname = globalThis.window.location.hostname
      const isLocalhostInEnv = apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')
      const isProduction = hostname !== 'localhost' && hostname !== '127.0.0.1'
      
      if (isLocalhostInEnv && isProduction) {
        console.warn('NEXT_PUBLIC_API_URL contains localhost but running in production, ignoring it')
        // 環境変数を無視して、現在のオリジンを使用
      } else {
        console.log('Using NEXT_PUBLIC_API_URL:', apiUrl)
        return `${apiUrl}/api`
      }
    } else {
      // SSR時はそのまま使用
      return `${apiUrl}/api`
    }
  }
  
  // ブラウザ環境での判定
  if (globalThis.window !== undefined) {
    const hostname = globalThis.window.location.hostname
    const port = globalThis.window.location.port
    const origin = globalThis.window.location.origin
    
    // ローカル開発環境の判定を厳密にする
    // localhostまたは127.0.0.1で、かつポートが3000または3002の場合のみ
    const isLocalDev = (hostname === 'localhost' || hostname === '127.0.0.1') && 
                       (port === '3000' || port === '3002')
    
    console.log('Environment detection:', {
      hostname,
      port,
      origin,
      isLocalDev,
    })
    
    if (isLocalDev) {
      // ローカル開発環境のみ、localhost:5002を使用
      return 'http://localhost:5002/api'
    }
    
    // Railway環境やその他の本番環境では、現在のオリジンを使用
    console.log('Using origin for API URL:', `${origin}/api`)
    return `${origin}/api`
  }
  
  // サーバーサイドレンダリング時はデフォルト値を使用
  return 'http://localhost:5002/api'
}

// 初期baseURLを設定（getApiUrl関数を使用）
const baseURL = getApiUrl()

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// デバッグ用: baseURLをログ出力（常に出力）
if (globalThis.window !== undefined) {
  const hostname = globalThis.window.location.hostname
  const port = globalThis.window.location.port
  const origin = globalThis.window.location.origin
  const isLocalDev = (hostname === 'localhost' || hostname === '127.0.0.1') && 
                     (port === '3000' || port === '3002')
  
  console.log('API baseURL initialized:', {
    baseURL,
    hostname,
    port: port || '(empty)',
    origin,
    isLocalDev,
    env: process.env.NODE_ENV,
    nextPublicApiUrl: process.env.NEXT_PUBLIC_API_URL || '(not set)',
  })
} else {
  console.log('API baseURL initialized (SSR):', baseURL)
}

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
    // デバッグ用ログ（常に出力、本番環境でも確認できるように）
    const authHeader = typeof config.headers.Authorization === 'string' 
      ? config.headers.Authorization.substring(0, 30) + '...'
      : String(config.headers.Authorization)
    console.log('Adding token to request:', {
      url: config.url,
      hasToken: !!token,
      tokenLength: token?.length,
      tokenPrefix: token?.substring(0, 20),
      authorizationHeader: authHeader,
    })
  } else {
    console.warn('No token found in localStorage for request:', config.url, {
      hasAccessToken: !!localStorage.getItem('access_token'),
      hasAuthStorage: !!localStorage.getItem('auth-storage'),
      url: config.url,
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
    // 接続エラーの処理
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      console.error('Network connection error:', {
        code: error.code,
        message: error.message,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: error.config?.baseURL + error.config?.url,
      })
      
      // 接続エラーの場合は、エラーをそのまま返す（リダイレクトはしない）
      return Promise.reject(error)
    }
    
    if (error.response?.status === 401) {
      // ログイン/登録エンドポイントでの401エラーは、認証情報が間違っているだけなので
      // ログアウト処理を実行しない
      const url = error.config?.url || ''
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register')
      
      if (isAuthEndpoint) {
        // ログイン/登録エンドポイントでの401エラーは、そのまま返す（ログアウトしない）
        console.log('401 error on auth endpoint, not logging out')
        return Promise.reject(error)
      }
      
      // その他のエンドポイントでの401エラーは、認証が無効になったのでログアウト処理を実行
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

