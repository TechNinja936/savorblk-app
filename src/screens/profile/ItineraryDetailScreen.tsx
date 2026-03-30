import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { BusinessCard } from '../../components/business/BusinessCard'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { layout } from '../../theme/spacing'

export function ItineraryDetailScreen() {
  const navigation = useNavigation<any>()
  const { id } = useRoute<any>().params

  const { data: itinerary } = useQuery({
    queryKey: ['itinerary', id],
    queryFn: async () => {
      const { data } = await supabase.from('itineraries').select('*').eq('id', id).single()
      return data
    },
  })

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>{itinerary?.title ?? 'Vibe Route'}</Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.content}>
        {itinerary?.description && (
          <Text style={styles.desc}>{itinerary.description}</Text>
        )}
        {/* Stops */}
        {Array.isArray(itinerary?.stops) && itinerary.stops.map((stop: any, i: number) => (
          <View key={i} style={styles.stop}>
            <View style={styles.stopDot} />
            <View style={styles.stopInfo}>
              <Text style={styles.stopTime}>Day {stop.day} · {stop.time}</Text>
              <Text style={styles.stopName}>{stop.businessName}</Text>
              {stop.notes && <Text style={styles.stopNotes}>{stop.notes}</Text>}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: layout.screenPaddingH },
  title: { ...typography.h3, color: colors.foreground, flex: 1, textAlign: 'center' },
  content: { padding: layout.screenPaddingH, gap: 16 },
  desc: { ...typography.bodyMD, color: colors.muted, lineHeight: 22 },
  stop: { flexDirection: 'row', gap: 14 },
  stopDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary, marginTop: 6 },
  stopInfo: { flex: 1, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  stopTime: { ...typography.labelSM, color: colors.primary },
  stopName: { ...typography.labelLG, color: colors.foreground, marginTop: 2 },
  stopNotes: { ...typography.bodySM, color: colors.muted, marginTop: 4 },
})
