import React, { useRef, useState } from 'react'
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { radius } from '../../theme/spacing'

interface SearchBarProps extends Omit<TextInputProps, 'style'> {
  placeholder?: string
  onChangeText?: (text: string) => void
  onFocus?: () => void
  onBlur?: () => void
  onClear?: () => void
  style?: ViewStyle
}

export function SearchBar({
  placeholder = 'Search...',
  onChangeText,
  onFocus,
  onBlur,
  onClear,
  style,
  ...props
}: SearchBarProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<TextInput>(null)
  const borderColor = useSharedValue(colors.border)

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value,
  }))

  const handleFocus = () => {
    borderColor.value = withTiming(colors.primary, { duration: 200 })
    onFocus?.()
  }

  const handleBlur = () => {
    borderColor.value = withTiming(colors.border, { duration: 200 })
    onBlur?.()
  }

  const handleChange = (text: string) => {
    setValue(text)
    onChangeText?.(text)
  }

  const handleClear = () => {
    setValue('')
    onChangeText?.('')
    onClear?.()
    inputRef.current?.focus()
  }

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      <Ionicons name="search-outline" size={18} color={colors.muted} style={styles.icon} />
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={styles.input}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="never"
        {...props}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Ionicons name="close-circle" size={18} color={colors.muted} />
        </TouchableOpacity>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderRadius: radius.xl,
    paddingHorizontal: 12,
    height: 46,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    ...typography.bodyMD,
    color: colors.foreground,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
})
