import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../api/client'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password })
        localStorage.setItem('token', data.access_token)
        set({ user: data.user, token: data.access_token, isAuthenticated: true })
        return data.user
      },

      register: async (username, email, password) => {
        const { data } = await api.post('/auth/register', { username, email, password })
        localStorage.setItem('token', data.access_token)
        set({ user: data.user, token: data.access_token, isAuthenticated: true })
        return data.user
      },

      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null, isAuthenticated: false })
      },

      updateUser: (updates) => {
        set((state) => ({ user: { ...state.user, ...updates } }))
      },

      refreshUser: async () => {
        try {
          const { data } = await api.get('/auth/me')
          set({ user: data })
        } catch {
          get().logout()
        }
      },
    }),
    { name: 'auth-store', partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated }) }
  )
)
