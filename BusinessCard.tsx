import React, { useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { FavoriteButton } from './FavoriteButton'
import { colors, gradients } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { radius } from '../../theme/spacing'
import type { Business } from '../../types/database.types'

interface BusinessCardProps {
  business: Business & {
    tags?: string[]
    checkInCount?: number
    nearHBCU?: boolean
    historicDistrict?: string | null
  }
  onPress?: () => void
  style?: ViewStyle
  variant?: 'default' | 'featured'
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)
const LOGO_PLACEHOLDER = require('../../../assets/images/logo-gold.png')

export function BusinessCard({ business, onPress, style, variant = 'default' }: BusinessCardProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, { damping: 18, stiffness: 280 })
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }, [])

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 18, stiffness: 280 })
  }, [])

  const imageSource = business.cover_photo_url
    ? { uri: business.cover_photo_url }
    : LOGO_PLACEHOLDER

  const isHot = (business.checkInCount ?? 0) >= 25
  const isFeatured = variant === 'featured' || business.featured

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={[
        styles.container,
        isFeatured && styles.featuredContainer,
        animatedStyle,
        style,
      ]}
    >
      {/* Image section */}
      <View style={styles.imageWrapper}>
        <Image
          source={imageSource}
          style={styles.image}
          contentFit="cover"
          transition={300}
          placeholder={LOGO_PLACEHOLDER}
          placeholderContentFit="contain"
        />

        {/* Bottom gradient */}
        <LinearGradient
          colors={gradients.cardBottom}
          style={styles.gradient}
          pointerEvents="none"
        />

        {/* Featured crown */}
        {isFeatured && (
          <View style={styles.crownBadge}>
            <Ionicons name="star" size={10} color={colors.primary} />
          </View>
        )}

        {/* Favorite button */}
        <View style={styles.favoritePos}>
          <FavoriteButton businessId={business.id} size={18} />
        </View>

        {/* Bottom-left badges */}
        <View style={styles.badgeRow}>
          {business.category && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{business.category}</Text>
            </View>
          )}
          {business.price_range && (
            <View style={[styles.badge, styles.priceBadge]}>
              <Text style={styles.badgeText}>{business.price_range}</Text>
            </View>
          )}
          {business.historicDistrict && (
            <View style={[styles.badge, styles.historicBadge]}>
              <Ionicons name="business-outline" size={9} color={colors.historicAmber} />
            </View>
          )}
          {business.nearHBCU && (
            <View style={[styles.badge, styles.hbcuBadge]}>
              <Text style={[styles.badgeText, { color: colors.hbcuGreen }]}>Campus</Text>
            </View>
          )}
          {isHot && (
            <View style={[styles.badge, styles.hotBadge]}>
              <Text style={styles.badgeText}>🔥</Text>
            </View>
          )}
        </View>
      </View>

      {/* Card body */}
      <View style={styles.body}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {business.name}
          </Text>
          {business.verified && (
            <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
          )}
        </View>

        {/* Rating */}
        {business.rating ? (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={11} color={colors.primary} />
            <Text style={styles.rating}>{Number(business.rating).toFixed(1)}</Text>
            {business.review_count ? (
              <Text style={styles.reviewCount}>({business.review_count})</Text>
            ) : null}
            {business.follower_count ? (
              <>
                <Text style={styles.dot}>·</Text>
                <Ionicons name="heart" size={10} color={colors.muted} />
                <Text style={styles.reviewCount}>{business.follower_count}</Text>
              </>
            ) : null}
          </View>
        ) : null}

        {/* Location */}
        {(business.neighborhood || business.city) && (
          <Text style={styles.location} numberOfLines={1}>
            {[business.neighborhood, business.city].filter(Boolean).join(', ')}
          </Text>
        )}
      </View>
    </AnimatedTouchable>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  featuredContainer: {
    borderColor: colors.primaryDim,
  },
  imageWrapper: {
    aspectRatio: 4 / 3,
    position: 'relative',
    backgroundColor: colors.secondary,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    top: '40%',
  },
  crownBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: radius.full,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.primaryDim,
  },
  favoritePos: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  badgeRow: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  badge: {
    backgroundColor: 'rgba(10,10,10,0.72)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  priceBadge: {
    borderColor: colors.primaryDim,
  },
  historicBadge: {
    borderColor: colors.historicAmber,
  },
  hbcuBadge: {
    borderColor: colors.hbcuGreen,
    backgroundColor: 'rgba(39,174,96,0.15)',
  },
  hotBadge: {
    backgroundColor: 'rgba(220,50,50,0.6)',
  },
  badgeText: {
    ...typography.caption,
    color: colors.foreground,
  },
  body: {
    padding: 10,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  name: {
    ...typography.labelLG,
    color: colors.foreground,
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rating: {
    ...typography.labelSM,
    color: colors.primary,
  },
  reviewCount: {
    ...typography.caption,
    color: colors.muted,
  },
  dot: {
    ...typography.caption,
    color: colors.muted,
  },
  location: {
    ...typography.bodySM,
    color: colors.muted,
  },
})
