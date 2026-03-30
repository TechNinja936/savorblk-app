import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useMutation } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { useUIStore } from '../../stores/uiStore'
import { GoldButton } from '../../components/ui/GoldButton'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { radius, layout } from '../../theme/spacing'

export function ClaimBusinessScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const { user } = useAuthStore()
  const { showToast } = useUIStore()
  const { businessId } = route.params

  const { mutate: submitClaim, isPending, isSuccess } = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not logged in')
      await supabase.from('business_claims').insert({
        user_id: user.id,
        business_id: businessId,
        status: 'pending',
      })
    },
    onSuccess: () => showToast('Claim submitted! We\'ll review it shortly.', 'success'),
    onError: () => showToast('Could not submit claim. Try again.', 'error'),
  })

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.title}>Claim This Business</Text>
        <View style={{ width: 24 }} />
      </View>

      {isSuccess ? (
        <View style={styles.success}>
          <Ionicons name="checkmark-circle" size={64} color={colors.success} />
          <Text style={styles.successTitle}>Claim Submitted</Text>
          <Text style={styles.successSub}>
            We'll verify your ownership and get back to you within 2–3 business days.
          </Text>
          <GoldButton label="Done" onPress={() => navigation.goBack()} style={{ marginTop: 24 }} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.bodyText}>
            Claiming your business gives you access to your owner dashboard where you can:
          </Text>
          <View style={styles.benefitList}>
            {[
              'Edit your business details and photos',
              'Post events with flyer images',
              'View analytics (fans, check-ins, reviews)',
              'Purchase featured placement',
            ].map((b) => (
              <View key={b} style={styles.benefit}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.benefitText}>{b}</Text>
              </View>
            ))}
          </View>
          <GoldButton
            label="Submit Claim Request"
            onPress={() => submitClaim()}
            loading={isPending}
            fullWidth
            style={{ marginTop: 32 }}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: layout.screenPaddingH,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { ...typography.h3, color: colors.foreground },
  body: { padding: layout.screenPaddingH },
  bodyText: { ...typography.bodyMD, color: colors.muted, lineHeight: 22, marginBottom: 20 },
  benefitList: { gap: 14 },
  benefit: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  benefitText: { ...typography.bodyMD, color: colors.foreground, flex: 1 },
  success: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: layout.screenPaddingH },
  successTitle: { ...typography.h2, color: colors.foreground, marginTop: 16 },
  successSub: { ...typography.bodyMD, color: colors.muted, textAlign: 'center', marginTop: 8, lineHeight: 22 },
})
