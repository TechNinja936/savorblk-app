import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import type { Database } from '../types/database.types'

// Secure token storage for Supabase Auth session
const ExpoSecureStoreAdapter = {
  getItem: (key: string): Promise<string | null> =>
    SecureStore.getItemAsync(key),
  setItem: (key: string, value: string): Promise<void> =>
    SecureStore.setItemAsync(key, value),
  removeItem: (key: string): Promise<void> =>
    SecureStore.deleteItemAsync(key),
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Copy .env.example → .env and fill in values.'
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Storage bucket helpers
export const storageUrl = (bucket: string, path: string) =>
  `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`

export const avatarUrl = (path: string) => storageUrl('avatars', path)
export const businessPhotoUrl = (path: string) => storageUrl('business-photos', path)
export const eventFlyerUrl = (path: string) => storageUrl('event-flyers', path)
export const guideImageUrl = (path: string) => storageUrl('guide-images', path)
