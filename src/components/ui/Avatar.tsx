import React from 'react'
import { View, Text, StyleSheet, ViewStyle } from 'react-native'
import { Image } from 'expo-image'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'

interface AvatarProps {
  uri?: string | null
  name?: string | null
  size?: number
  verified?: boolean
  style?: ViewStyle
}

export function Avatar({ uri, name, size = 40, verified = false, style }: AvatarProps) {
  const initial = name?.charAt(0)?.toUpperCase() ?? '?'
  const fontSize = size * 0.38

  return (
    <View style={[{ width: size, height: size }, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[
            styles.image,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: verified ? 2 : 0,
              borderColor: verified ? colors.primary : 'transparent',
            },
          ]}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: verified ? 2 : 0,
              borderColor: verified ? colors.primary : 'transparent',
            },
          ]}
        >
          <Text style={[typography.labelLG, { color: colors.primary, fontSize }]}>
            {initial}
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.secondary,
  },
  placeholder: {
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
