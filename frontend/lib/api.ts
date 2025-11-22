import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'

const api = axios.create({
  baseURL: `${API_URL}/api`,
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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export default api

