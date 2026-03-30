import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { BlurView } from 'expo-blur'
import { Platform, StyleSheet, View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { HomeStack } from './HomeStack'
import { ExploreStack } from './ExploreStack'
import { EventsStack } from './EventsStack'
import { HBCUStack } from './HBCUStack'
import { ProfileStack } from './ProfileStack'
import { colors } from '../theme/colors'
import { fonts } from '../theme/typography'
import type { MainTabParamList } from './types'

const Tab = createBottomTabNavigator<MainTabParamList>()

type TabIcon = 'compass' | 'search' | 'calendar' | 'school' | 'person'

function TabBarIcon({ name, color, size }: { name: string; color: string; size: number }) {
  return <Ionicons name={`${name}-outline` as any} size={size} color={color} />
}

export function MainTabs() {
  const insets = useSafeAreaInsets()
  const tabBarHeight = 56 + (insets.bottom || 0)

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: {
          fontFamily: fonts.bodyMedium,
          fontSize: 10,
          marginTop: -2,
        },
        tabBarStyle: {
          height: tabBarHeight,
          borderTopWidth: 0.5,
          borderTopColor: colors.glassBorder,
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.tabBarBg,
          position: 'absolute',
          elevation: 0,
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={75}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.tabBarBg }]} />
          ),
        tabBarIconStyle: { marginTop: 4 },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="compass" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ExploreTab"
        component={ExploreStack}
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="search" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="EventsTab"
        component={EventsStack}
        options={{
          tabBarLabel: 'Events',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="calendar" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="HBCUsTab"
        component={HBCUStack}
        options={{
          tabBarLabel: 'HBCUs',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="school" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="person" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}
