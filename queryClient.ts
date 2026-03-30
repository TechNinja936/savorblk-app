import { QueryClient } from '@tanstack/react-query'
import AsyncStorage from '@react-native-async-storage/async-storage'

// React Query client — aggressive caching for premium feel
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 3,       // 3 minutes fresh
      gcTime: 1000 * 60 * 10,          // 10 minutes in cache
      retry: 1,
      retryDelay: 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
})

// AsyncStorage-backed persister (works in Expo Go + production)
export const mmkvStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try { return await AsyncStorage.getItem(key) } catch { return null }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try { await AsyncStorage.setItem(key, value) } catch {}
  },
  removeItem: async (key: string): Promise<void> => {
    try { await AsyncStorage.removeItem(key) } catch {}
  },
}
