import * as Notifications from 'expo-notifications'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'
import { supabase } from './supabase'

// expo-device may not be installed yet — resolve lazily so the app doesn't crash
let Device: { isDevice: boolean } = { isDevice: true }
try { Device = require('expo-device') } catch { /* use default — assume physical device */ }

const PUSH_TOKEN_KEY = 'savorblk_push_token'

// Configure notification handler — show alerts while app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export async function registerForPushNotifications(userId: string): Promise<string | null> {
  if (!Device.isDevice) return null

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') return null

  // Android: create notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'SavorBLK',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#d4a017',
    })
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync({
    projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
  })

  if (!token) return null

  // Cache token locally
  const cached = await SecureStore.getItemAsync(PUSH_TOKEN_KEY)
  if (cached === token) return token // Already registered this token

  await SecureStore.setItemAsync(PUSH_TOKEN_KEY, token)

  // Save to Supabase user_profiles
  await supabase
    .from('user_profiles')
    .update({ push_token: token })
    .eq('id', userId)

  return token
}

export async function clearPushToken(userId: string) {
  await SecureStore.deleteItemAsync(PUSH_TOKEN_KEY)
  await supabase
    .from('user_profiles')
    .update({ push_token: null })
    .eq('id', userId)
}

export function useNotificationListeners(
  onNotification?: (notification: Notifications.Notification) => void,
  onResponse?: (response: Notifications.NotificationResponse) => void,
) {
  const notifSub = Notifications.addNotificationReceivedListener((notification) => {
    onNotification?.(notification)
  })
  const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
    onResponse?.(response)
  })
  return () => {
    notifSub.remove()
    responseSub.remove()
  }
}
