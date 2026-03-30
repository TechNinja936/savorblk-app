import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { HomeScreen } from '../screens/home/HomeScreen'
import { CityScreen } from '../screens/home/CityScreen'
import { GuideDetailScreen } from '../screens/home/GuideDetailScreen'
import { ArticlesScreen } from '../screens/home/ArticlesScreen'
import { ArticleDetailScreen } from '../screens/home/ArticleDetailScreen'
import type { HomeStackParamList } from './types'

const Stack = createNativeStackNavigator<HomeStackParamList>()

export function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="City"
        component={CityScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="GuideDetail"
        component={GuideDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Articles"
        component={ArticlesScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="ArticleDetail"
        component={ArticleDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  )
}
