import React, { useState, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { FlashList } from '@shopify/flash-list'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { useDebouncedCallback } from 'use-debounce'

import { businessService } from '../../services/businessService'
import { SearchBar } from '../../components/search/SearchBar'
import { VibePills } from '../../components/search/VibePills'
import { BusinessCard } from '../../components/business/BusinessCard'
import { BusinessCardSkeleton } from '../../components/ui/SkeletonLoader'
import { Badge } from '../../components/ui/Badge'

import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { radius, layout } from '../../theme/spacing'

const CATEGORIES = [
  'Restaurant', 'Bar', 'Café', 'Bakery', 'Catering',
  'Food Truck', 'Lounge', 'Hotel', 'Dessert Shop',
  'Coffee Shop', 'Nightclub', 'Cigar Bar',
]

const CITIES = [
  'Houston', 'Atlanta', 'Detroit', 'New Orleans', 'New York City',
  'Chicago', 'Washington D.C.', 'Philadelphia', 'Dallas', 'Memphis',
  'Charlotte', 'Nashville', 'Miami', 'Los Angeles', 'Oakland',
]

export function ExploreScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()

  const [search, setSearch] = useState('')
  const [vibe, setVibe] = useState<string | null>(route.params?.vibe ?? null)
  const [city, setCity] = useState<string | null>(route.params?.city ?? null)
  const [category, setCategory] = useState<string | null>(route.params?.category ?? null)
  const [showFilters, setShowFilters] = useState(false)

  const debouncedSetSearch = useDebouncedCallback(setSearch, 300)

  const { data: businesses, isLoading } = useQuery({
    queryKey: ['businesses', 'explore', { search, city, category }],
    queryFn: () =>
      businessService.getAll({
        search: search || undefined,
        city: city ?? undefined,
        category: category ?? undefined,
        limit: 100,
      }),
    staleTime: 1000 * 60 * 2,
  })

  const filtered = useMemo(() => {
    if (!businesses) return []
    if (!vibe) return businesses
    // Client-side vibe filter (fast, already have data)
    return businesses.filter((b) =>
      b.description?.toLowerCase().includes(vibe) ||
      b.category?.toLowerCase().includes(vibe)
    )
  }, [businesses, vibe])

  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index * 40, 400)).duration(350)}
      style={styles.cardWrapper}
    >
      <BusinessCard
        business={item}
        onPress={() => navigation.navigate('BusinessDetail', { id: item.id })}
      />
    </Animated.View>
  ), [navigation])

  const activeFilterCount =
    (vibe ? 1 : 0) + (city ? 1 : 0) + (category ? 1 : 0)

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Explore</Text>
          <TouchableOpacity
            style={styles.mapBtn}
            onPress={() => navigation.navigate('MapExplore', { city: city ?? undefined })}
          >
            <Ionicons name="map-outline" size={18} color={colors.primary} />
            <Text style={styles.mapLabel}>Map</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <SearchBar
            placeholder="Search restaurants, bars..."
            onChangeText={debouncedSetSearch}
            style={styles.searchBar}
          />
          <TouchableOpacity
            style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
            onPress={() => setShowFilters((s) => !s)}
          >
            <Ionicons
              name="options-outline"
              size={20}
              color={activeFilterCount > 0 ? colors.primary : colors.muted}
            />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Vibe Pills */}
        <VibePills selected={vibe} onSelect={setVibe} style={styles.vibePills} />

        {/* Expandable filters */}
        {showFilters && (
          <View style={styles.filtersPanel}>
            {/* Category */}
            <Text style={styles.filterLabel}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterPills}
            >
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.filterPill, category === cat && styles.filterPillActive]}
                  onPress={() => setCategory(category === cat ? null : cat)}
                >
                  <Text
                    style={[styles.filterPillText, category === cat && styles.filterPillTextActive]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* City */}
            <Text style={[styles.filterLabel, { marginTop: 12 }]}>City</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterPills}
            >
              {CITIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.filterPill, city === c && styles.filterPillActive]}
                  onPress={() => setCity(city === c ? null : c)}
                >
                  <Text
                    style={[styles.filterPillText, city === c && styles.filterPillTextActive]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Clear */}
            {activeFilterCount > 0 && (
              <TouchableOpacity
                style={styles.clearFilters}
                onPress={() => { setVibe(null); setCity(null); setCategory(null) }}
              >
                <Text style={styles.clearFiltersText}>Clear all filters</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Results count */}
        <View style={styles.resultsRow}>
          <Text style={styles.resultsCount}>
            {isLoading ? 'Loading...' : `${filtered.length} spots found`}
          </Text>
        </View>
      </SafeAreaView>

      {/* Grid */}
      {isLoading ? (
        <View style={styles.skeletonGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <BusinessCardSkeleton key={i} style={styles.skeletonCard} />
          ))}
        </View>
      ) : (
        <FlashList
          data={filtered}
          renderItem={renderItem}
          estimatedItemSize={240}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState />}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  )
}

function EmptyState() {
  return (
    <View style={emptyStyles.container}>
      <Ionicons name="search-outline" size={48} color={colors.muted} />
      <Text style={emptyStyles.title}>No spots found</Text>
      <Text style={emptyStyles.sub}>Try adjusting your filters</Text>
    </View>
  )
}

const emptyStyles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 60, gap: 12 },
  title: { ...typography.h3, color: colors.muted },
  sub: { ...typography.bodyMD, color: colors.muted },
})

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safeArea: { backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: { ...typography.h1, color: colors.foreground },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  mapLabel: { ...typography.labelSM, color: colors.primary },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: layout.screenPaddingH,
    gap: 10,
    marginBottom: 8,
    alignItems: 'center',
  },
  searchBar: { flex: 1 },
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: radius.lg,
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: { borderColor: colors.primary },
  filterBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: { fontSize: 9, color: colors.primaryForeground, fontWeight: '700' },
  vibePills: { marginBottom: 4 },
  filtersPanel: {
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  filterLabel: { ...typography.labelSM, color: colors.muted, marginBottom: 8 },
  filterPills: { gap: 6, flexDirection: 'row' },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: { backgroundColor: 'rgba(201,153,10,0.15)', borderColor: colors.primary },
  filterPillText: { ...typography.labelSM, color: colors.muted },
  filterPillTextActive: { color: colors.primary },
  clearFilters: { marginTop: 10, alignSelf: 'flex-end' },
  clearFiltersText: { ...typography.labelSM, color: colors.primary },
  resultsRow: {
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultsCount: { ...typography.labelSM, color: colors.muted },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 8,
  },
  skeletonCard: { width: '47%' },
  listContent: { padding: 8, paddingBottom: layout.tabBarHeight + 16 },
  cardWrapper: { flex: 1, padding: 4 },
})
