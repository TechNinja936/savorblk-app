import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { EventsScreen } from '../screens/events/EventsScreen'
import { SignatureEventsScreen } from '../screens/events/SignatureEventsScreen'
import { AnnualEventDetailScreen } from '../screens/events/AnnualEventDetailScreen'
import type { EventsStackParamList } from './types'

const Stack = createNativeStackNavigator<EventsStackParamList>()

export function EventsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Events" component={EventsScreen} />
      <Stack.Screen
        name="SignatureEvents"
        component={SignatureEventsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="AnnualEventDetail"
        component={AnnualEventDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  )
}
