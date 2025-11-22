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
        // トークンがある場合は認証済みとみなす（localStorageへのアクセスを最小限に）
        const isAuth = !!state.accessToken
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
        // ストレージから復元された後、最小限の処理のみ実行
        if (!state) {
          return
        }
        
        // トークンの同期
        const token = localStorage.getItem('access_token')
        
        // stateにトークンがあるが、localStorageにない場合は同期
        if (state.accessToken && !token) {
          try {
            localStorage.setItem('access_token', state.accessToken)
            console.log('Token synced from state to localStorage during rehydration')
          } catch (error) {
            console.error('Failed to save token to localStorage during rehydration:', error)
          }
        }
        
        // localStorageにトークンがあるが、stateにない場合は同期
        if (token && !state.accessToken) {
          console.log('Token found in localStorage but not in state, syncing...')
          // 状態を更新しない（無限ループを防ぐため、次のレンダリングで反映される）
        }
        
        // 状態の更新は行わない（無限ループを防ぐ）
        // isAuthenticatedは既にpersistで復元されているため、追加の更新は不要
        return
      },
    }
  )
)

