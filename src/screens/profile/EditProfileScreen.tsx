import React, { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, StatusBar,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { useUIStore } from '../../stores/uiStore'
import { Avatar } from '../../components/ui/Avatar'
import { GoldButton } from '../../components/ui/GoldButton'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { radius, layout } from '../../theme/spacing'

const USER_TYPES = ['foodie', 'influencer', 'food_blogger', 'critic', 'business_owner', 'regular']
const CITIES = ['Houston', 'Atlanta', 'Detroit', 'New Orleans', 'New York City', 'Chicago', 'Washington D.C.', 'Philadelphia']

export function EditProfileScreen() {
  const navigation = useNavigation<any>()
  const { user, profile, setProfile } = useAuthStore()
  const { showToast } = useUIStore()
  const qc = useQueryClient()

  const [form, setForm] = useState({
    full_name: profile?.full_name ?? '',
    username: profile?.username ?? '',
    bio: profile?.bio ?? '',
    home_city: profile?.home_city ?? '',
    user_type: profile?.user_type ?? 'foodie',
    instagram_url: profile?.instagram_url ?? '',
    twitter_url: profile?.twitter_url ?? '',
    tiktok_url: profile?.tiktok_url ?? '',
    website_url: profile?.website_url ?? '',
  })

  const { mutate: save, isPending } = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(form)
        .eq('id', user!.id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      setProfile(data)
      showToast('Profile updated!', 'success')
      navigation.goBack()
    },
    onError: () => showToast('Could not save profile', 'error'),
  })

  const field = (label: string, key: keyof typeof form, placeholder?: string) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={form[key]}
        onChangeText={(v) => setForm((f) => ({ ...f, [key]: v }))}
        placeholder={placeholder ?? label}
        placeholderTextColor={colors.muted}
        autoCorrect={false}
        autoCapitalize="none"
      />
    </View>
  )

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Profile</Text>
          <GoldButton label="Save" size="sm" loading={isPending} onPress={() => save()} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <Avatar uri={profile?.avatar_url} name={profile?.full_name} size={80} />
          <TouchableOpacity style={styles.changePhotoBtn}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {field('Full Name', 'full_name')}
        {field('Username', 'username', '@username')}
        {field('Bio', 'bio', 'Tell the community about yourself')}

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Home City</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cityPills}>
            {CITIES.map((city) => (
              <TouchableOpacity
                key={city}
                style={[styles.pill, form.home_city === city && styles.pillActive]}
                onPress={() => setForm((f) => ({ ...f, home_city: city }))}
              >
                <Text style={[styles.pillText, form.home_city === city && styles.pillTextActive]}>
                  {city}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Social Links</Text>
        {field('Instagram', 'instagram_url', 'https://instagram.com/...')}
        {field('Twitter / X', 'twitter_url', 'https://twitter.com/...')}
        {field('TikTok', 'tiktok_url', 'https://tiktok.com/@...')}
        {field('Website', 'website_url', 'https://...')}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingH, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  title: { ...typography.h3, color: colors.foreground },
  body: { padding: layout.screenPaddingH, gap: 16 },
  avatarSection: { alignItems: 'center', paddingVertical: 16, gap: 10 },
  changePhotoBtn: {},
  changePhotoText: { ...typography.labelMD, color: colors.primary },
  field: { gap: 6 },
  fieldLabel: { ...typography.labelSM, color: colors.muted },
  input: {
    ...typography.bodyMD, color: colors.foreground,
    backgroundColor: colors.secondary, borderRadius: radius.lg,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: colors.border,
  },
  cityPills: { gap: 8 },
  pill: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full,
    backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border,
  },
  pillActive: { borderColor: colors.primary, backgroundColor: 'rgba(201,153,10,0.15)' },
  pillText: { ...typography.labelSM, color: colors.muted },
  pillTextActive: { color: colors.primary },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 4 },
  sectionTitle: { ...typography.labelLG, color: colors.muted },
})
