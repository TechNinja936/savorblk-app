import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native'
import Animated, {
  useSharedValue, useAnimatedScrollHandler, useAnimatedStyle,
  interpolate, Extrapolation,
} from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { LinearGradient } from 'expo-linear-gradient'
import { Image } from 'expo-image'
import { FlashList } from '@shopify/flash-list'
import { supabase } from '../../lib/supabase'
import { businessService } from '../../services/businessService'
import { BusinessCard } from '../../components/business/BusinessCard'
import { Badge } from '../../components/ui/Badge'
import { SkeletonLoader } from '../../components/ui/SkeletonLoader'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { layout, spacing } from '../../theme/spacing'

const { width: SCREEN_W } = Dimensions.get('window')
const HERO_H = 280

const CATEGORY_FILTERS = ['All', 'Restaurants', 'Bars', 'Cafes', 'Food Trucks', 'Lounges', 'Bakeries']

export function CityScreen() {
  const navigation = useNavigation<any>()
  const { citySlug, cityName } = useRoute<any>().params
  const scrollY = useSharedValue(0)
  const [activeCategory, setActiveCategory] = useState('All')

  const scrollHandler = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y
  })

  const heroStyle = useAnimatedStyle(() => ({
    transform: [{
      translateY: interpolate(scrollY.value, [0, HERO_H], [0, HERO_H * 0.4], Extrapolation.CLAMP),
    }],
  }))

  const headerOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [HERO_H - 80, HERO_H - 40], [0, 1], Extrapolation.CLAMP),
  }))

  const { data: cityProfile } = useQuery({
    queryKey: ['city', citySlug],
    queryFn: async () => {
      const { data } = await supabase
        .from('city_profiles')
        .select('*')
        .eq('slug', citySlug)
        .single()
      return data
    },
  })

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ['businesses', 'city', citySlug, activeCategory],
    queryFn: () => businessService.getBusinessesForCity(citySlug, activeCategory === 'All' ? undefined : activeCategory),
  })

  return (
    <View style={styles.container}>
      {/* Opaque header on scroll */}
      <Animated.View style={[styles.stickyHeader, headerOpacityStyle]} pointerEvents="none">
        <View style={StyleSheet.absoluteFill}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />
        </View>
      </Animated.View>

      <SafeAreaView edges={['top']} style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Animated.Text style={[styles.navTitle, headerOpacityStyle]}>
          {cityName}
        </Animated.Text>
        <View style={{ width: 40 }} />
      </SafeAreaView>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroContainer}>
          <Animated.View style={[styles.heroBg, heroStyle]}>
            <Image
              source={{ uri: cityProfile?.hero_image_url || `https://source.unsplash.com/800x500/?${cityName},city` }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(10,10,10,0.7)', colors.background]}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          <View style={styles.heroContent}>
            {cityProfile?.featured && <Badge label="Featured City" variant="primary" icon="star-outline" />}
            <Text style={styles.cityName}>{cityName}</Text>
            {cityProfile?.tagline && (
              <Text style={styles.cityTagline}>{cityProfile.tagline}</Text>
            )}
            <View style={styles.statsRow}>
              <StatChip icon="restaurant-outline" value={`${businesses.length}+`} label="Spots" />
              {cityProfile?.neighborhood_count && (
                <StatChip icon="map-outline" value={String(cityProfile.neighborhood_count)} label="Neighborhoods" />
              )}
            </View>
          </View>
        </View>

        {/* Category Pills */}
        <Animated.ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {CATEGORY_FILTERS.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryPill, activeCategory === cat && styles.activePill]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.categoryText, activeCategory === cat && styles.activePillText]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.ScrollView>

        {/* Business Grid */}
        <View style={styles.gridContainer}>
          {isLoading ? (
            <View style={styles.skeletonGrid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonLoader.BusinessCard key={i} />
              ))}
            </View>
          ) : (
            <FlashList
              data={businesses}
              numColumns={2}
              estimatedItemSize={240}
              renderItem={({ item }) => (
                <View style={styles.cardWrap}>
                  <BusinessCard
                    business={item}
                    onPress={() => navigation.navigate('BusinessDetail', { businessId: item.id })}
                  />
                </View>
              )}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Ionicons name="storefront-outline" size={40} color={colors.muted} />
                  <Text style={styles.emptyText}>No spots found</Text>
                </View>
              }
            />
          )}
        </View>
      </Animated.ScrollView>
    </View>
  )
}

function StatChip({ icon, value, label }: { icon: any; value: string; label: string }) {
  return (
    <View style={styles.statChip}>
      <Ionicons name={icon} size={14} color={colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  stickyHeader: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 100, zIndex: 10,
  },
  navBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingH, paddingTop: 8,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center',
  },
  navTitle: { ...typography.labelLG, color: colors.foreground },
  heroContainer: { height: HERO_H, overflow: 'hidden' },
  heroBg: { ...StyleSheet.absoluteFillObject },
  heroContent: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: layout.screenPaddingH, gap: 8,
  },
  cityName: { ...typography.displayLG, color: colors.foreground },
  cityTagline: { ...typography.bodyMD, color: 'rgba(242,242,242,0.7)' },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  statChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: colors.border,
  },
  statValue: { ...typography.labelMD, color: colors.foreground },
  statLabel: { ...typography.caption, color: colors.muted },
  categoryRow: { paddingHorizontal: layout.screenPaddingH, paddingVertical: spacing[3], gap: 8 },
  categoryPill: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border,
  },
  activePill: { backgroundColor: colors.primary, borderColor: colors.primary },
  categoryText: { ...typography.labelSM, color: colors.muted },
  activePillText: { color: '#000' },
  gridContainer: { paddingHorizontal: layout.screenPaddingH, paddingBottom: spacing[10] },
  skeletonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cardWrap: { flex: 1, margin: 6 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { ...typography.bodyMD, color: colors.muted },
})
