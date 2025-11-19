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
        console.log('Setting token')
        localStorage.setItem('access_token', token)
        const state = get()
        set({ accessToken: token, isAuthenticated: !!state.user || !!token })
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
        if (state?.accessToken) {
          console.log('Rehydrated with token, setting authenticated')
          state.isAuthenticated = true
        }
      },
    }
  )
)

