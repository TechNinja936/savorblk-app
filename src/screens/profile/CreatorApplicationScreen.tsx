import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useMutation } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { useUIStore } from '../../stores/uiStore'
import { GoldButton } from '../../components/ui/GoldButton'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { radius, layout } from '../../theme/spacing'

export function CreatorApplicationScreen() {
  const navigation = useNavigation<any>()
  const { user } = useAuthStore()
  const { showToast } = useUIStore()
  const [form, setForm] = useState({ bio: '', follower_count: '', sample_url: '' })

  const { mutate: apply, isPending, isSuccess } = useMutation({
    mutationFn: async () => {
      await supabase.from('creator_applications').insert({
        user_id: user!.id,
        bio: form.bio,
        follower_count: parseInt(form.follower_count) || 0,
        sample_content_urls: form.sample_url ? [form.sample_url] : [],
        status: 'pending',
      })
    },
    onSuccess: () => showToast('Application submitted!', 'success'),
    onError: () => showToast('Could not submit application', 'error'),
  })

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.title}>Become a Creator</Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>

      {isSuccess ? (
        <View style={styles.success}>
          <Ionicons name="checkmark-circle" size={64} color={colors.success} />
          <Text style={styles.successTitle}>Application Submitted</Text>
          <Text style={styles.successSub}>We'll review your application and reach out within 5–7 days.</Text>
          <GoldButton label="Done" onPress={() => navigation.goBack()} style={{ marginTop: 24 }} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.bodyText}>
            Verified creators get a badge, appear in Creator Picks, and can post featured content.
          </Text>
          {[
            ['Bio / About You', 'bio', 'Tell us about yourself and your food journey'],
            ['Instagram / TikTok followers', 'follower_count', 'e.g. 5000'],
            ['Sample content URL', 'sample_url', 'Link to a recent post'],
          ].map(([label, key, placeholder]) => (
            <View key={key as string} style={styles.field}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                value={form[key as keyof typeof form]}
                onChangeText={(v) => setForm((f) => ({ ...f, [key as string]: v }))}
                placeholder={placeholder as string}
                placeholderTextColor={colors.muted}
                color={colors.foreground}
                autoCapitalize="none"
              />
            </View>
          ))}
          <GoldButton label="Submit Application" loading={isPending} onPress={() => apply()} fullWidth style={{ marginTop: 16 }} />
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: layout.screenPaddingH, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { ...typography.h3, color: colors.foreground },
  body: { padding: layout.screenPaddingH, gap: 16 },
  bodyText: { ...typography.bodyMD, color: colors.muted, lineHeight: 22 },
  field: { gap: 6 },
  label: { ...typography.labelSM, color: colors.muted },
  input: { ...typography.bodyMD, backgroundColor: colors.secondary, borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: colors.border },
  success: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  successTitle: { ...typography.h2, color: colors.foreground },
  successSub: { ...typography.bodyMD, color: colors.muted, textAlign: 'center', lineHeight: 22 },
})
