import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { HBCUListScreen } from '../screens/hbcus/HBCUListScreen'
import { HBCUDetailScreen } from '../screens/hbcus/HBCUDetailScreen'
import type { HBCUStackParamList } from './types'

const Stack = createNativeStackNavigator<HBCUStackParamList>()

export function HBCUStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HBCUList" component={HBCUListScreen} />
      <Stack.Screen
        name="HBCUDetail"
        component={HBCUDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  )
}
