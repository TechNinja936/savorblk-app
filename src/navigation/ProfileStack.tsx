import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ProfileScreen } from '../screens/profile/ProfileScreen'
import { EditProfileScreen } from '../screens/profile/EditProfileScreen'
import { FavoritesScreen } from '../screens/profile/FavoritesScreen'
import { VibeRoutesScreen } from '../screens/profile/VibeRoutesScreen'
import { ItineraryDetailScreen } from '../screens/profile/ItineraryDetailScreen'
import { PlaylistBuilderScreen } from '../screens/profile/PlaylistBuilderScreen'
import { ListBuilderScreen } from '../screens/profile/ListBuilderScreen'
import { SharedListScreen } from '../screens/profile/SharedListScreen'
import { MyBusinessScreen } from '../screens/profile/MyBusinessScreen'
import { CreatorApplicationScreen } from '../screens/profile/CreatorApplicationScreen'
import { UserPublicProfileScreen } from '../screens/profile/UserPublicProfileScreen'
import type { ProfileStackParamList } from './types'

const Stack = createNativeStackNavigator<ProfileStackParamList>()

export function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="VibeRoutes"
        component={VibeRoutesScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="ItineraryDetail"
        component={ItineraryDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="PlaylistBuilder"
        component={PlaylistBuilderScreen}
        options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }}
      />
      <Stack.Screen
        name="ListBuilder"
        component={ListBuilderScreen}
        options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
      />
      <Stack.Screen
        name="SharedList"
        component={SharedListScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="MyBusiness"
        component={MyBusinessScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="CreatorApplication"
        component={CreatorApplicationScreen}
        options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
      />
      <Stack.Screen
        name="UserPublicProfile"
        component={UserPublicProfileScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  )
}
