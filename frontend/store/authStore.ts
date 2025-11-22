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
        const state = get()
        // トークンがある場合は認証済みとみなす
        const isAuth = !!(state.accessToken || localStorage.getItem('access_token'))
        set({ user, isAuthenticated: isAuth })
      },
      setToken: (token) => {
        console.log('Setting token', { tokenLength: token?.length, tokenPrefix: token?.substring(0, 20) })
        
        // localStorageに先に保存（同期的に）
        try {
          localStorage.setItem('access_token', token)
          console.log('Token saved to localStorage')
        } catch (error) {
          console.error('Failed to save token to localStorage:', error)
        }
        
        // その後、zustandの状態を更新
        const state = get()
        set({ accessToken: token, isAuthenticated: !!state.user || !!token })
        
        // 保存を確認（同期的に）
        const savedToken = localStorage.getItem('access_token')
        if (savedToken !== token) {
          console.warn('Token mismatch detected, retrying save...')
          localStorage.setItem('access_token', token)
        }
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
        })
        
        // トークンの同期: localStorageとstateの両方を確認
        // stateにトークンがあるが、localStorageにない場合は同期
        if (state.accessToken && !token) {
          console.log('Syncing token from state to localStorage')
          try {
            localStorage.setItem('access_token', state.accessToken)
          } catch (error) {
            console.error('Failed to save token to localStorage during rehydration:', error)
          }
        }
        
        // トークンとユーザーの両方が存在する場合のみ認証済みとみなす
        const finalIsAuthenticated = !!(state.accessToken && state.user)
        
        // 状態が実際に変更された場合のみ更新を返す（無限ループを防ぐ）
        if (state.isAuthenticated !== finalIsAuthenticated) {
          console.log('Updating isAuthenticated during rehydration', { 
            hasToken: !!state.accessToken, 
            hasUser: !!state.user, 
            isAuthenticated: finalIsAuthenticated 
          })
          return {
            isAuthenticated: finalIsAuthenticated,
          }
        }
      },
    }
  )
)

