import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set) => ({
      isDark: true,
      toggle: () =>
        set((state) => {
          const next = !state.isDark
          document.documentElement.classList.toggle('dark', next)
          return { isDark: next }
        }),
      init: () => {
        const stored = JSON.parse(localStorage.getItem('theme-store') || '{}')
        document.documentElement.classList.toggle('dark', stored?.state?.isDark !== false)
      },
    }),
    { name: 'theme-store' }
  )
)
