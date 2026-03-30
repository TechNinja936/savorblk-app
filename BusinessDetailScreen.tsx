import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
  Linking,
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
import { useNavigation, useRoute } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'

import { businessService } from '../../services/businessService'
import { FavoriteButton } from '../../components/business/FavoriteButton'
import { CheckInButton } from '../../components/business/CheckInButton'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { StarRating } from '../../components/ui/StarRating'
import { Skeleton } from '../../components/ui/SkeletonLoader'
import { MenuTab } from './tabs/MenuTab'
import { ReviewsTab } from './tabs/ReviewsTab'
import { EventsTab } from './tabs/EventsTab'
import { PhotosTab } from './tabs/PhotosTab'

import { colors, gradients } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { radius, layout, spacing } from '../../theme/spacing'

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView)
const COVER_HEIGHT = 220
const TABS = ['Menu', 'Reviews', 'Events', 'Photos'] as const
type Tab = typeof TABS[number]

export function BusinessDetailScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const { id } = route.params
  const scrollY = useSharedValue(0)
  const [activeTab, setActiveTab] = useState<Tab>('Menu')

  const { data: business, isLoading } = useQuery({
    queryKey: ['business', id],
    queryFn: () => businessService.getById(id),
    staleTime: 1000 * 60 * 5,
  })

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => { scrollY.value = e.contentOffset.y },
  })

  const headerOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [COVER_HEIGHT - 80, COVER_HEIGHT], [0, 1], Extrapolate.CLAMP),
  }))

  const coverParallax = useAnimatedStyle(() => ({
    transform: [{
      translateY: interpolate(scrollY.value, [0, COVER_HEIGHT], [0, COVER_HEIGHT * 0.35], Extrapolate.CLAMP),
    }],
  }))

  const handleShare = async () => {
    if (!business) return
    await Share.share({
      message: `Check out ${business.name} on SavorBLK! 🍽️ Black-owned excellence.\nsavorblk.com/business/${id}`,
      url: `https://savorblk.com/business/${id}`,
    })
  }

  const handleDirections = () => {
    if (!business?.address) return
    const url = `https://maps.google.com/?q=${encodeURIComponent(business.address)}`
    Linking.openURL(url)
  }

  const handleCall = () => {
    if (!business?.phone) return
    Linking.openURL(`tel:${business.phone}`)
  }

  if (isLoading) return <BusinessDetailSkeleton />

  if (!business) return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Business not found</Text>
    </View>
  )

  const coverImage = business.cover_photo_url ??
    (business.photo_urls?.[0]) ?? null
  const avatarImage = business.photo_urls?.[0] ?? business.cover_photo_url ?? null

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Sticky nav header */}
      <Animated.View style={[styles.stickyHeader, headerOpacity]} pointerEvents="none">
        {Platform.OS === 'ios' ? (
          <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.tabBarBg }]} />
        )}
      </Animated.View>

      {/* Back + actions overlay */}
      <SafeAreaView edges={['top']} style={styles.topOverlay} pointerEvents="box-none">
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.topActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <View style={styles.actionBtn}>
            <FavoriteButton businessId={id} size={20} />
          </View>
        </View>
      </SafeAreaView>

      <AnimatedScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Cover photo */}
        <View style={styles.coverContainer}>
          <Animated.View style={[styles.coverInner, coverParallax]}>
            {coverImage ? (
              <Image source={{ uri: coverImage }} style={StyleSheet.absoluteFill} contentFit="cover" />
            ) : (
              <LinearGradient
                colors={['#1a1a1a', '#0a0a0a']}
                style={StyleSheet.absoluteFill}
              />
            )}
          </Animated.View>
          <LinearGradient colors={gradients.heroOverlay} style={styles.coverGradient} />
        </View>

        {/* Profile section */}
        <View style={styles.profileSection}>
          {/* Avatar */}
          <View style={styles.avatarRow}>
            <View style={styles.avatarWrapper}>
              <Avatar
                uri={avatarImage}
                name={business.name}
                size={80}
                verified={business.verified}
              />
              {business.verified && (
                <View style={styles.verifiedRing} />
              )}
            </View>
          </View>

          {/* Business info */}
          <View style={styles.infoSection}>
            <View style={styles.nameRow}>
              <Text style={styles.businessName}>{business.name}</Text>
              {business.verified && (
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              )}
            </View>

            {/* Meta row */}
            <Text style={styles.metaText}>
              {[business.category, business.price_range, business.neighborhood, business.city]
                .filter(Boolean)
                .join(' · ')}
            </Text>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <StatItem
                icon="heart"
                value={business.follower_count?.toString() ?? '0'}
                label="Fans"
              />
              {business.rating ? (
                <StatItem
                  icon="star"
                  value={Number(business.rating).toFixed(1)}
                  label={`${business.review_count ?? 0} Reviews`}
                />
              ) : null}
              <StatItem
                icon="location"
                value={business.checkInCount?.toString() ?? '0'}
                label="Check-ins"
              />
            </View>

            {/* Badges */}
            <View style={styles.badgeRow}>
              {business.verified && (
                <Badge label="Verified Black-Owned" variant="primary" icon="shield-checkmark-outline" />
              )}
            </View>
          </View>

          {/* Sticky action bar */}
          <View style={styles.actionBar}>
            <CheckInButton businessId={id} style={styles.checkInBtn} />
            {business.phone && (
              <TouchableOpacity style={styles.actionBarBtn} onPress={handleCall}>
                <Ionicons name="call-outline" size={20} color={colors.foreground} />
              </TouchableOpacity>
            )}
            {business.address && (
              <TouchableOpacity style={styles.actionBarBtn} onPress={handleDirections}>
                <Ionicons name="navigate-outline" size={20} color={colors.foreground} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.actionBarBtn} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={20} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Details */}
        <View style={styles.detailsSection}>
          {business.address && (
            <TouchableOpacity style={styles.detailRow} onPress={handleDirections}>
              <Ionicons name="location-outline" size={16} color={colors.primary} />
              <Text style={styles.detailText}>{business.address}</Text>
              <Ionicons name="open-outline" size={14} color={colors.muted} />
            </TouchableOpacity>
          )}
          {business.hours && (
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={16} color={colors.primary} />
              <Text style={styles.detailText}>{business.hours}</Text>
            </View>
          )}
          {business.phone && (
            <TouchableOpacity style={styles.detailRow} onPress={handleCall}>
              <Ionicons name="call-outline" size={16} color={colors.primary} />
              <Text style={styles.detailText}>{business.phone}</Text>
            </TouchableOpacity>
          )}
          {business.description && (
            <Text style={styles.description}>{business.description}</Text>
          )}
        </View>

        {/* External links */}
        <ExternalLinks business={business} />

        {/* Tags */}
        {business.tags && business.tags.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={styles.tagsSectionTitle}>Good For</Text>
            <View style={styles.tagsRow}>
              {business.tags.map((tag) => (
                <Badge key={tag} label={tag} variant="outline" size="md" />
              ))}
            </View>
          </View>
        )}

        {/* Tab bar */}
        <View style={styles.tabBar}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab content */}
        <View style={styles.tabContent}>
          {activeTab === 'Menu'    && <MenuTab businessId={id} />}
          {activeTab === 'Reviews' && <ReviewsTab businessId={id} />}
          {activeTab === 'Events'  && <EventsTab businessId={id} />}
          {activeTab === 'Photos'  && <PhotosTab businessId={id} />}
        </View>

        <View style={{ height: layout.tabBarHeight + 20 }} />
      </AnimatedScrollView>
    </View>
  )
}

