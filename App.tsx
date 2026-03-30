import 'react-native-gesture-handler'
import React, { useEffect, useCallback } from 'react'
import { StatusBar, LogBox } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'
import { QueryClientProvider } from '@tanstack/react-query'
// Stripe uses native modules — load lazily so Expo Go doesn't crash
let StripeProvider: React.ComponentType<any> = ({ children }: any) => children
try { StripeProvider = require('@stripe/stripe-react-native').StripeProvider } catch {}
import * as SplashScreen from 'expo-splash-screen'
import {
  useFonts,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display'
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans'
import { ToastContainer } from './src/components/ui/ToastNotification'
import { AppNavigator, linking } from './src/navigation/AppNavigator'
import { queryClient } from './src/lib/queryClient'
import { registerForPushNotifications } from './src/lib/notifications'
import { useAuthStore } from './src/stores/authStore'

// Keep splash screen visible while fonts load
SplashScreen.preventAutoHideAsync()

// Suppress known harmless warnings in dev
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Sending `onAnimatedValueUpdate`',
])

const STRIPE_PK = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''

export default function App() {
  const { isLoggedIn, user } = useAuthStore()

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_500Medium,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  })

  // Register push notifications when user signs in
  useEffect(() => {
    if (isLoggedIn() && user?.id) {
      registerForPushNotifications(user.id).catch(() => {
        // Non-critical: user may have denied permissions
      })
    }
  }, [isLoggedIn()])

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StripeProvider publishableKey={STRIPE_PK} merchantIdentifier="merchant.com.savorblk.app">
            <NavigationContainer linking={linking}>
              <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
              <AppNavigator />
              <ToastContainer />
            </NavigationContainer>
          </StripeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
