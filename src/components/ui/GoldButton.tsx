import React from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { radius } from '../../theme/spacing'
import { shadows } from '../../theme/shadows'

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

interface GoldButtonProps {
  label: string
  onPress: () => void
  variant?: 'filled' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export function GoldButton({
  label,
  onPress,
  variant = 'filled',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}: GoldButtonProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 })
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 })
  }

  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: radius.md },
    md: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: radius.lg },
    lg: { paddingVertical: 16, paddingHorizontal: 32, borderRadius: radius.xl },
  }

  const textSizes = {
    sm: typography.buttonSM,
    md: typography.buttonMD,
    lg: typography.buttonLG,
  }

  const variantStyles: Record<string, ViewStyle> = {
    filled: {
      backgroundColor: disabled ? colors.primaryDim : colors.primary,
      ...(shadows.goldGlow as ViewStyle),
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: disabled ? colors.primaryDim : colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
  }

  const textColors = {
    filled: colors.primaryForeground,
    outline: disabled ? colors.primaryDim : colors.primary,
    ghost: disabled ? colors.primaryDim : colors.primary,
  }

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={1}
      style={[
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        fullWidth && styles.fullWidth,
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'filled' ? colors.primaryForeground : colors.primary}
        />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[
              textSizes[size],
              { color: textColors[variant] },
              textStyle,
            ]}
          >
            {label}
          </Text>
          {rightIcon}
        </>
      )}
    </AnimatedTouchable>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fullWidth: {
    width: '100%',
  },
})
