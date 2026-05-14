import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../api/client'

// Read localStorage synchronously so the very first render has the correct
// auth state — prevents the login↔home flash before Zustand hydrates.
const _saved = (() => {
  try { return JSON.parse(localStorage.getItem('auth-store') || '{}')?.state ?? {} }
  catch { return {} }
})()

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: _saved.user ?? null,
      token: _saved.token ?? null,
      isAuthenticated: _saved.isAuthenticated ?? false,

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
