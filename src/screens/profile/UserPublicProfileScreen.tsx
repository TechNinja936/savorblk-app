import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { GoldButton } from '../../components/ui/GoldButton'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { layout } from '../../theme/spacing'

export function UserPublicProfileScreen() {
  const navigation = useNavigation<any>()
  const { username } = useRoute<any>().params
  const { user } = useAuthStore()
  const qc = useQueryClient()

  const { data: profile } = useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      const { data } = await supabase.from('user_profiles').select('*').eq('username', username).single()
      return data
    },
  })

  const { data: isFollowing = false } = useQuery({
    queryKey: ['following', user?.id, profile?.id],
    queryFn: async () => {
      if (!user || !profile) return false
      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', profile.id)
        .maybeSingle()
      return !!data
    },
    enabled: !!user && !!profile,
  })

  const { mutate: toggleFollow } = useMutation({
    mutationFn: async () => {
      if (!user || !profile) throw new Error()
      if (isFollowing) {
        await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', profile.id)
      } else {
        await supabase.from('follows').insert({ follower_id: user.id, following_id: profile.id })
      }
    },
    onMutate: () => {
      qc.setQueryData(['following', user?.id, profile?.id], !isFollowing)
    },
  })

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.title}>@{username}</Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.profileSection}>
          <Avatar uri={profile?.avatar_url} name={profile?.full_name} size={72} verified={profile?.verified_creator} />
          <Text style={styles.name}>{profile?.full_name}</Text>
          <Text style={styles.username}>@{profile?.username}</Text>
          {profile?.bio && <Text style={styles.bio}>{profile.bio}</Text>}
          <View style={styles.badges}>
            {profile?.verified_creator && <Badge label="Verified Creator" variant="primary" icon="checkmark-circle-outline" />}
            {profile?.user_type && <Badge label={profile.user_type} variant="muted" />}
          </View>
          {user && user.id !== profile?.id && (
            <GoldButton
              label={isFollowing ? 'Following' : 'Follow'}
              variant={isFollowing ? 'outline' : 'filled'}
              size="sm"
              onPress={() => toggleFollow()}
              style={{ marginTop: 12 }}
            />
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: layout.screenPaddingH },
  title: { ...typography.labelLG, color: colors.muted },
  body: { padding: layout.screenPaddingH },
  profileSection: { alignItems: 'center', gap: 8 },
  name: { ...typography.h3, color: colors.foreground },
  username: { ...typography.bodyMD, color: colors.muted },
  bio: { ...typography.bodyMD, color: colors.foreground, textAlign: 'center', lineHeight: 22 },
  badges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
})
