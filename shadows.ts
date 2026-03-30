import { Platform } from 'react-native'
import { colors } from './colors'

// Cross-platform shadow utility
const shadow = (
  elevation: number,
  color = '#000000',
  opacity = 0.35
) =>
  Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: elevation * 0.5 },
      shadowOpacity: opacity,
      shadowRadius: elevation,
    },
    android: {
      elevation,
    },
  })

export const shadows = {
  none: {},
  sm: shadow(2),
  md: shadow(4),
  lg: shadow(8),
  xl: shadow(16),
  '2xl': shadow(24),

  // Gold glow — for verified business cards / primary CTAs
  goldGlow: Platform.select({
    ios: {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.45,
      shadowRadius: 12,
    },
    android: { elevation: 8 },
  }),

  // Card shadow
  card: shadow(4, '#000000', 0.4),

  // Bottom sheet
  sheet: shadow(20, '#000000', 0.6),
}
