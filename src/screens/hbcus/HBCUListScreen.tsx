import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar,
} from 'react-native'
import { Image } from 'expo-image'
import { FlashList } from '@shopify/flash-list'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'

import { hbcuService } from '../../services/hbcuService'
import { SearchBar } from '../../components/search/SearchBar'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { radius, layout } from '../../theme/spacing'
import type { HBCU } from '../../types/database.types'

const US_STATES = [
  'AL','AR','DC','FL','GA','KY','LA','MD','MI','MS','NC','OH','PA','SC','TN','TX','VA',
]

export function HBCUListScreen() {
  const navigation = useNavigation<any>()
  const [search, setSearch] = useState('')
  const [stateFilter, setStateFilter] = useState<string | null>(null)

  const { data: hbcus = [], isLoading } = useQuery({
    queryKey: ['hbcus'],
    queryFn: hbcuService.getAll,
    staleTime: 1000 * 60 * 30,
  })

  const filtered = hbcus.filter((h) => {
    const matchSearch = !search || h.name.toLowerCase().includes(search.toLowerCase())
    const matchState = !stateFilter || h.state === stateFilter
    return matchSearch && matchState
  })

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="school-outline" size={22} color={colors.primary} />
            <Text style={styles.title}>HBCU Eats</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{hbcus.length} Campuses</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>Discover Black-owned spots near every campus</Text>

        <SearchBar
          placeholder="Search schools..."
          onChangeText={setSearch}
          style={styles.search}
        />

        {/* State filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statePills}
        >
          <TouchableOpacity
            style={[styles.statePill, !stateFilter && styles.statePillActive]}
            onPress={() => setStateFilter(null)}
          >
            <Text style={[styles.stateText, !stateFilter && styles.stateTextActive]}>All</Text>
          </TouchableOpacity>
          {US_STATES.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.statePill, stateFilter === s && styles.statePillActive]}
              onPress={() => setStateFilter(stateFilter === s ? null : s)}
            >
              <Text style={[styles.stateText, stateFilter === s && styles.stateTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>

      <FlashList
        data={filtered}
        estimatedItemSize={250}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <HBCUCard hbcu={item} onPress={() => navigation.navigate('HBCUDetail', { slug: item.slug })} />
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  )
}

function HBCUCard({ hbcu, onPress }: { hbcu: HBCU; onPress: () => void }) {
  const [primary, secondary] = hbcuService.getSchoolColors(hbcu)

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      {/* School colors top bar */}
      <View style={styles.colorsBar}>
        <View style={[styles.colorStripe, { backgroundColor: primary }]} />
        <View style={[styles.colorStripe, { backgroundColor: secondary }]} />
      </View>

      {/* Campus photo */}
      <View style={styles.photoWrapper}>
        <Image
          source={{ uri: hbcu.campus_photo_url ?? '' }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
        />

        {/* Logo overlay */}
        {hbcu.logo_url && (
          <View style={styles.logoWrapper}>
            <Image
              source={{ uri: hbcu.logo_url }}
              style={styles.logo}
              contentFit="contain"
            />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        <Text style={styles.schoolName}>{hbcu.name}</Text>
        {hbcu.mascot && (
          <Text style={[styles.mascot, { color: primary }]}>{hbcu.mascot}</Text>
        )}
        <Text style={styles.location}>
          {[hbcu.city, hbcu.state].filter(Boolean).join(', ')}
          {hbcu.founding_year ? ` · Est. ${hbcu.founding_year}` : ''}
        </Text>
        {hbcu.campus_vibe && (
          <Text style={styles.vibe} numberOfLines={2}>{hbcu.campus_vibe}</Text>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: layout.screenPaddingH, paddingTop: 8, paddingBottom: 4,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { ...typography.h1, color: colors.foreground },
  badge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.primary,
    backgroundColor: 'rgba(201,153,10,0.1)',
  },
  badgeText: { ...typography.labelSM, color: colors.primary },
  subtitle: {
    ...typography.bodyMD, color: colors.muted,
    paddingHorizontal: layout.screenPaddingH, marginBottom: 12,
  },
  search: { marginHorizontal: layout.screenPaddingH, marginBottom: 10 },
  statePills: { paddingHorizontal: layout.screenPaddingH, gap: 6, marginBottom: 10 },
  statePill: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: radius.full, backgroundColor: colors.secondary,
    borderWidth: 1, borderColor: colors.border,
  },
  statePillActive: { borderColor: colors.primary, backgroundColor: 'rgba(201,153,10,0.15)' },
  stateText: { ...typography.labelSM, color: colors.muted },
  stateTextActive: { color: colors.primary },
  list: { padding: layout.screenPaddingH, paddingBottom: layout.tabBarHeight + 16, gap: 14 },

  // Card
  card: {
    backgroundColor: colors.card, borderRadius: radius.xl,
    overflow: 'hidden', borderWidth: 1, borderColor: colors.border,
  },
  colorsBar: { flexDirection: 'row', height: 5 },
  colorStripe: { flex: 1 },
  photoWrapper: { height: 180, position: 'relative', backgroundColor: colors.secondary },
  logoWrapper: {
    position: 'absolute', top: 12, right: 12,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: colors.card, padding: 4,
    borderWidth: 1.5, borderColor: colors.border,
    overflow: 'hidden',
  },
  logo: { width: '100%', height: '100%' },
  cardInfo: { padding: 14, gap: 4 },
  schoolName: { ...typography.h3, color: colors.foreground },
  mascot: { ...typography.labelMD, fontWeight: '600' },
  location: { ...typography.bodyMD, color: colors.muted },
  vibe: { ...typography.bodySM, color: colors.muted, marginTop: 4, lineHeight: 18 },
})
