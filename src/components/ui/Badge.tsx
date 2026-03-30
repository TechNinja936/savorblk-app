import React from 'react'
import { View, Text, StyleSheet, ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { radius } from '../../theme/spacing'

type BadgeVariant = 'primary' | 'outline' | 'success' | 'warning' | 'destructive' | 'muted' | 'hbcu' | 'historic'

interface BadgeProps {
  label: string
  variant?: BadgeVariant
  icon?: keyof typeof Ionicons.glyphMap
  size?: 'sm' | 'md'
  style?: ViewStyle
}

const variantConfig: Record<BadgeVariant, { bg: string; border: string; text: string }> = {
  primary:     { bg: 'rgba(201,153,10,0.15)', border: colors.primaryDim, text: colors.primary },
  outline:     { bg: 'transparent',            border: colors.border,     text: colors.muted },
  success:     { bg: 'rgba(39,174,96,0.15)',   border: '#27ae60',         text: '#27ae60' },
  warning:     { bg: 'rgba(230,126,34,0.15)',  border: '#e67e22',         text: '#e67e22' },
  destructive: { bg: 'rgba(192,57,43,0.15)',   border: colors.destructive,text: colors.destructive },
  muted:       { bg: colors.secondary,          border: 'transparent',    text: colors.muted },
  hbcu:        { bg: 'rgba(39,174,96,0.2)',    border: colors.hbcuGreen,  text: colors.hbcuGreen },
  historic:    { bg: 'rgba(230,126,34,0.2)',   border: colors.historicAmber, text: colors.historicAmber },
}

export function Badge({ label, variant = 'muted', icon, size = 'sm', style }: BadgeProps) {
  const config = variantConfig[variant]
  const isSmall = size === 'sm'

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
          paddingHorizontal: isSmall ? 6 : 10,
          paddingVertical: isSmall ? 2 : 4,
        },
        style,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={isSmall ? 9 : 11}
          color={config.text}
          style={{ marginRight: 3 }}
        />
      )}
      <Text
        style={[
          isSmall ? typography.caption : typography.labelSM,
          { color: config.text },
        ]}
      >
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
})
