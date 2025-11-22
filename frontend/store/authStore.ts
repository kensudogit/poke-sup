import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: number
  email: string
  name: string
  role: 'patient' | 'healthcare_provider' | 'admin'
  language: string
  created_at?: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setUser: (user) => {
        console.log('Setting user:', user)
        set({ user, isAuthenticated: true })
      },
      setToken: (token) => {
        console.log('Setting token', { tokenLength: token?.length, tokenPrefix: token?.substring(0, 20) })
        // localStorageに確実に保存
        try {
          localStorage.setItem('access_token', token)
          console.log('Token saved to localStorage')
        } catch (error) {
          console.error('Failed to save token to localStorage:', error)
        }
        const state = get()
        set({ accessToken: token, isAuthenticated: !!state.user || !!token })
        // 保存を確認
        const savedToken = localStorage.getItem('access_token')
        console.log('Token verification:', { saved: !!savedToken, matches: savedToken === token })
      },
      logout: () => {
        console.log('Logging out')
        localStorage.removeItem('access_token')
        set({ user: null, accessToken: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // ストレージから復元された後、トークンがある場合は認証済みとみなす
        if (!state) {
          console.warn('State is undefined during rehydration')
          return
        }
        
        const token = localStorage.getItem('access_token')
        console.log('Rehydrating storage', {
          hasStateToken: !!state.accessToken,
          hasLocalStorageToken: !!token,
          stateToken: state.accessToken?.substring(0, 20),
          localStorageToken: token?.substring(0, 20),
        })
        
        // localStorageにトークンがあるが、stateにない場合は同期
        if (token && !state.accessToken) {
          console.log('Syncing token from localStorage to state')
          state.accessToken = token
        }
        
        // stateにトークンがあるが、localStorageにない場合は同期
        if (state.accessToken && !token) {
          console.log('Syncing token from state to localStorage')
          try {
            localStorage.setItem('access_token', state.accessToken)
          } catch (error) {
            console.error('Failed to save token to localStorage during rehydration:', error)
          }
        }
        
        // トークンがある場合は認証済みとみなす
        if (state.accessToken || token) {
          state.isAuthenticated = true
          console.log('Rehydrated with token, setting authenticated')
        }
      },
    }
  )
)

