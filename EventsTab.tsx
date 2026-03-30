import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Ionicons } from '@expo/vector-icons'
import { eventService } from '../../../services/eventService'
import { useAuthStore } from '../../../stores/authStore'
import { useUIStore } from '../../../stores/uiStore'
import { Badge } from '../../../components/ui/Badge'
import { colors, gradients } from '../../../theme/colors'
import { typography } from '../../../theme/typography'
import { radius, layout } from '../../../theme/spacing'

export function EventsTab({ businessId }: { businessId: string }) {
  const { user, isLoggedIn } = useAuthStore()
  const { showToast } = useUIStore()
  const qc = useQueryClient()

  const { data: events = [] } = useQuery({
    queryKey: ['events', 'business', businessId],
    queryFn: () => eventService.getByBusiness(businessId),
  })

  if (!events.length) {
    return (
      <View style={styles.empty}>
        <Ionicons name="calendar-outline" size={40} color={colors.muted} />
        <Text style={styles.emptyText}>No upcoming events</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {events.map((event) => (
        <View key={event.id} style={styles.eventCard}>
          {event.flyer_url && (
            <View style={styles.flyerContainer}>
              <Image source={{ uri: event.flyer_url }} style={styles.flyer} contentFit="cover" />
              <LinearGradient colors={gradients.cardBottom} style={styles.flyerGrad} />
              {event.promoted && (
                <Badge label="Promoted" variant="primary" style={styles.promotedBadge} />
              )}
            </View>
          )}
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            {event.event_date && (
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={13} color={colors.primary} />
                <Text style={styles.dateText}>
                  {format(new Date(event.event_date), 'EEEE, MMMM d, yyyy')}
                </Text>
              </View>
            )}
            <RSVPButton eventId={event.id} />
          </View>
        </View>
      ))}
    </View>
  )
}

function RSVPButton({ eventId }: { eventId: string }) {
  const { user, isLoggedIn } = useAuthStore()
  const { showToast } = useUIStore()
  const qc = useQueryClient()

  const { data: isRSVPd = false } = useQuery({
    queryKey: ['rsvp', eventId, user?.id],
    queryFn: () => {
      if (!user) return false
      return eventService.getUserRSVP(eventId, user.id)
    },
    enabled: !!user,
  })

  const { data: count = 0 } = useQuery({
    queryKey: ['rsvp-count', eventId],
    queryFn: () => eventService.getRSVPCount(eventId),
  })

  const { mutate: toggle } = useMutation({
    mutationFn: () => {
      if (!user) throw new Error('Not logged in')
      return eventService.toggleRSVP(eventId, user.id, isRSVPd)
    },
    onMutate: () => {
      qc.setQueryData(['rsvp', eventId, user?.id], !isRSVPd)
      qc.setQueryData(['rsvp-count', eventId], (c: number) => isRSVPd ? c - 1 : c + 1)
    },
    onError: () => showToast('Could not update RSVP', 'error'),
  })

  return (
    <TouchableOpacity
      style={[styles.rsvpBtn, isRSVPd && styles.rsvpBtnActive]}
      onPress={() => {
        if (!isLoggedIn()) { showToast('Sign in to RSVP', 'info'); return }
        toggle()
      }}
    >
      <Ionicons
        name={isRSVPd ? 'checkmark-circle' : 'add-circle-outline'}
        size={16}
        color={isRSVPd ? colors.primary : colors.muted}
      />
      <Text style={[styles.rsvpText, isRSVPd && styles.rsvpTextActive]}>
        {isRSVPd ? 'Going' : 'RSVP'}
      </Text>
      {count > 0 && <Text style={styles.rsvpCount}>{count}</Text>}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { padding: layout.screenPaddingH, gap: 16 },
  eventCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  flyerContainer: { height: 200, position: 'relative' },
  flyer: { ...StyleSheet.absoluteFillObject },
  flyerGrad: { ...StyleSheet.absoluteFillObject, top: '40%' },
  promotedBadge: { position: 'absolute', top: 8, left: 8 },
  eventInfo: { padding: 14, gap: 8 },
  eventTitle: { ...typography.h4, color: colors.foreground },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { ...typography.bodyMD, color: colors.muted },
  rsvpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.secondary,
  },
  rsvpBtnActive: { borderColor: colors.primary, backgroundColor: 'rgba(201,153,10,0.1)' },
  rsvpText: { ...typography.labelSM, color: colors.muted },
  rsvpTextActive: { color: colors.primary },
  rsvpCount: { ...typography.caption, color: colors.muted },
  empty: { padding: 40, alignItems: 'center', gap: 12 },
  emptyText: { ...typography.bodyMD, color: colors.muted },
})
