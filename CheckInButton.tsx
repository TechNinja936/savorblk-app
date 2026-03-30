import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { useUIStore } from '../../stores/uiStore'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { radius } from '../../theme/spacing'

interface CheckInButtonProps {
  businessId: string
  style?: ViewStyle
}

export function CheckInButton({ businessId, style }: CheckInButtonProps) {
  const { user, isLoggedIn } = useAuthStore()
  const { showToast } = useUIStore()
  const qc = useQueryClient()
  const scale = useSharedValue(1)
  const iconRotate = useSharedValue(0)

  const today = new Date().toISOString().split('T')[0]

  // Check if user already checked in today
  const { data: checkedInToday = false } = useQuery({
    queryKey: ['checkin-today', businessId, user?.id, today],
    queryFn: async () => {
      if (!user) return false
      const { data } = await supabase
        .from('business_checkins')
        .select('id')
        .eq('user_id', user.id)
        .eq('business_id', businessId)
        .eq('checkin_date', today)
        .maybeSingle()
      return !!data
    },
    enabled: !!user,
  })

  // Get total check-in count
  const { data: count = 0 } = useQuery({
    queryKey: ['checkin-count', businessId],
    queryFn: async () => {
      const { count } = await supabase
        .from('business_checkins')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', businessId)
      return count ?? 0
    },
  })

  const { mutate: checkIn, isPending } = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not logged in')
      await supabase.from('business_checkins').insert({
        user_id: user.id,
        business_id: businessId,
        checkin_date: today,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['checkin-today', businessId] })
      qc.invalidateQueries({ queryKey: ['checkin-count', businessId] })
      showToast('Checked in! 🎉', 'success')
    },
    onError: () => {
      showToast('Could not check in. Try again.', 'error')
    },
  })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${iconRotate.value}deg` },
    ],
  }))

  const handlePress = () => {
    if (!isLoggedIn()) {
      showToast('Sign in to check in', 'info')
      return
    }
    if (checkedInToday) {
      showToast('Already checked in today', 'info')
      return
    }
    scale.value = withSequence(
      withSpring(1.2, { damping: 6 }),
      withSpring(1, { damping: 12 })
    )
    iconRotate.value = withSequence(
      withTiming(15, { duration: 100 }),
      withTiming(-15, { duration: 100 }),
      withTiming(0, { duration: 100 })
    )
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    checkIn()
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isPending}
      style={[styles.container, checkedInToday && styles.checkedIn, style]}
      activeOpacity={0.8}
    >
      <Animated.View style={[styles.row, animatedStyle]}>
        <Ionicons
          name={checkedInToday ? 'location' : 'location-outline'}
          size={16}
          color={checkedInToday ? colors.primary : colors.foreground}
        />
        <Text style={[styles.label, checkedInToday && styles.labelActive]}>
          {checkedInToday ? 'Checked In' : 'Check In'}
        </Text>
      </Animated.View>
      {count > 0 && (
        <Text style={styles.count}>{count}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.lg,
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkedIn: {
    backgroundColor: 'rgba(201,153,10,0.1)',
    borderColor: colors.primaryDim,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    ...typography.buttonMD,
    color: colors.foreground,
  },
  labelActive: {
    color: colors.primary,
  },
  count: {
    ...typography.labelSM,
    color: colors.muted,
  },
})
