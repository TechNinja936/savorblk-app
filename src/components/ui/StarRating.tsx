import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../../theme/colors'

interface StarRatingProps {
  value: number
  max?: number
  size?: number
  interactive?: boolean
  onChange?: (rating: number) => void
}

export function StarRating({
  value,
  max = 5,
  size = 14,
  interactive = false,
  onChange,
}: StarRatingProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(value)
        const half = !filled && i < value

        const iconName: any = filled ? 'star' : half ? 'star-half' : 'star-outline'

        if (interactive) {
          return (
            <TouchableOpacity key={i} onPress={() => onChange?.(i + 1)}>
              <Ionicons
                name={iconName}
                size={size}
                color={colors.primary}
              />
            </TouchableOpacity>
          )
        }

        return (
          <Ionicons
            key={i}
            name={iconName}
            size={size}
            color={colors.primary}
          />
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 1,
    alignItems: 'center',
  },
})
