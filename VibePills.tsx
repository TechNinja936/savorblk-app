import React from 'react'
import { ScrollView, TouchableOpacity, Text, StyleSheet, ViewStyle, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { radius } from '../../theme/spacing'

export const VIBES = [
  { label: 'Brunch', emoji: '🥂', tag: 'brunch' },
  { label: 'Date Night', emoji: '🕯️', tag: 'date-night' },
  { label: 'Late Night', emoji: '🌙', tag: 'late-night' },
  { label: 'Casual', emoji: '😌', tag: 'casual' },
  { label: 'Upscale', emoji: '✨', tag: 'upscale' },
  { label: 'Family', emoji: '👨‍👩‍👧', tag: 'family-friendly' },
  { label: 'Takeout', emoji: '📦', tag: 'takeout' },
  { label: 'Trendy', emoji: '🔥', tag: 'trendy' },
]

interface VibePillsProps {
  selected?: string | null
  onSelect?: (tag: string | null) => void
  style?: ViewStyle
}

export function VibePills({ selected, onSelect, style }: VibePillsProps) {
  const handlePress = (tag: string) => {
    Haptics.selectionAsync()
    onSelect?.(selected === tag ? null : tag)
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, style]}
    >
      {VIBES.map((vibe) => {
        const isActive = selected === vibe.tag
        return (
          <TouchableOpacity
            key={vibe.tag}
            onPress={() => handlePress(vibe.tag)}
            style={[styles.pill, isActive && styles.pillActive]}
            activeOpacity={0.75}
          >
            <Text style={styles.emoji}>{vibe.emoji}</Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {vibe.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: {
    backgroundColor: 'rgba(201,153,10,0.15)',
    borderColor: colors.primary,
  },
  emoji: {
    fontSize: 14,
  },
  label: {
    ...typography.labelMD,
    color: colors.muted,
  },
  labelActive: {
    color: colors.primary,
  },
})
