import React, { useEffect } from 'react'
import { Text, StyleSheet, ViewStyle } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { radius } from '../../theme/spacing'
import { useUIStore } from '../../stores/uiStore'

interface ToastProps {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

const toastConfig = {
  success: { icon: 'checkmark-circle' as const, color: colors.success },
  error:   { icon: 'alert-circle' as const,     color: colors.destructive },
  info:    { icon: 'information-circle' as const, color: colors.primary },
}

function Toast({ id, message, type }: ToastProps) {
  const { dismissToast } = useUIStore()
  const translateY = useSharedValue(-100)
  const opacity = useSharedValue(0)
  const config = toastConfig[type]

  useEffect(() => {
    translateY.value = withSpring(0, { damping: 20 })
    opacity.value = withTiming(1, { duration: 200 })

    // Auto-dismiss after 3s
    const dismiss = () => {
      translateY.value = withTiming(-100, { duration: 300 })
      opacity.value = withDelay(100, withTiming(0, { duration: 200 }, () => {
        runOnJS(dismissToast)(id)
      }))
    }
    const timer = setTimeout(dismiss, 3000)
    return () => clearTimeout(timer)
  }, [])

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }))

  return (
    <Animated.View style={[styles.toast, animStyle]}>
      <Ionicons name={config.icon} size={18} color={config.color} />
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  )
}

export function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts)
  const insets = useSafeAreaInsets()

  return (
    <Animated.View style={[styles.container, { top: insets.top + 8 }]} pointerEvents="none">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} />
      ))}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    ...typography.bodyMD,
    color: colors.foreground,
    flex: 1,
  },
})
