import React from 'react'
import { View, Text, StyleSheet, ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { radius } from '../../theme/spacing'

type Tier = 'bronze' | 'silver' | 'gold' | 'platinum'

interface TierConfig {
  label: string
  color: string
  icon: keyof typeof Ionicons.glyphMap
  minCheckins: number
}

const TIERS: Record<Tier, TierConfig> = {
  bronze:   { label: 'Bronze',   color: '#cd7f32', icon: 'medal-outline',    minCheckins: 1  },
  silver:   { label: 'Silver',   color: '#c0c0c0', icon: 'medal-outline',    minCheckins: 5  },
  gold:     { label: 'Gold',     color: '#c9990a', icon: 'trophy-outline',   minCheckins: 15 },
  platinum: { label: 'Platinum', color: '#e5e4e2', icon: 'diamond-outline',  minCheckins: 30 },
}

export function getTier(checkinCount: number): Tier {
  if (checkinCount >= 30) return 'platinum'
  if (checkinCount >= 15) return 'gold'
  if (checkinCount >= 5)  return 'silver'
  return 'bronze'
}

interface UserTierBadgeProps {
  checkinCount: number
  style?: ViewStyle
  showLabel?: boolean
}

export function UserTierBadge({ checkinCount, style, showLabel = true }: UserTierBadgeProps) {
  const tier = getTier(checkinCount)
  const config = TIERS[tier]

  return (
    <View
      style={[
        styles.container,
        { borderColor: config.color },
        style,
      ]}
    >
      <Ionicons name={config.icon} size={12} color={config.color} />
      {showLabel && (
        <Text style={[styles.label, { color: config.color }]}>
          {config.label}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
})
