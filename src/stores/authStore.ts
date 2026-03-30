import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Session, User } from '@supabase/supabase-js'
import type { UserProfile } from '../types/database.types'
import { mmkvStorage } from '../lib/queryClient'

type Role = 'admin' | 'owner' | 'user'

interface AuthState {
  session: Session | null
  user: User | null
  profile: UserProfile | null
  role: Role
  isLoading: boolean
  isInitialized: boolean

  setSession: (session: Session | null) => void
  setProfile: (profile: UserProfile | null) => void
  setRole: (role: Role) => void
  setLoading: (loading: boolean) => void
  setInitialized: () => void
  signOut: () => void

  // Computed helpers
  isLoggedIn: () => boolean
  isAdmin: () => boolean
  isOwner: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      profile: null,
      role: 'user',
      isLoading: true,
      isInitialized: false,

      setSession: (session) =>
        set({
          session,
          user: session?.user ?? null,
          isLoading: false,
        }),

      setProfile: (profile) => set({ profile }),
      setRole: (role) => set({ role }),
      setLoading: (isLoading) => set({ isLoading }),
      setInitialized: () => set({ isInitialized: true }),

      signOut: () =>
        set({
          session: null,
          user: null,
          profile: null,
          role: 'user',
          isLoading: false,
        }),

      isLoggedIn: () => !!get().session,
      isAdmin: () => get().role === 'admin',
      isOwner: () => get().role === 'owner' || get().role === 'admin',
    }),
    {
      name: 'savorblk-auth',
      storage: createJSONStorage(() => require('@react-native-async-storage/async-storage').default),
      // Only persist the profile + role across sessions (not the session token — SecureStore handles that)
      partialize: (state) => ({
        profile: state.profile,
        role: state.role,
      }),
    }
  )
)
