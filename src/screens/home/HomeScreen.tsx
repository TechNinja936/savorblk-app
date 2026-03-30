import React, { useCallback, useState } from 'react'
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native'
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'

import { businessService } from '../../services/businessService'
import { eventService } from '../../services/eventService'
import { guideService } from '../../services/guideService'

import { VibePills } from '../../components/search/VibePills'
import { SearchBar } from '../../components/search/SearchBar'
import { BusinessCard } from '../../components/business/BusinessCard'
import { BusinessCardSkeleton } from '../../components/ui/SkeletonLoader'
import { GoldButton } from '../../components/ui/GoldButton'
import { Badge } from '../../components/ui/Badge'

import { colors, gradients } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { spacing, radius, layout } from '../../theme/spacing'

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView)

const HERO_HEIGHT = 340
const HEADER_HEIGHT = 60

const FEATURED_CITIES = [
  { slug: 'houston',      name: 'Houston',       emoji: '🤠' },
  { slug: 'atlanta',      name: 'Atlanta',        emoji: '🍑' },
  { slug: 'detroit',      name: 'Detroit',        emoji: '🏙️' },
  { slug: 'new-orleans',  name: 'New Orleans',    emoji: '🎷' },
  { slug: 'new-york',     name: 'New York',       emoji: '🗽' },
  { slug: 'chicago',      name: 'Chicago',        emoji: '🌬️' },
  { slug: 'washington-dc',name: 'Washington D.C.',emoji: '🏛️' },
  { slug: 'philadelphia', name: 'Philadelphia',   emoji: '🔔' },
]

