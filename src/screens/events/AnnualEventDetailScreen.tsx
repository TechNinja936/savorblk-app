import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, StatusBar } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { eventService } from '../../services/eventService'
import { BusinessCard } from '../../components/business/BusinessCard'
import { Badge } from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/SkeletonLoader'
import { colors, gradients } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { radius, layout } from '../../theme/spacing'

export function AnnualEventDetailScreen() {
  const navigation = useNavigation<any>()
  const { id } = useRoute<any>().params

  const { data: event, isLoading } = useQuery({
    queryKey: ['annual-event', id],
    queryFn: () => eventService.getSignatureEventById(id),
  })

  const { data: participants = [] } = useQuery({
    queryKey: ['event-participants', id],
    queryFn: () => eventService.getParticipants(id),
  })

  if (isLoading) return <EventDetailSkeleton />

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent />
      {/* Back button */}
      <SafeAreaView edges={['top']} style={styles.backOverlay} pointerEvents="box-none">
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Hero */}
        <View style={styles.hero}>
          <Image
            source={{ uri: event?.cover_image_url ?? '' }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
          <LinearGradient colors={gradients.heroOverlayFull} style={StyleSheet.absoluteFill} />
          <SafeAreaView edges={['top']} style={styles.heroContent}>
            <View style={styles.heroBottom}>
              {event?.city && <Badge label={event.city} variant="primary" />}
              {event?.featured && <Badge label="Featured" variant="primary" icon="star-outline" />}
              <Text style={styles.heroTitle}>{event?.name}</Text>
              {event?.typical_season && (
                <Text style={styles.heroSeason}>{event.typical_season}</Text>
              )}
            </View>
          </SafeAreaView>
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          {event?.description && (
            <Text style={styles.description}>{event.description}</Text>
          )}

          {/* Stats row */}
          <View style={styles.statsRow}>
            {event?.founded_year && (
              <StatChip icon="calendar-outline" label={`Est. ${event.founded_year}`} />
            )}
            {event?.attendance && (
              <StatChip icon="people-outline" label={`${event.attendance.toLocaleString()}+ attend`} />
            )}
            {event?.venue_location && (
              <StatChip icon="location-outline" label={event.venue_location} />
            )}
          </View>

          {/* Highlights */}
          {event?.highlights && event.highlights.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Highlights</Text>
              {event.highlights.map((h, i) => (
                <View key={i} style={styles.highlightRow}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                  <Text style={styles.highlightText}>{h}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Long description */}
          {event?.long_description && (
            <Text style={styles.longDesc}>{event.long_description}</Text>
          )}

          {/* Tags */}
          {event?.tags && event.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {event.tags.map((tag) => (
                <Badge key={tag} label={tag} variant="outline" />
              ))}
            </View>
          )}

          {/* Links */}
          <View style={styles.linksRow}>
            {event?.ticket_url && (
              <TouchableOpacity style={styles.linkBtn} onPress={() => Linking.openURL(event.ticket_url!)}>
                <Ionicons name="ticket-outline" size={16} color={colors.primary} />
                <Text style={styles.linkText}>Get Tickets</Text>
              </TouchableOpacity>
            )}
            {event?.website_url && (
              <TouchableOpacity style={styles.linkBtn} onPress={() => Linking.openURL(event.website_url!)}>
                <Ionicons name="globe-outline" size={16} color={colors.primary} />
                <Text style={styles.linkText}>Website</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Participating businesses */}
        {participants.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { paddingHorizontal: layout.screenPaddingH }]}>
              Participating Businesses
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bizScroll}>
              {participants.map((biz: any) => (
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
            </ScrollView>
          </View>
        )}

        <View style={{ height: layout.tabBarHeight + 20 }} />
      </ScrollView>
    </View>
  )
}

function StatChip({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={chipStyles.container}>
      <Ionicons name={icon as any} size={13} color={colors.primary} />
      <Text style={chipStyles.label}>{label}</Text>
    </View>
  )
}

const chipStyles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: colors.secondary, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border,
  },
  label: { ...typography.labelSM, color: colors.foreground },
})

function EventDetailSkeleton() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Skeleton height={280} borderRadius={0} />
      <View style={{ padding: layout.screenPaddingH, gap: 12 }}>
        <Skeleton width="70%" height={28} />
        <Skeleton height={14} />
        <Skeleton height={14} />
        <Skeleton width="80%" height={14} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  backOverlay: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
  backBtn: {
    margin: 16,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  content: {},
  hero: { height: 280, overflow: 'hidden', backgroundColor: colors.secondary },
  heroContent: { flex: 1, justifyContent: 'flex-end' },
  heroBottom: { padding: layout.screenPaddingH, paddingBottom: 20, gap: 8, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end' },
  heroTitle: { ...typography.displayLG, color: colors.foreground, width: '100%' },
  heroSeason: { ...typography.labelMD, color: colors.muted },
  infoSection: { padding: layout.screenPaddingH, gap: 16 },
  description: { ...typography.bodyMD, color: colors.foreground, lineHeight: 24 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  section: { gap: 12 },
  sectionTitle: { ...typography.h3, color: colors.foreground },
  highlightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  highlightText: { ...typography.bodyMD, color: colors.foreground, flex: 1, lineHeight: 22 },
  longDesc: { ...typography.bodyMD, color: colors.muted, lineHeight: 24 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  linksRow: { flexDirection: 'row', gap: 10 },
  linkBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.primary,
  },
  linkText: { ...typography.buttonMD, color: colors.primary },
  bizScroll: { paddingHorizontal: layout.screenPaddingH, gap: 10 },
  bizCard: { width: 180 },
})
