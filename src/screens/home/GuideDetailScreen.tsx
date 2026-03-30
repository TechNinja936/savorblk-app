import React from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  Share, Dimensions,
} from 'react-native'
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
import { guideService } from '../../services/guideService'
import { businessService } from '../../services/businessService'
import { BusinessCard } from '../../components/business/BusinessCard'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { SkeletonLoader } from '../../components/ui/SkeletonLoader'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { layout, spacing, radius } from '../../theme/spacing'

const { width: SCREEN_W } = Dimensions.get('window')
const HERO_H = 320

export function GuideDetailScreen() {
  const navigation = useNavigation<any>()
  const { guideId } = useRoute<any>().params
  const scrollY = useSharedValue(0)

  const scrollHandler = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y
  })

  const heroParallax = useAnimatedStyle(() => ({
    transform: [{
      translateY: interpolate(scrollY.value, [0, HERO_H], [0, HERO_H * 0.5], Extrapolation.CLAMP),
    }],
    opacity: interpolate(scrollY.value, [0, HERO_H], [1, 0.6], Extrapolation.CLAMP),
  }))

  const headerOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [HERO_H - 80, HERO_H - 20], [0, 1], Extrapolation.CLAMP),
  }))

  const { data: guide, isLoading } = useQuery({
    queryKey: ['guide', guideId],
    queryFn: () => guideService.getById(guideId),
  })

  const { data: spots = [] } = useQuery({
    queryKey: ['guide-spots', guideId],
    queryFn: async () => {
      if (!guide?.business_ids?.length) return []
      // Fetch businesses in this guide
      const results = await Promise.all(
        guide.business_ids.map((id: string) => businessService.getById(id))
      )
      return results.filter(Boolean)
    },
    enabled: !!guide?.business_ids,
  })

  const handleShare = () => {
    if (!guide) return
    Share.share({
      title: guide.title,
      message: `Check out this guide on SavorBLK: ${guide.title}\nhttps://savorblk.com/guides/${guideId}`,
    })
  }

  if (isLoading || !guide) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={['top']} style={styles.navBar}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </SafeAreaView>
        <View style={{ padding: layout.screenPaddingH, gap: 16 }}>
          <SkeletonLoader.BusinessCard />
          <SkeletonLoader.BusinessCard />
        </View>
      </View>
    )
  }

  const spotCount = spots.length || guide.business_ids?.length || 0

  return (
    <View style={styles.container}>
      {/* Sticky header background */}
      <Animated.View style={[styles.stickyHeaderBg, headerOpacity]} />

      <SafeAreaView edges={['top']} style={styles.navBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Animated.Text style={[styles.navTitle, headerOpacity]} numberOfLines={1}>
          {guide.title}
        </Animated.Text>
        <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
          <Ionicons name="share-outline" size={22} color={colors.foreground} />
        </TouchableOpacity>
      </SafeAreaView>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View style={styles.heroWrap}>
          <Animated.View style={[styles.heroImage, heroParallax]}>
            <Image
              source={{ uri: guide.cover_image_url }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(10,10,10,0.6)', colors.background]}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          {/* Hero overlay content */}
          <View style={styles.heroContent}>
            <View style={styles.tagsRow}>
              {guide.city && <Badge label={guide.city} variant="outline" icon="location-outline" />}
              {guide.featured && <Badge label="Featured" variant="primary" icon="star-outline" />}
              {guide.hbcu_id && <Badge label="HBCU Guide" variant="hbcu" />}
            </View>
          </View>
        </View>

        {/* Guide Info */}
        <View style={styles.infoSection}>
          <Text style={styles.title}>{guide.title}</Text>

          {/* Author Row */}
          {guide.author_name && (
            <TouchableOpacity
              style={styles.authorRow}
              onPress={() => guide.author_username && navigation.navigate('UserPublicProfile', { username: guide.author_username })}
            >
              <Avatar uri={guide.author_avatar} name={guide.author_name} size={36} />
              <View>
                <Text style={styles.authorName}>{guide.author_name}</Text>
                {guide.author_username && (
                  <Text style={styles.authorHandle}>@{guide.author_username}</Text>
                )}
              </View>
            </TouchableOpacity>
          )}

          {/* Meta chips */}
          <View style={styles.metaRow}>
            <MetaChip icon="location-outline" label={guide.city || 'Multiple Cities'} />
            <MetaChip icon="storefront-outline" label={`${spotCount} spot${spotCount !== 1 ? 's' : ''}`} />
            {guide.estimated_duration && (
              <MetaChip icon="time-outline" label={guide.estimated_duration} />
            )}
          </View>

          {guide.description && (
            <Text style={styles.description}>{guide.description}</Text>
          )}
        </View>

        {/* Spots List */}
        {spots.length > 0 && (
          <View style={styles.spotsSection}>
            <Text style={styles.sectionTitle}>Spots in this Guide</Text>
            {spots.map((spot: any, index: number) => (
              <View key={spot.id} style={styles.spotRow}>
                <View style={styles.spotNumber}>
                  <Text style={styles.spotNumberText}>{index + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <BusinessCard
                    business={spot}
                    onPress={() => navigation.navigate('BusinessDetail', { businessId: spot.id })}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Empty guide spots */}
        {spots.length === 0 && spotCount > 0 && (
          <View style={styles.spotsSection}>
            <Text style={styles.sectionTitle}>{spotCount} Spots</Text>
            <View style={styles.emptySpots}>
              <Ionicons name="restaurant-outline" size={32} color={colors.muted} />
              <Text style={styles.emptySpotsText}>Spots are being curated</Text>
            </View>
          </View>
        )}

        <View style={{ height: spacing[12] }} />
      </Animated.ScrollView>
    </View>
  )
}

function MetaChip({ icon, label }: { icon: any; label: string }) {
  return (
    <View style={styles.metaChip}>
      <Ionicons name={icon} size={13} color={colors.muted} />
      <Text style={styles.metaText}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  stickyHeaderBg: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 100, backgroundColor: colors.background, zIndex: 10,
  },
  navBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingH,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center',
  },
  navTitle: { ...typography.labelLG, color: colors.foreground, flex: 1, textAlign: 'center', marginHorizontal: 8 },
  heroWrap: { height: HERO_H, overflow: 'hidden' },
  heroImage: { ...StyleSheet.absoluteFillObject, height: HERO_H * 1.3 },
  heroContent: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: layout.screenPaddingH,
  },
  tagsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  infoSection: { padding: layout.screenPaddingH, gap: 16 },
  title: { ...typography.displayMD, color: colors.foreground },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  authorName: { ...typography.labelMD, color: colors.foreground },
  authorHandle: { ...typography.caption, color: colors.muted },
  metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.secondary, paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.border,
  },
  metaText: { ...typography.caption, color: colors.muted },
  description: { ...typography.bodyMD, color: colors.foreground, lineHeight: 24 },
  spotsSection: { padding: layout.screenPaddingH, gap: 16 },
  sectionTitle: { ...typography.h3, color: colors.foreground },
  spotRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  spotNumber: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    marginTop: 12,
  },
  spotNumberText: { ...typography.labelSM, color: '#000', fontWeight: '700' },
  emptySpots: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptySpotsText: { ...typography.bodyMD, color: colors.muted },
})
