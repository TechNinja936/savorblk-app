import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { FlashList } from '@shopify/flash-list'
import { useQuery } from '@tanstack/react-query'
import { eventService } from '../../services/eventService'
import { SearchBar } from '../../components/search/SearchBar'
import { Badge } from '../../components/ui/Badge'
import { colors, gradients } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { radius, layout } from '../../theme/spacing'

export function SignatureEventsScreen() {
  const navigation = useNavigation<any>()
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState<string | null>(null)

  const { data: events = [] } = useQuery({
    queryKey: ['events', 'signature'],
    queryFn: eventService.getSignatureEvents,
    select: (data) => eventService.sortByUpcomingSeason(data),
  })

  const cities = [...new Set(events.map((e) => e.city).filter(Boolean))]

  const filtered = events.filter((e) => {
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase())
    const matchCity = !cityFilter || e.city === cityFilter
    return matchSearch && matchCity
  })

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Ionicons name="calendar-heart-outline" size={20} color={colors.primary} />
            <Text style={styles.title}>Signature Events</Text>
          </View>
        </View>
        <SearchBar placeholder="Search events..." onChangeText={setSearch} style={styles.search} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cityPills}>
          {cities.map((city) => (
            <TouchableOpacity
              key={city}
              style={[styles.cityPill, cityFilter === city && styles.cityPillActive]}
              onPress={() => setCityFilter(cityFilter === city ? null : city)}
            >
              <Text style={[styles.cityText, cityFilter === city && styles.cityTextActive]}>{city}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>

      <FlashList
        data={filtered}
        estimatedItemSize={200}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.eventCard}
            onPress={() => navigation.navigate('AnnualEventDetail', { id: item.id })}
            activeOpacity={0.85}
          >
            <Image source={{ uri: item.cover_image_url ?? '' }} style={StyleSheet.absoluteFill} contentFit="cover" />
            <LinearGradient colors={gradients.cardBottom} style={styles.grad} />
            {item.city && <Badge label={item.city} variant="primary" style={styles.cityBadge} />}
            {item.featured && (
              <View style={styles.featuredBadge}>
                <Ionicons name="star" size={10} color={colors.primary} />
              </View>
            )}
            <View style={styles.eventInfo}>
              <Text style={styles.eventName} numberOfLines={2}>{item.name}</Text>
              {item.typical_season && <Text style={styles.season}>{item.typical_season}</Text>}
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: layout.screenPaddingH, gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { ...typography.h2, color: colors.foreground },
  search: { marginHorizontal: layout.screenPaddingH, marginBottom: 8 },
  cityPills: { paddingHorizontal: layout.screenPaddingH, gap: 8, marginBottom: 8 },
  cityPill: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full,
    backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border,
  },
  cityPillActive: { borderColor: colors.primary, backgroundColor: 'rgba(201,153,10,0.15)' },
  cityText: { ...typography.labelSM, color: colors.muted },
  cityTextActive: { color: colors.primary },
  grid: { padding: layout.screenPaddingH, paddingBottom: layout.tabBarHeight + 16 },
  eventCard: {
    flex: 1, margin: 4, borderRadius: radius.xl, overflow: 'hidden',
    backgroundColor: colors.card, aspectRatio: 16/10,
  },
  grad: { ...StyleSheet.absoluteFillObject, top: '30%' },
  cityBadge: { position: 'absolute', top: 8, left: 8 },
  featuredBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: radius.full,
    padding: 5, borderWidth: 1, borderColor: colors.primaryDim,
  },
  eventInfo: { position: 'absolute', bottom: 8, left: 8, right: 8 },
  eventName: { ...typography.labelLG, color: colors.foreground },
  season: { ...typography.caption, color: colors.muted, marginTop: 2 },
})
