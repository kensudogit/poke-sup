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
  const token = localStorage.getItem('access_token')
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
    console.warn('No token found in localStorage for request:', config.url)
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

