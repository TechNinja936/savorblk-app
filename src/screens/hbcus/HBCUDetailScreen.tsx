import React, { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Linking,
} from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'

import { hbcuService } from '../../services/hbcuService'
import { guideService } from '../../services/guideService'
import { BusinessCard } from '../../components/business/BusinessCard'
import { Skeleton } from '../../components/ui/SkeletonLoader'
import { colors, gradients } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { radius, layout } from '../../theme/spacing'

const CATEGORY_ORDER = ['popular', 'game-day', 'late-night', 'study-spots', 'brunch', 'date-night']

export function HBCUDetailScreen() {
  const navigation = useNavigation<any>()
  const { slug } = useRoute<any>().params
  const [activeCategory, setActiveCategory] = useState('popular')

  const { data: hbcu, isLoading } = useQuery({
    queryKey: ['hbcu', slug],
    queryFn: () => hbcuService.getBySlug(slug),
  })

  const { data: foodSpots = [] } = useQuery({
    queryKey: ['hbcu-food', hbcu?.id],
    queryFn: () => hbcuService.getFoodSpots(hbcu!.id),
    enabled: !!hbcu,
  })

  const grouped = hbcuService.groupFoodSpotsByCategory(foodSpots)
  const availableCategories = CATEGORY_ORDER.filter((c) => grouped[c]?.businesses.length > 0)

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Skeleton height={260} borderRadius={0} />
        <View style={{ padding: layout.screenPaddingH, gap: 12 }}>
          <Skeleton width="70%" height={28} />
          <Skeleton height={14} />
        </View>
      </View>
    )
  }

  if (!hbcu) return null

  const [primary, secondary] = hbcuService.getSchoolColors(hbcu)

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent />
      <SafeAreaView edges={['top']} style={styles.backOverlay} pointerEvents="box-none">
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          {/* School colors bar */}
          <View style={styles.colorsBar}>
            <View style={[styles.colorStripe, { backgroundColor: primary }]} />
            <View style={[styles.colorStripe, { backgroundColor: secondary }]} />
          </View>

          <Image
            source={{ uri: hbcu.campus_photo_url ?? '' }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
          <LinearGradient colors={gradients.heroOverlayFull} style={StyleSheet.absoluteFill} />

          {/* Logo */}
          {hbcu.logo_url && (
            <View style={styles.logoWrapper}>
              <Image source={{ uri: hbcu.logo_url }} style={styles.logo} contentFit="contain" />
            </View>
          )}

          <View style={styles.heroInfo}>
            {hbcu.mascot && (
              <View style={[styles.mascotBadge, { borderColor: primary }]}>
                <Text style={[styles.mascotText, { color: primary }]}>{hbcu.mascot}</Text>
              </View>
            )}
            <Text style={styles.schoolName}>{hbcu.name}</Text>
            <Text style={styles.schoolMeta}>
              {[hbcu.city, hbcu.state].filter(Boolean).join(', ')}
              {hbcu.founding_year ? ` · Est. ${hbcu.founding_year}` : ''}
            </Text>
            {hbcu.website_url && (
              <TouchableOpacity onPress={() => Linking.openURL(hbcu.website_url!)}>
                <Text style={styles.websiteLink}>Visit Website ↗</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Stats */}
        {(hbcu.enrollment || hbcu.campus_address) && (
          <View style={styles.statsSection}>
            {hbcu.enrollment && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{hbcu.enrollment.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Enrollment</Text>
              </View>
            )}
            {hbcu.founding_year && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{hbcu.founding_year}</Text>
                <Text style={styles.statLabel}>Founded</Text>
              </View>
            )}
          </View>
        )}

        {/* Description */}
        {hbcu.description && (
          <View style={styles.section}>
            <Text style={styles.description}>{hbcu.description}</Text>
          </View>
        )}

        {/* Food spots */}
        {availableCategories.length > 0 && (
          <View>
            {/* Category tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryTabs}
            >
              {availableCategories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catTab, activeCategory === cat && styles.catTabActive]}
                  onPress={() => setActiveCategory(cat)}
                >
                  <Text style={[styles.catTabText, activeCategory === cat && styles.catTabTextActive]}>
                    {grouped[cat]?.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Businesses for active category */}
            {grouped[activeCategory] && (
              <View style={styles.bizGrid}>
                {grouped[activeCategory].businesses.map((biz: any) => (
                  <BusinessCard
                    key={biz.id}
                    business={biz}
                    style={styles.bizCard}
                    onPress={() => navigation.navigate('ExploreTab', {
                      screen: 'BusinessDetail',
                      params: { id: biz.id },
                    })}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        <View style={{ height: layout.tabBarHeight + 20 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  backOverlay: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
  backBtn: {
    margin: 16, width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center',
  },

  // Hero
  hero: { height: 280, overflow: 'hidden', backgroundColor: colors.secondary },
  colorsBar: { flexDirection: 'row', height: 6, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  colorStripe: { flex: 1 },
  logoWrapper: {
    position: 'absolute', top: 60, right: 16,
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.card, padding: 6,
    borderWidth: 2, borderColor: colors.border, overflow: 'hidden', zIndex: 5,
  },
  logo: { width: '100%', height: '100%' },
  heroInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: layout.screenPaddingH, gap: 6 },
  mascotBadge: {
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.full, borderWidth: 1.5,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  mascotText: { ...typography.labelSM, fontWeight: '700' },
  schoolName: { ...typography.displayMD, color: colors.foreground },
  schoolMeta: { ...typography.bodyMD, color: 'rgba(242,242,242,0.75)' },
  websiteLink: { ...typography.labelSM, color: colors.primary },

  // Stats
  statsSection: {
    flexDirection: 'row', paddingHorizontal: layout.screenPaddingH,
    paddingVertical: 16, gap: 24, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  statItem: { alignItems: 'center', gap: 3 },
  statValue: { ...typography.h3, color: colors.foreground },
  statLabel: { ...typography.caption, color: colors.muted },

  section: { padding: layout.screenPaddingH },
  description: { ...typography.bodyMD, color: colors.muted, lineHeight: 24 },

  // Category tabs
  categoryTabs: { paddingHorizontal: layout.screenPaddingH, gap: 8, paddingVertical: 16 },
  catTab: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.full,
    backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border,
  },
  catTabActive: { backgroundColor: 'rgba(201,153,10,0.15)', borderColor: colors.primary },
  catTabText: { ...typography.labelMD, color: colors.muted },
  catTabTextActive: { color: colors.primary },

  bizGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: layout.screenPaddingH - 4, gap: 0,
  },
  bizCard: { width: '50%', padding: 4 },
})
