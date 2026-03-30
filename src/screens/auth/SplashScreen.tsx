import React, { useEffect } from 'react'
import { View, Text, StyleSheet, StatusBar } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  runOnJS,
} from 'react-native-reanimated'
import { useNavigation } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import { colors, gradients } from '../../theme/colors'
import { typography } from '../../theme/typography'

export function SplashScreen() {
  const navigation = useNavigation<any>()
  const logoScale = useSharedValue(0.7)
  const logoOpacity = useSharedValue(0)
  const taglineOpacity = useSharedValue(0)

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }))

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }))

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 600 })
    logoScale.value = withSpring(1, { damping: 12 })
    taglineOpacity.value = withDelay(400, withTiming(1, { duration: 500 }))

    // Navigate to onboarding / login after 2s
    const timer = setTimeout(() => {
      navigation.replace('Onboarding')
    }, 2200)

    return () => clearTimeout(timer)
  }, [])

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <LinearGradient colors={['#0a0a0a', '#1a1200', '#0a0a0a']} style={StyleSheet.absoluteFill} />

      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <Text style={styles.logo}>SavorBLK</Text>
      </Animated.View>

      <Animated.Text style={[styles.tagline, taglineStyle]}>
        Discover · Support · Experience
      </Animated.Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  logoContainer: {},
  logo: {
    ...typography.displayXL,
    color: colors.primary,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  tagline: {
    ...typography.labelMD,
    color: colors.muted,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
})
