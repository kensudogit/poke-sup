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
        const isAuth = !!state.accessToken || !!localStorage.getItem('access_token')
        set({ user, isAuthenticated: isAuth || true })
      },
      setToken: (token) => {
        console.log('Setting token', { tokenLength: token?.length, tokenPrefix: token?.substring(0, 20) })
        
        // まずzustandの状態を更新
        const state = get()
        set({ accessToken: token, isAuthenticated: !!state.user || !!token })
        
        // その後、localStorageに確実に保存（非同期で実行される可能性があるため、少し待つ）
        try {
          localStorage.setItem('access_token', token)
          console.log('Token saved to localStorage')
          
          // 保存を確認（少し待ってから確認）
          setTimeout(() => {
            const savedToken = localStorage.getItem('access_token')
            if (savedToken !== token) {
              console.warn('Token mismatch detected, retrying save...')
              localStorage.setItem('access_token', token)
            }
            console.log('Token verification:', { saved: !!savedToken, matches: savedToken === token })
          }, 100)
        } catch (error) {
          console.error('Failed to save token to localStorage:', error)
          // エラーが発生した場合でも、状態は更新されているので続行
        }
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
          return { user: null, accessToken: null, isAuthenticated: false }
        }
        
        const token = localStorage.getItem('access_token')
        console.log('Rehydrating storage', {
          hasStateToken: !!state.accessToken,
          hasLocalStorageToken: !!token,
          stateToken: state.accessToken?.substring(0, 20),
          localStorageToken: token?.substring(0, 20),
        })
        
        // トークンの同期: localStorageとstateの両方を確認
        let finalToken = state.accessToken || token
        let finalIsAuthenticated = false
        
        if (finalToken) {
          // localStorageにトークンがあるが、stateにない場合は同期
          if (token && !state.accessToken) {
            console.log('Syncing token from localStorage to state')
            finalToken = token
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
          
          finalIsAuthenticated = true
          console.log('Rehydrated with token, setting authenticated')
        }
        
        // 状態を更新して返す（これによりzustandの状態が更新される）
        return {
          ...state,
          accessToken: finalToken,
          isAuthenticated: finalIsAuthenticated,
        }
      },
    }
  )
)

