import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { AuthStack } from './AuthStack'
import { MainTabs } from './MainTabs'
import type { RootStackParamList } from './types'

const Stack = createNativeStackNavigator<RootStackParamList>()

// Deep link config
const linking = {
  prefixes: ['savorblk://', 'https://savorblk.com'],
  config: {
    screens: {
      Main: {
        screens: {
          ExploreTab: {
            screens: {
              BusinessDetail: 'business/:id',
              Explore: 'explore',
            },
          },
          HBCUsTab: {
            screens: {
              HBCUDetail: 'hbcus/:slug',
            },
          },
          EventsTab: {
            screens: {
              AnnualEventDetail: 'annual-events/:id',
            },
          },
          HomeTab: {
            screens: {
              City: 'city/:slug',
              GuideDetail: 'guides/:id',
            },
          },
          ProfileTab: {
            screens: {
              SharedList: 'lists/:shareCode',
              UserPublicProfile: 'u/:username',
            },
          },
        },
      },
    },
  },
}

export function AppNavigator() {
  const { setSession, setProfile, setRole, setInitialized, isInitialized } = useAuthStore()

  useEffect(() => {
    // Bootstrap auth state on app launch
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)

      if (session?.user) {
        // Load profile + role in parallel
        const [{ data: profile }, { data: roleData }] = await Promise.all([
          supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single(),
          supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single(),
        ])
        if (profile) setProfile(profile)
        if (roleData) setRole(roleData.role)
      }

      setInitialized()
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)

        if (event === 'SIGNED_OUT') {
          setProfile(null)
          setRole('user')
        }

        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
          const [{ data: profile }, { data: roleData }] = await Promise.all([
            supabase
              .from('user_profiles')
              .select('*')
              .eq('id', session.user.id)
              .single(),
            supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id)
              .single(),
          ])
          if (profile) setProfile(profile)
          if (roleData) setRole(roleData.role)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (!isInitialized) return null

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Auth" component={AuthStack} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
