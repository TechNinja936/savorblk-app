import React, { useState } from 'react'
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { useUIStore } from '../../stores/uiStore'
import { colors } from '../../theme/colors'

interface FavoriteButtonProps {
  businessId: string
  size?: number
  style?: ViewStyle
}

export function FavoriteButton({ businessId, size = 22, style }: FavoriteButtonProps) {
  const { user, isLoggedIn } = useAuthStore()
  const { showToast } = useUIStore()
  const qc = useQueryClient()
  const scale = useSharedValue(1)

  const { data: isFavorited = false } = useQuery({
    queryKey: ['favorite', businessId, user?.id],
    queryFn: async () => {
      if (!user) return false
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('business_id', businessId)
        .maybeSingle()
      return !!data
    },
    enabled: !!user,
  })

  const { mutate: toggleFavorite } = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not logged in')
      if (isFavorited) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('business_id', businessId)
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, business_id: businessId })
      }
    },
    onMutate: async () => {
      // Optimistic update
      await qc.cancelQueries({ queryKey: ['favorite', businessId, user?.id] })
      qc.setQueryData(['favorite', businessId, user?.id], !isFavorited)
    },
    onError: () => {
      qc.setQueryData(['favorite', businessId, user?.id], isFavorited)
      showToast('Something went wrong', 'error')
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['favorites'] })
    },
  })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePress = () => {
    if (!isLoggedIn()) {
      showToast('Sign in to save favorites', 'info')
      return
    }
    scale.value = withSequence(
      withSpring(1.4, { damping: 6 }),
      withSpring(1, { damping: 10 })
    )
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    toggleFavorite()
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.button, style]}
      activeOpacity={0.85}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Animated.View style={animatedStyle}>
        <Ionicons
          name={isFavorited ? 'heart' : 'heart-outline'}
          size={size}
          color={isFavorited ? colors.destructive : colors.foreground}
        />
      </Animated.View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    padding: 6,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
  },
})