function StatItem({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <View style={statStyles.container}>
      <Ionicons name={icon as any} size={14} color={colors.primary} />
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  )
}

const statStyles = StyleSheet.create({
  container: { alignItems: 'center', gap: 2 },
  value: { ...typography.labelLG, color: colors.foreground },
  label: { ...typography.caption, color: colors.muted },
})

function ExternalLinks({ business }: { business: any }) {
  const links = [
    { label: 'Website',   url: business.website_url,   icon: 'globe-outline' },
    { label: 'Menu',      url: business.menu_url,       icon: 'restaurant-outline' },
    { label: 'DoorDash',  url: business.doordash_url,   icon: 'bicycle-outline' },
    { label: 'Uber Eats', url: business.ubereats_url,   icon: 'car-outline' },
    { label: 'OpenTable', url: business.opentable_url,  icon: 'calendar-outline' },
  ].filter((l) => !!l.url)

  if (!links.length) return null

  return (
    <View style={extStyles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={extStyles.scroll}>
        {links.map((link) => (
          <TouchableOpacity
            key={link.label}
            style={extStyles.link}
            onPress={() => Linking.openURL(link.url!)}
          >
            <Ionicons name={link.icon as any} size={16} color={colors.primary} />
            <Text style={extStyles.label}>{link.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

const extStyles = StyleSheet.create({
  container: { paddingTop: 16 },
  scroll: { paddingHorizontal: layout.screenPaddingH, gap: 8 },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { ...typography.labelSM, color: colors.foreground },
})

function BusinessDetailSkeleton() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Skeleton height={COVER_HEIGHT} borderRadius={0} />
      <View style={{ padding: 16, gap: 12 }}>
        <Skeleton width="70%" height={22} />
        <Skeleton width="50%" height={14} />
        <Skeleton width="100%" height={14} />
        <Skeleton width="80%" height={14} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  errorText: { ...typography.bodyMD, color: colors.muted },

  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    zIndex: 100,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 200,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrollContent: {},

  // Cover
  coverContainer: {
    height: COVER_HEIGHT,
    overflow: 'hidden',
    backgroundColor: colors.secondary,
  },
  coverInner: {
    ...StyleSheet.absoluteFillObject,
    height: COVER_HEIGHT * 1.3,
  },
  coverGradient: {
    ...StyleSheet.absoluteFillObject,
    top: '40%',
  },

  // Profile
  profileSection: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: 0,
  },
  avatarRow: {
    marginTop: -44,
    marginBottom: 12,
  },
  avatarWrapper: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  verifiedRing: {
    position: 'absolute',
    inset: -3,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  infoSection: {
    gap: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  businessName: {
    ...typography.h1,
    color: colors.foreground,
    flex: 1,
  },
  metaText: {
    ...typography.bodyMD,
    color: colors.muted,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    paddingVertical: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  // Action bar
  actionBar: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkInBtn: { flex: 1 },
  actionBarBtn: {
    width: 46,
    height: 46,
    borderRadius: radius.lg,
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Details
  detailsSection: {
    paddingHorizontal: layout.screenPaddingH,
    gap: 12,
    paddingTop: 4,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    ...typography.bodyMD,
    color: colors.foreground,
    flex: 1,
  },
  description: {
    ...typography.bodyMD,
    color: colors.muted,
    lineHeight: 22,
    marginTop: 4,
  },

  // Tags
  tagsSection: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: 16,
  },
  tagsSectionTitle: {
    ...typography.labelLG,
    color: colors.muted,
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: colors.primary,
  },
  tabLabel: {
    ...typography.labelMD,
    color: colors.muted,
  },
  tabLabelActive: {
    color: colors.primary,
  },
  tabContent: {
    minHeight: 300,
  },
})
