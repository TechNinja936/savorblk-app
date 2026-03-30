import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { businessService } from '../../../services/businessService'
import { Avatar } from '../../../components/ui/Avatar'
import { StarRating } from '../../../components/ui/StarRating'
import { GoldButton } from '../../../components/ui/GoldButton'
import { useAuthStore } from '../../../stores/authStore'
import { useUIStore } from '../../../stores/uiStore'
import { colors } from '../../../theme/colors'
import { typography } from '../../../theme/typography'
import { radius, layout } from '../../../theme/spacing'

export function ReviewsTab({ businessId }: { businessId: string }) {
  const { user, isLoggedIn } = useAuthStore()
  const { showToast } = useUIStore()
  const qc = useQueryClient()
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState('')
  const [showForm, setShowForm] = useState(false)

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews', businessId],
    queryFn: () => businessService.getReviews(businessId),
  })

  const { mutate: submitReview, isPending } = useMutation({
    mutationFn: () => {
      if (!user) throw new Error('Not logged in')
      return businessService.submitReview(businessId, user.id, rating, content)
    },
    onSuccess: () => {
      setRating(0)
      setContent('')
      setShowForm(false)
      showToast('Review submitted!', 'success')
      qc.invalidateQueries({ queryKey: ['reviews', businessId] })
    },
    onError: () => showToast('Could not submit review', 'error'),
  })

  return (
    <View style={styles.container}>
      {/* Write a review */}
      {isLoggedIn() && !showForm && (
        <TouchableOpacity style={styles.writeBtn} onPress={() => setShowForm(true)}>
          <Text style={styles.writeBtnText}>Write a Review</Text>
        </TouchableOpacity>
      )}

      {showForm && (
        <View style={styles.reviewForm}>
          <Text style={styles.formLabel}>Your Rating</Text>
          <StarRating value={rating} interactive onChange={setRating} size={28} />
          <TextInput
            style={styles.reviewInput}
            placeholder="Share your experience..."
            placeholderTextColor={colors.muted}
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={4}
          />
          <View style={styles.formActions}>
            <GoldButton
              label="Cancel"
              variant="ghost"
              size="sm"
              onPress={() => setShowForm(false)}
            />
            <GoldButton
              label="Submit"
              size="sm"
              loading={isPending}
              disabled={rating === 0}
              onPress={() => submitReview()}
            />
          </View>
        </View>
      )}

      {/* Reviews list */}
      {reviews.map((review: any) => (
        <View key={review.id} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <Avatar
              uri={review.user_profiles?.avatar_url}
              name={review.user_profiles?.username}
              size={36}
            />
            <View style={styles.reviewMeta}>
              <Text style={styles.reviewUser}>
                @{review.user_profiles?.username ?? 'Anonymous'}
              </Text>
              <Text style={styles.reviewDate}>
                {format(new Date(review.created_at), 'MMM d, yyyy')}
              </Text>
            </View>
            <StarRating value={review.rating} size={12} />
          </View>
          {review.content && (
            <Text style={styles.reviewContent}>{review.content}</Text>
          )}
        </View>
      ))}

      {reviews.length === 0 && !isLoading && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No reviews yet. Be the first!</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: layout.screenPaddingH, paddingTop: 16 },
  writeBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  writeBtnText: { ...typography.buttonMD, color: colors.primary },
  reviewForm: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: 16,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formLabel: { ...typography.labelMD, color: colors.muted },
  reviewInput: {
    ...typography.bodyMD,
    color: colors.foreground,
    backgroundColor: colors.secondary,
    borderRadius: radius.lg,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.border,
  },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  reviewCard: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewMeta: { flex: 1 },
  reviewUser: { ...typography.labelMD, color: colors.foreground },
  reviewDate: { ...typography.caption, color: colors.muted, marginTop: 2 },
  reviewContent: { ...typography.bodyMD, color: colors.foreground, lineHeight: 22 },
  empty: { paddingVertical: 32, alignItems: 'center' },
  emptyText: { ...typography.bodyMD, color: colors.muted },
})
