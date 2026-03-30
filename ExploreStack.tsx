import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ExploreScreen } from '../screens/explore/ExploreScreen'
import { MapExploreScreen } from '../screens/explore/MapExploreScreen'
import { BusinessDetailScreen } from '../screens/business/BusinessDetailScreen'
import { ClaimBusinessScreen } from '../screens/business/ClaimBusinessScreen'
import type { ExploreStackParamList } from './types'

const Stack = createNativeStackNavigator<ExploreStackParamList>()

export function ExploreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Explore" component={ExploreScreen} />
      <Stack.Screen
        name="MapExplore"
        component={MapExploreScreen}
        options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
      />
      <Stack.Screen
        name="BusinessDetail"
        component={BusinessDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="ClaimBusiness"
        component={ClaimBusinessScreen}
        options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
      />
    </Stack.Navigator>
  )
}
