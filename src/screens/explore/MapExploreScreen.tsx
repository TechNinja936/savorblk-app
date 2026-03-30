import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native'
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import Animated, { FadeInUp } from 'react-native-reanimated'

import { businessService } from '../../services/businessService'
import { BusinessCard } from '../../components/business/BusinessCard'
import { SearchBar } from '../../components/search/SearchBar'

import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { radius, layout } from '../../theme/spacing'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')
const CARD_HEIGHT = 160

const MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8c8c8c' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0a0a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2a2a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d0d0d' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
]

export function MapExploreScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const mapRef = useRef<MapView>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const city = route.params?.city ?? 'Houston'

  const { data: businesses = [] } = useQuery({
    queryKey: ['businesses', 'map', city],
    queryFn: () => businessService.getAll({ city, limit: 100 }),
    staleTime: 1000 * 60 * 5,
  })

  const filteredBusinesses = search
    ? businesses.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))
    : businesses

  const selectedBusiness = businesses.find((b) => b.id === selectedId)

  const handleMarkerPress = (id: string) => {
    setSelectedId(id)
  }

  const handleCardPress = (id: string) => {
    navigation.navigate('BusinessDetail', { id })
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={MAP_STYLE}
        initialRegion={{
          latitude: 29.7604,
          longitude: -95.3698,
          latitudeDelta: 0.15,
          longitudeDelta: 0.15,
        }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {filteredBusinesses.map((biz) => (
          <Marker
            key={biz.id}
            coordinate={{
              latitude: 29.76 + Math.random() * 0.1 - 0.05, // placeholder until geo data
              longitude: -95.37 + Math.random() * 0.1 - 0.05,
            }}
            onPress={() => handleMarkerPress(biz.id)}
          >
            <View
              style={[
                styles.pin,
                biz.id === selectedId && styles.pinActive,
              ]}
            >
              {biz.featured && (
                <Ionicons name="star" size={8} color={colors.primary} />
              )}
              <Text style={styles.pinText} numberOfLines={1}>
                {biz.name.length > 12 ? biz.name.slice(0, 12) + '…' : biz.name}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Top controls */}
      <SafeAreaView edges={['top']} style={styles.topBar} pointerEvents="box-none">
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-down" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <SearchBar
            placeholder="Search on map..."
            onChangeText={setSearch}
            style={styles.mapSearch}
          />
        </View>
      </SafeAreaView>

      {/* My location button */}
      <TouchableOpacity style={styles.locationBtn}>
        <Ionicons name="locate-outline" size={22} color={colors.foreground} />
      </TouchableOpacity>

      {/* Selected business card */}
      {selectedBusiness && (
        <Animated.View entering={FadeInUp.duration(300)} style={styles.selectedCard}>
          <BusinessCard
            business={selectedBusiness}
            onPress={() => handleCardPress(selectedBusiness.id)}
            style={styles.mapCard}
          />
          <TouchableOpacity
            style={styles.dismissBtn}
            onPress={() => setSelectedId(null)}
          >
            <Ionicons name="close" size={16} color={colors.muted} />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Bottom list (when no selection) */}
      {!selectedBusiness && (
        <View style={styles.bottomList}>
          <View style={styles.bottomHandle} />
          <Text style={styles.bottomCount}>
            {filteredBusinesses.length} spots in {city}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bottomScroll}
          >
            {filteredBusinesses.slice(0, 10).map((biz) => (
              <BusinessCard
                key={biz.id}
                business={biz}
                style={styles.bottomCard}
                onPress={() => {
                  setSelectedId(biz.id)
                  handleCardPress(biz.id)
                }}
              />
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  map: { ...StyleSheet.absoluteFillObject },

  // Top bar
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  mapSearch: {
    flex: 1,
    backgroundColor: colors.glass,
  },

  // Location button
  locationBtn: {
    position: 'absolute',
    right: 16,
    bottom: 300,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Map pins
  pin: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1.5,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    maxWidth: 120,
  },
  pinActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(201,153,10,0.2)',
  },
  pinText: {
    ...typography.caption,
    color: colors.foreground,
    fontWeight: '600',
  },

  // Selected card
  selectedCard: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    right: 16,
  },
  mapCard: {},
  dismissBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 4,
  },

  // Bottom list
  bottomList: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.glass,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
    paddingTop: 12,
    paddingBottom: layout.tabBarHeight,
  },
  bottomHandle: {
    width: 36,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  bottomCount: {
    ...typography.labelSM,
    color: colors.muted,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  bottomScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  bottomCard: {
    width: 160,
  },
})