export function HomeScreen() {
  const navigation = useNavigation<any>()
  const scrollY = useSharedValue(0)
  const [refreshing, setRefreshing] = useState(false)

  const { data: newAndNotable, refetch: refetchBiz } = useQuery({
    queryKey: ['businesses', 'new-notable'],
    queryFn: businessService.getNewAndNotable,
    staleTime: 1000 * 60 * 5,
  })

  const { data: trendingEvents, refetch: refetchEvents } = useQuery({
    queryKey: ['events', 'trending'],
    queryFn: () => eventService.getTrending(12),
    staleTime: 1000 * 60 * 5,
  })

  const { data: signatureEvents } = useQuery({
    queryKey: ['events', 'signature'],
    queryFn: eventService.getSignatureEvents,
    staleTime: 1000 * 60 * 10,
    select: (data) => eventService.sortByUpcomingSeason(data).slice(0, 8),
  })

  const { data: guides } = useQuery({
    queryKey: ['guides', 'featured'],
    queryFn: () => guideService.getFeatured(6),
    staleTime: 1000 * 60 * 10,
  })

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
    },
  })

  const headerBgStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [80, 160], [0, 1], Extrapolate.CLAMP),
  }))

  const heroParallax = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value, [0, HERO_HEIGHT], [0, HERO_HEIGHT * 0.4],
          Extrapolate.CLAMP
        ),
      },
    ],
  }))

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([refetchBiz(), refetchEvents()])
    setRefreshing(false)
  }, [refetchBiz, refetchEvents])

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Sticky blurred header */}
      <Animated.View style={[styles.header, headerBgStyle]} pointerEvents="none">
        {Platform.OS === 'ios' ? (
          <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.tabBarBg }]} />
        )}
      </Animated.View>

      <AnimatedScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            progressBackgroundColor={colors.card}
          />
        }
      >
        {/* ── HERO ──────────────────────────────────── */}
        <View style={styles.heroContainer}>
          <Animated.View style={[styles.heroImage, heroParallax]}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800' }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
          </Animated.View>
          <LinearGradient
            colors={gradients.heroOverlayFull}
            style={styles.heroGradient}
          />
          {/* Watermark */}
          <Text style={styles.watermark}>SAVORBLK</Text>

          <SafeAreaView edges={['top']} style={styles.heroContent}>
            <View style={styles.logoRow}>
              <Text style={styles.logoText}>SavorBLK</Text>
              <TouchableOpacity style={styles.notifBtn}>
                <Ionicons name="notifications-outline" size={22} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <View style={styles.heroCopy}>
              <Text style={styles.heroHeadline}>
                Discover Black-Owned Restaurants
              </Text>
              <Text style={styles.heroSub}>
                The premier guide to Black-owned dining and hospitality across America.
              </Text>
              <View style={styles.heroButtons}>
                <GoldButton
                  label="Explore Cities"
                  onPress={() => navigation.navigate('ExploreTab')}
                  size="md"
                  style={styles.heroCta}
                />
                <GoldButton
                  label="List Your Business"
                  onPress={() => navigation.navigate('HomeTab', { screen: 'City' })}
                  variant="outline"
                  size="md"
                  style={styles.heroCtaOutline}
                />
              </View>
            </View>
          </SafeAreaView>
        </View>

        {/* ── VIBE PILLS ─────────────────────────────── */}
        <View style={styles.section}>
          <VibePills
            onSelect={(vibe) =>
              navigation.navigate('ExploreTab', {
                screen: 'Explore',
                params: { vibe: vibe ?? undefined },
              })
            }
          />
        </View>

        {/* ── SIGNATURE EVENTS ──────────────────────── */}
        {signatureEvents && signatureEvents.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Signature Events"
              icon="calendar-heart-outline"
              onSeeAll={() => navigation.navigate('EventsTab', { screen: 'SignatureEvents' })}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
              {signatureEvents.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.signatureCard}
                  onPress={() =>
                    navigation.navigate('EventsTab', {
                      screen: 'AnnualEventDetail',
                      params: { id: event.id },
                    })
                  }
                  activeOpacity={0.85}
                >
                  <Image
                    source={{ uri: event.cover_image_url ?? '' }}
                    style={styles.signatureImage}
                    contentFit="cover"
                  />
                  <LinearGradient colors={gradients.cardBottom} style={styles.signatureGrad} />
                  {event.city && (
                    <Badge label={event.city} variant="primary" style={styles.signatureCityBadge} />
                  )}
                  <View style={styles.signatureInfo}>
                    <Text style={styles.signatureName} numberOfLines={2}>{event.name}</Text>
                    {event.typical_season && (
                      <Text style={styles.signatureSeason}>{event.typical_season}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── FEATURED CITIES ──────────────────────── */}
        <View style={styles.section}>
          <SectionHeader title="Featured Cities" icon="location-outline" />
          <View style={styles.citiesGrid}>
            {FEATURED_CITIES.map((city) => (
              <TouchableOpacity
                key={city.slug}
                style={styles.cityCard}
                onPress={() =>
                  navigation.navigate('HomeTab', {
                    screen: 'City',
                    params: { slug: city.slug },
                  })
                }
                activeOpacity={0.8}
              >
                <Text style={styles.cityEmoji}>{city.emoji}</Text>
                <Text style={styles.cityName}>{city.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── NEW & NOTABLE ─────────────────────────── */}
        <View style={styles.section}>
          <SectionHeader
            title="New & Notable"
            icon="sparkles-outline"
            onSeeAll={() => navigation.navigate('ExploreTab')}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {newAndNotable
              ? newAndNotable.map((biz) => (
                  <BusinessCard
                    key={biz.id}
                    business={biz}
                    style={styles.horizontalCard}
                    onPress={() =>
                      navigation.navigate('ExploreTab', {
                        screen: 'BusinessDetail',
                        params: { id: biz.id },
                      })
                    }
                  />
                ))
              : Array.from({ length: 4 }).map((_, i) => (
                  <BusinessCardSkeleton key={i} style={styles.horizontalCard} />
                ))}
          </ScrollView>
        </View>

        {/* ── TRENDING EVENTS ────────────────────────── */}
        {trendingEvents && trendingEvents.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Trending Events"
              icon="flame-outline"
              onSeeAll={() => navigation.navigate('EventsTab')}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
              {trendingEvents.map((event: any) => (
                <TouchableOpacity key={event.id} style={styles.flyerCard} activeOpacity={0.85}>
                  <Image
                    source={{ uri: event.flyer_url ?? '' }}
                    style={styles.flyerImage}
                    contentFit="cover"
                  />
                  <LinearGradient colors={gradients.cardBottom} style={styles.flyerGrad} />
                  {event.promoted && (
                    <Badge label="Promoted" variant="primary" style={styles.promotedBadge} />
                  )}
                  <View style={styles.flyerInfo}>
                    <Text style={styles.flyerTitle} numberOfLines={2}>{event.title}</Text>
                    <Text style={styles.flyerBiz} numberOfLines={1}>
                      {event.businesses?.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── GUIDES & STORIES ──────────────────────── */}
        {guides && guides.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Guides & Stories"
              icon="book-outline"
              onSeeAll={() => navigation.navigate('HomeTab', { screen: 'Articles' })}
            />
            <View style={styles.guidesGrid}>
              {guides.slice(0, 3).map((guide) => (
                <TouchableOpacity
                  key={guide.id}
                  style={styles.guideCard}
                  onPress={() =>
                    navigation.navigate('HomeTab', {
                      screen: 'GuideDetail',
                      params: { id: guide.id },
                    })
                  }
                  activeOpacity={0.85}
                >
                  <Image
                    source={{ uri: guide.cover_image_url ?? '' }}
                    style={styles.guideImage}
                    contentFit="cover"
                  />
                  <LinearGradient colors={gradients.cardBottom} style={styles.guideGrad} />
                  {guide.category && (
                    <Badge
                      label={guide.category}
                      variant="primary"
                      style={styles.guideBadge}
                    />
                  )}
                  <View style={styles.guideInfo}>
                    <Text style={styles.guideTitle} numberOfLines={2}>{guide.title}</Text>
                    <Text style={styles.guideDesc} numberOfLines={2}>{guide.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── VIBE ROUTES CTA ────────────────────────── */}
        <TouchableOpacity
          style={styles.vibeRoutesCta}
          onPress={() =>
            navigation.navigate('ProfileTab', { screen: 'PlaylistBuilder' })
          }
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['rgba(201,153,10,0.15)', 'rgba(201,153,10,0.05)']}
            style={styles.vibeRoutesGrad}
          >
            <Text style={styles.vibeRoutesTitle}>Build Your Vibe Route</Text>
            <Text style={styles.vibeRoutesSub}>
              AI-powered itineraries crafted just for you
            </Text>
            <View style={styles.vibeRoutesBtn}>
              <Text style={styles.vibeRoutesBtnText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.primary} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Bottom spacing for tab bar */}
        <View style={{ height: layout.tabBarHeight + 20 }} />
      </AnimatedScrollView>
    </View>
  )
}

function SectionHeader({
  title,
  icon,
  onSeeAll,
}: {
  title: string
  icon: string
  onSeeAll?: () => void
}) {
  return (
    <View style={sectionHeaderStyles.container}>
      <View style={sectionHeaderStyles.left}>
        <Ionicons name={icon as any} size={18} color={colors.primary} />
        <Text style={sectionHeaderStyles.title}>{title}</Text>
      </View>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={sectionHeaderStyles.seeAll}>See all</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const sectionHeaderStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingH,
    marginBottom: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  title: {
    ...typography.h3,
    color: colors.foreground,
  },
  seeAll: {
    ...typography.labelMD,
    color: colors.primary,
  },
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {},
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT + 44,
    zIndex: 100,
  },

  // Hero
  heroContainer: {
    height: HERO_HEIGHT,
    overflow: 'hidden',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    height: HERO_HEIGHT * 1.3,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  watermark: {
    position: 'absolute',
    bottom: '30%',
    right: -10,
    fontSize: 80,
    fontFamily: 'PlayfairDisplay-Bold',
    color: 'rgba(255,255,255,0.04)',
    letterSpacing: 8,
  },
  heroContent: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingH,
  },
  logoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  logoText: {
    ...typography.h2,
    color: colors.primary,
    letterSpacing: 1,
  },
  notifBtn: {
    padding: 6,
  },
  heroCopy: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 28,
  },
  heroHeadline: {
    ...typography.displayLG,
    color: colors.foreground,
    marginBottom: 10,
  },
  heroSub: {
    ...typography.bodyMD,
    color: 'rgba(242,242,242,0.75)',
    marginBottom: 20,
    lineHeight: 22,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  heroCta: {},
  heroCtaOutline: {},

  // Sections
  section: {
    marginTop: layout.sectionGap,
  },
  hScroll: {
    paddingHorizontal: layout.screenPaddingH,
    gap: 10,
  },

  // Signature events
  signatureCard: {
    width: 200,
    height: 130,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  signatureImage: {
    ...StyleSheet.absoluteFillObject,
  },
  signatureGrad: {
    ...StyleSheet.absoluteFillObject,
    top: '30%',
  },
  signatureCityBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  signatureInfo: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
  },
  signatureName: {
    ...typography.labelLG,
    color: colors.foreground,
  },
  signatureSeason: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 2,
  },

  // Cities grid
  citiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: layout.screenPaddingH,
    gap: 8,
  },
  cityCard: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  cityEmoji: {
    fontSize: 24,
  },
  cityName: {
    ...typography.caption,
    color: colors.muted,
    textAlign: 'center',
  },

  // Horizontal business card
  horizontalCard: {
    width: 170,
  },

  // Flyer events
  flyerCard: {
    width: 140,
    height: 200,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  flyerImage: {
    ...StyleSheet.absoluteFillObject,
  },
  flyerGrad: {
    ...StyleSheet.absoluteFillObject,
    top: '40%',
  },
  promotedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  flyerInfo: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
  },
  flyerTitle: {
    ...typography.labelMD,
    color: colors.foreground,
  },
  flyerBiz: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 2,
  },

  // Guides
  guidesGrid: {
    paddingHorizontal: layout.screenPaddingH,
    gap: 12,
  },
  guideCard: {
    height: 180,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  guideImage: {
    ...StyleSheet.absoluteFillObject,
  },
  guideGrad: {
    ...StyleSheet.absoluteFillObject,
    top: '20%',
  },
  guideBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  guideInfo: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  guideTitle: {
    ...typography.h4,
    color: colors.foreground,
  },
  guideDesc: {
    ...typography.bodySM,
    color: 'rgba(242,242,242,0.7)',
    marginTop: 4,
  },

  // Vibe routes CTA
  vibeRoutesCta: {
    marginHorizontal: layout.screenPaddingH,
    marginTop: layout.sectionGap,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primaryDim,
  },
  vibeRoutesGrad: {
    padding: 24,
  },
  vibeRoutesTitle: {
    ...typography.h2,
    color: colors.foreground,
  },
  vibeRoutesSub: {
    ...typography.bodyMD,
    color: colors.muted,
    marginTop: 6,
    marginBottom: 18,
  },
  vibeRoutesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  vibeRoutesBtnText: {
    ...typography.buttonMD,
    color: colors.primary,
  },
})
