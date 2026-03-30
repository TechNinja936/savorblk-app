import React, { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, ScrollView, Dimensions, StatusBar,
} from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { FlashList } from '@shopify/flash-list'
import { useQuery } from '@tanstack/react-query'
import Animated, { FadeIn } from 'react-native-reanimated'
import { format } from 'date-fns'

import { eventService } from '../../services/eventService'
import { SearchBar } from '../../components/search/SearchBar'
import { Badge } from '../../components/ui/Badge'
import { colors, gradients } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { radius, layout } from '../../theme/spacing'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const CARD_WIDTH = (SCREEN_WIDTH - layout.screenPaddingH * 2 - 8) / 2

export function EventsScreen() {
  const navigation = useNavigation<any>()
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState<string | null>(null)
  const [lightboxEvent, setLightboxEvent] = useState<any | null>(null)

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events', 'all'],
    queryFn: () => eventService.getTrending(60),
    staleTime: 1000 * 60 * 5,
  })

  const cities = [...new Set(events.map((e: any) => e.businesses?.city).filter(Boolean))]

  const filtered = events.filter((e: any) => {
    const matchSearch = !search || e.title?.toLowerCase().includes(search.toLowerCase())
    const matchCity = !cityFilter || e.businesses?.city === cityFilter
    return matchSearch && matchCity
  })

  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={FadeIn.delay(index * 30).duration(300)}>
      <TouchableOpacity
        style={styles.flyerCard}
        onPress={() => setLightboxEvent(item)}
        activeOpacity={0.88}
      >
        <Image
          source={{ uri: item.flyer_url ?? '' }}
          style={styles.flyerImage}
          contentFit="cover"
          transition={200}
        />
        <LinearGradient colors={gradients.cardBottom} style={styles.flyerGradient} />
        {item.promoted && (
          <Badge label="Promoted" variant="primary" style={styles.promotedBadge} />
        )}
        <View style={styles.flyerInfo}>
          <Text style={styles.flyerTitle} numberOfLines={2}>{item.title}</Text>
          {item.businesses?.name && (
            <Text style={styles.flyerBiz} numberOfLines={1}>{item.businesses.name}</Text>
          )}
          {item.event_date && (
            <Text style={styles.flyerDate}>
              {format(new Date(item.event_date), 'MMM d')}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  ), [])

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.superTitle}>What's Happening</Text>
            <Text style={styles.title}>Events & Experiences</Text>
          </View>
          <TouchableOpacity
            style={styles.signatureBtn}
            onPress={() => navigation.navigate('SignatureEvents')}
          >
            <Ionicons name="calendar-heart-outline" size={16} color={colors.primary} />
            <Text style={styles.signatureBtnText}>Signature</Text>
          </TouchableOpacity>
        </View>

        <SearchBar
          placeholder="Search events..."
          onChangeText={setSearch}
          style={styles.search}
        />

        {/* City filter */}
        {cities.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cityPills}
          >
            <TouchableOpacity
              style={[styles.cityPill, !cityFilter && styles.cityPillActive]}
              onPress={() => setCityFilter(null)}
            >
              <Text style={[styles.cityPillText, !cityFilter && styles.cityPillTextActive]}>All</Text>
            </TouchableOpacity>
            {cities.map((city) => (
              <TouchableOpacity
                key={city}
                style={[styles.cityPill, cityFilter === city && styles.cityPillActive]}
                onPress={() => setCityFilter(cityFilter === city ? null : city)}
              >
                <Text style={[styles.cityPillText, cityFilter === city && styles.cityPillTextActive]}>
                  {city}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>

      <FlashList
        data={filtered}
        renderItem={renderItem}
        numColumns={2}
        estimatedItemSize={280}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item: any) => item.id}
      />

      {/* Lightbox modal */}
      <Modal visible={!!lightboxEvent} transparent animationType="fade">
        <View style={styles.lightbox}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setLightboxEvent(null)}
          />
          <View style={styles.lightboxCard}>
            {lightboxEvent?.flyer_url && (
              <Image
                source={{ uri: lightboxEvent.flyer_url }}
                style={styles.lightboxImage}
                contentFit="contain"
              />
            )}
            <View style={styles.lightboxInfo}>
              <Text style={styles.lightboxTitle}>{lightboxEvent?.title}</Text>
              {lightboxEvent?.businesses?.name && (
                <Text style={styles.lightboxBiz}>{lightboxEvent.businesses.name}</Text>
              )}
              {lightboxEvent?.event_date && (
                <Text style={styles.lightboxDate}>
                  {format(new Date(lightboxEvent.event_date), 'EEEE, MMMM d, yyyy')}
                </Text>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.lightboxClose}
            onPress={() => setLightboxEvent(null)}
          >
            <Ionicons name="close" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safeArea: { backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: 8,
    paddingBottom: 12,
  },
  superTitle: { ...typography.caption, color: colors.primary, letterSpacing: 1.5, textTransform: 'uppercase' },
  title: { ...typography.h1, color: colors.foreground },
  signatureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  signatureBtnText: { ...typography.labelSM, color: colors.primary },
  search: { marginHorizontal: layout.screenPaddingH, marginBottom: 10 },
  cityPills: { paddingHorizontal: layout.screenPaddingH, gap: 8, marginBottom: 8 },
  cityPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cityPillActive: { backgroundColor: 'rgba(201,153,10,0.15)', borderColor: colors.primary },
  cityPillText: { ...typography.labelSM, color: colors.muted },
  cityPillTextActive: { color: colors.primary },
  grid: { padding: layout.screenPaddingH, paddingBottom: layout.tabBarHeight + 16 },
  flyerCard: {
    flex: 1,
    margin: 4,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.card,
    aspectRatio: 3 / 4,
  },
  flyerImage: { ...StyleSheet.absoluteFillObject },
  flyerGradient: { ...StyleSheet.absoluteFillObject, top: '40%' },
  promotedBadge: { position: 'absolute', top: 8, left: 8 },
  flyerInfo: { position: 'absolute', bottom: 10, left: 10, right: 10 },
  flyerTitle: { ...typography.labelLG, color: colors.foreground },
  flyerBiz: { ...typography.bodySM, color: 'rgba(242,242,242,0.7)', marginTop: 2 },
  flyerDate: { ...typography.caption, color: colors.primary, marginTop: 3 },
  lightbox: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center' },
  lightboxCard: {
    width: SCREEN_WIDTH - 32,
    backgroundColor: colors.card,
    borderRadius: radius['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  lightboxImage: { width: '100%', height: SCREEN_WIDTH - 32, aspectRatio: 3/4 },
  lightboxInfo: { padding: 16, gap: 4 },
  lightboxTitle: { ...typography.h3, color: colors.foreground },
  lightboxBiz: { ...typography.bodyMD, color: colors.muted },
  lightboxDate: { ...typography.labelMD, color: colors.primary },
  lightboxClose: { position: 'absolute', top: 50, right: 20, padding: 8 },
})
