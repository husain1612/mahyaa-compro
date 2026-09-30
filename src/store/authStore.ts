import { create } from 'zustand'
import type { AuthSession } from '@/types'
import { authService } from '@/services/authService'

interface AuthState {
  session: AuthSession | null
  setSession: (s: AuthSession | null) => void
  logout: () => Promise<void>
}

export const useAuth = create<AuthState>((set) => ({
  session: authService.getSession(),
  setSession: (session) => set({ session }),
  logout: async () => {
    await authService.logout()
    set({ session: null })
  },
}))
