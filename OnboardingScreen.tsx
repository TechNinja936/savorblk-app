import React, { useRef, useState } from 'react'
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity, StatusBar,
} from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  interpolate, useAnimatedScrollHandler, Extrapolation,
} from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { GoldButton } from '../../components/ui/GoldButton'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { layout } from '../../theme/spacing'

const { width: SCREEN_W } = Dimensions.get('window')

const SLIDES = [
  {
    key: 'discover',
    icon: 'compass' as const,
    title: 'Discover Black-Owned\nRestaurants & Businesses',
    subtitle: 'Find the best spots in your city — from legendary soul food to award-winning fine dining.',
    gradient: ['#0a0a0a', '#1a0e00'] as const,
    accent: colors.primary,
  },
  {
    key: 'events',
    icon: 'calendar' as const,
    title: 'Signature Events &\nHomecoming Season',
    subtitle: 'HBCU homecomings, Juneteenth celebrations, Black restaurant weeks — never miss the moment.',
    gradient: ['#0a0a0a', '#001a0e'] as const,
    accent: colors.hbcuGreen,
  },
  {
    key: 'routes',
    icon: 'map' as const,
    title: 'AI Vibe Routes\nBuilt Just for You',
    subtitle: 'Tell our AI your vibe. Get a full itinerary with the best Black-owned stops in any city.',
    gradient: ['#0a0a0a', '#1a1200'] as const,
    accent: colors.primary,
  },
  {
    key: 'community',
    icon: 'people' as const,
    title: 'Support the Culture,\nBuild Community',
    subtitle: 'Check in, leave reviews, follow creators, and share your favorite spots with the world.',
    gradient: ['#0a0a0a', '#0e0014'] as const,
    accent: '#a855f7',
  },
]

export function OnboardingScreen() {
  const navigation = useNavigation<any>()
  const scrollX = useSharedValue(0)
  const scrollRef = useRef<Animated.ScrollView>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x
  })

  const goNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      const next = activeIndex + 1
      scrollRef.current?.scrollTo({ x: next * SCREEN_W, animated: true })
      setActiveIndex(next)
    } else {
      navigation.navigate('Login')
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W))
        }}
      >
        {SLIDES.map((slide, index) => (
          <SlideItem key={slide.key} slide={slide} index={index} scrollX={scrollX} />
        ))}
      </Animated.ScrollView>

      {/* Bottom controls */}
      <SafeAreaView edges={['bottom']} style={styles.controls}>
        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <DotIndicator key={i} index={i} scrollX={scrollX} accent={SLIDES[activeIndex].accent} />
          ))}
        </View>

        <GoldButton
          label={activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
          onPress={goNext}
          fullWidth
          size="lg"
          style={styles.cta}
        />

        <TouchableOpacity style={styles.skipRow} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.skip}>Already have an account? </Text>
          <Text style={[styles.skip, { color: colors.primary }]}>Sign in</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  )
}

function SlideItem({
  slide, index, scrollX,
}: {
  slide: typeof SLIDES[0]
  index: number
  scrollX: Animated.SharedValue<number>
}) {
  const iconAnim = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * SCREEN_W, index * SCREEN_W, (index + 1) * SCREEN_W]
    const scale = interpolate(scrollX.value, inputRange, [0.6, 1, 0.6], Extrapolation.CLAMP)
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP)
    return { transform: [{ scale }], opacity }
  })

  const textAnim = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * SCREEN_W, index * SCREEN_W, (index + 1) * SCREEN_W]
    const translateY = interpolate(scrollX.value, inputRange, [40, 0, -40], Extrapolation.CLAMP)
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP)
    return { transform: [{ translateY }], opacity }
  })

  return (
    <View style={[styles.slide, { width: SCREEN_W }]}>
      <LinearGradient colors={slide.gradient as any} style={StyleSheet.absoluteFill} />

      <Animated.View style={[styles.iconWrap, iconAnim]}>
        <View style={[styles.iconCircle, { borderColor: slide.accent + '44' }]}>
          <Ionicons name={slide.icon} size={56} color={slide.accent} />
        </View>
      </Animated.View>

      <Animated.View style={[styles.textBlock, textAnim]}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </Animated.View>
    </View>
  )
}

function DotIndicator({
  index, scrollX, accent,
}: {
  index: number
  scrollX: Animated.SharedValue<number>
  accent: string
}) {
  const style = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * SCREEN_W, index * SCREEN_W, (index + 1) * SCREEN_W]
    const width = interpolate(scrollX.value, inputRange, [8, 24, 8], Extrapolation.CLAMP)
    const opacity = interpolate(scrollX.value, inputRange, [0.4, 1, 0.4], Extrapolation.CLAMP)
    return { width, opacity }
  })
  return <Animated.View style={[styles.dot, { backgroundColor: accent }, style]} />
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 40 },
  iconWrap: { alignItems: 'center' },
  iconCircle: {
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  textBlock: { alignItems: 'center', gap: 16 },
  title: { ...typography.displayMD, color: colors.foreground, textAlign: 'center', lineHeight: 42 },
  subtitle: { ...typography.bodyLG, color: colors.muted, textAlign: 'center', lineHeight: 26 },
  controls: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: layout.screenPaddingH, paddingBottom: 8, gap: 16,
  },
  dots: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  dot: { height: 8, borderRadius: 4 },
  cta: {},
  skipRow: { flexDirection: 'row', justifyContent: 'center', paddingBottom: 8 },
  skip: { ...typography.bodyMD, color: colors.muted },
})
