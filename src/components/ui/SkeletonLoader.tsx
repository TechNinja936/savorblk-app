import React, { useEffect } from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { colors } from '../../theme/colors'
import { radius } from '../../theme/spacing'

interface SkeletonProps {
  width?: number | string
  height?: number
  borderRadius?: number
  style?: ViewStyle
}

export function Skeleton({ width = '100%', height = 16, borderRadius = radius.sm, style }: SkeletonProps) {
  const shimmer = useSharedValue(0)

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1200 }),
      -1,
      false
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(shimmer.value, [0, 1], [-300, 300]),
      },
    ],
  }))

  return (
    <View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.skeletonBase,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <LinearGradient
          colors={['transparent', colors.skeletonHighlight, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  )
}

// Pre-built skeleton for BusinessCard
export function BusinessCardSkeleton({ style }: { style?: ViewStyle }) {
  return (
    <View style={[skeletonStyles.card, style]}>
      <Skeleton height={140} borderRadius={0} />
      <View style={skeletonStyles.body}>
        <Skeleton width="75%" height={14} />
        <Skeleton width="45%" height={11} style={{ marginTop: 6 }} />
        <Skeleton width="60%" height={11} style={{ marginTop: 4 }} />
      </View>
    </View>
  )
}

// Pre-built skeleton for EventFlyerCard
export function EventFlyerSkeleton({ style }: { style?: ViewStyle }) {
  return (
    <View style={[skeletonStyles.flyer, style]}>
      <Skeleton height={240} borderRadius={12} />
      <View style={{ padding: 10 }}>
        <Skeleton width="80%" height={13} />
        <Skeleton width="55%" height={11} style={{ marginTop: 6 }} />
      </View>
    </View>
  )
}

const skeletonStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  body: {
    padding: 10,
  },
  flyer: {
    width: 160,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
})
