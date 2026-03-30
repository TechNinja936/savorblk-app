import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Image } from 'expo-image'
import { supabase } from '../../lib/supabase'
import { useUIStore } from '../../stores/uiStore'
import { GoldButton } from '../../components/ui/GoldButton'
import { Badge } from '../../components/ui/Badge'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { layout, spacing, radius } from '../../theme/spacing'
import { formatCount, formatRating } from '../../utils/formatters'

const QUICK_ACTIONS = [
  { key: 'hours', icon: 'time-outline', label: 'Update Hours' },
  { key: 'menu', icon: 'restaurant-outline', label: 'Edit Menu' },
  { key: 'photos', icon: 'images-outline', label: 'Add Photos' },
  { key: 'events', icon: 'calendar-outline', label: 'Create Event' },
  { key: 'featured', icon: 'star-outline', label: 'Get Featured' },
  { key: 'promote', icon: 'trending-up-outline', label: 'Promote' },
]

export function MyBusinessScreen() {
  const navigation = useNavigation<any>()
  const { id: businessId } = useRoute<any>().params
  const { showToast } = useUIStore()
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'events'>('overview')

  const { data: business, isLoading } = useQuery({
    queryKey: ['my-business', businessId],
    queryFn: async () => {
      const { data } = await supabase
        .from('businesses')
        .select('*, business_events(*), reviews(*, user_profiles(full_name, username, avatar_url))')
        .eq('id', businessId)
        .single()
      return data
    },
  })

  const { mutate: toggleActive } = useMutation({
    mutationFn: async () => {
      await supabase
        .from('businesses')
        .update({ is_active: !business?.is_active })
        .eq('id', businessId)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-business', businessId] })
      showToast(business?.is_active ? 'Listing paused' : 'Listing is live!', 'success')
    },
  })

  if (isLoading || !business) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={['top']} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Business</Text>
          <View style={{ width: 24 }} />
        </SafeAreaView>
        <View style={styles.loadingState}>
          <Ionicons name="storefront-outline" size={40} color={colors.muted} />
          <Text style={styles.loadingText}>Loading your business...</Text>
        </View>
      </View>
    )
  }

  const reviewCount = business.reviews?.length || 0
  const avgRating = reviewCount
    ? business.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewCount
    : 0

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{business.name}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('BusinessDetail', { businessId })}>
          <Ionicons name="eye-outline" size={22} color={colors.foreground} />
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Business Banner */}
        <View style={styles.banner}>
          {business.cover_image_url ? (
            <Image source={{ uri: business.cover_image_url }} style={styles.bannerImage} contentFit="cover" />
          ) : (
            <View style={[styles.bannerImage, styles.bannerPlaceholder]}>
              <Ionicons name="storefront-outline" size={40} color={colors.muted} />
            </View>
          )}
          <View style={styles.bannerOverlay}>
            <View style={styles.statusRow}>
              <Badge
                label={business.is_active ? 'Live' : 'Paused'}
                variant={business.is_active ? 'success' : 'muted'}
                icon={business.is_active ? 'radio-button-on' : 'pause-circle-outline'}
              />
              {business.verified && <Badge label="Verified" variant="primary" icon="checkmark-circle-outline" />}
            </View>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard icon="star" value={reviewCount ? formatRating(avgRating) : '—'} label="Rating" color={colors.primary} />
          <StatCard icon="chatbubble-outline" value={formatCount(reviewCount)} label="Reviews" color={colors.foreground} />
          <StatCard icon="heart-outline" value={formatCount(business.favorites_count || 0)} label="Saves" color="#e74c3c" />
          <StatCard icon="checkmark-circle-outline" value={formatCount(business.checkin_count || 0)} label="Check-ins" color={colors.hbcuGreen} />
        </View>

        {/* Active toggle */}
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleTitle}>Listing Status</Text>
              <Text style={styles.toggleSub}>
                {business.is_active ? 'Your business is visible to all users' : 'Your listing is currently hidden'}
              </Text>
            </View>
            <GoldButton
              label={business.is_active ? 'Pause' : 'Go Live'}
              variant={business.is_active ? 'outline' : 'filled'}
              size="sm"
              onPress={() => toggleActive()}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.key}
                style={styles.actionCard}
                onPress={() => showToast('Coming soon!', 'info')}
              >
                <Ionicons name={action.icon as any} size={24} color={colors.primary} />
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.section}>
          <View style={styles.tabRow}>
            {(['overview', 'reviews', 'events'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {activeTab === 'overview' && (
            <View style={styles.overviewSection}>
              <OverviewRow icon="location-outline" label="Address" value={business.address} />
              <OverviewRow icon="call-outline" label="Phone" value={business.phone} />
              <OverviewRow icon="globe-outline" label="Website" value={business.website} />
              <OverviewRow icon="tag-outline" label="Category" value={business.category} />
              <OverviewRow icon="pricetag-outline" label="Price Range" value={'$'.repeat(business.price_range || 2)} />
            </View>
          )}

          {activeTab === 'reviews' && (
            <View>
              {(!business.reviews || business.reviews.length === 0) && (
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>No reviews yet</Text>
                </View>
              )}
              {business.reviews?.slice(0, 10).map((review: any) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>{review.user_profiles?.full_name || 'Anonymous'}</Text>
                    <Text style={styles.reviewRating}>{'★'.repeat(review.rating)}</Text>
                  </View>
                  {review.content && <Text style={styles.reviewContent}>{review.content}</Text>}
                </View>
              ))}
            </View>
          )}

          {activeTab === 'events' && (
            <View>
              {(!business.business_events || business.business_events.length === 0) && (
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>No events yet</Text>
                  <GoldButton
                    label="Create Event"
                    size="sm"
                    onPress={() => showToast('Coming soon!', 'info')}
                    style={{ marginTop: 12 }}
                  />
                </View>
              )}
              {business.business_events?.map((event: any) => (
                <View key={event.id} style={styles.eventRow}>
                  <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                  <View>
                    <Text style={styles.eventName}>{event.name}</Text>
                    <Text style={styles.eventDate}>{event.start_date}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: spacing[12] }} />
      </ScrollView>
    </View>
  )
}

function StatCard({ icon, value, label, color }: { icon: any; value: string; label: string; color: string }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

function OverviewRow({ icon, label, value }: { icon: any; label: string; value?: string | null }) {
  if (!value) return null
  return (
    <View style={styles.overviewRow}>
      <Ionicons name={icon} size={16} color={colors.muted} />
      <Text style={styles.overviewLabel}>{label}:</Text>
      <Text style={styles.overviewValue} numberOfLines={1}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingH, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { ...typography.h3, color: colors.foreground, flex: 1, textAlign: 'center', marginHorizontal: 8 },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { ...typography.bodyMD, color: colors.muted },
  banner: { height: 160, position: 'relative' },
  bannerImage: { width: '100%', height: '100%' },
  bannerPlaceholder: { backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
  bannerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: 12, justifyContent: 'flex-end' },
  statusRow: { flexDirection: 'row', gap: 8 },
  statsRow: {
    flexDirection: 'row', paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing[3], gap: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  statCard: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { ...typography.h3 },
  statLabel: { ...typography.caption, color: colors.muted },
  section: { padding: layout.screenPaddingH, gap: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  sectionTitle: { ...typography.labelLG, color: colors.foreground },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  toggleTitle: { ...typography.labelMD, color: colors.foreground },
  toggleSub: { ...typography.caption, color: colors.muted, marginTop: 2 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: {
    width: '30%', alignItems: 'center', gap: 8,
    backgroundColor: colors.secondary, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, padding: 14,
  },
  actionLabel: { ...typography.caption, color: colors.foreground, textAlign: 'center' },
  tabRow: { flexDirection: 'row', gap: 4, marginBottom: 4 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.secondary },
  activeTab: { backgroundColor: colors.primary },
  tabText: { ...typography.labelSM, color: colors.muted },
  activeTabText: { color: '#000' },
  overviewSection: { gap: 12 },
  overviewRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  overviewLabel: { ...typography.labelSM, color: colors.muted, width: 70 },
  overviewValue: { ...typography.bodyMD, color: colors.foreground, flex: 1 },
  reviewCard: { gap: 4, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  reviewerName: { ...typography.labelMD, color: colors.foreground },
  reviewRating: { color: colors.primary },
  reviewContent: { ...typography.bodyMD, color: colors.muted, lineHeight: 20 },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  eventName: { ...typography.labelMD, color: colors.foreground },
  eventDate: { ...typography.caption, color: colors.muted },
  empty: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyText: { ...typography.bodyMD, color: colors.muted },
})
