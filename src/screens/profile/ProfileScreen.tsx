import React, { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Share,
} from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { GoldButton } from '../../components/ui/GoldButton'
import { UserTierBadge, getTier } from '../../components/profile/UserTierBadge'
import { BusinessCard } from '../../components/business/BusinessCard'
import { colors, gradients } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { radius, layout } from '../../theme/spacing'

const TABS = ['Activity', 'Saved', 'Lists'] as const
type Tab = typeof TABS[number]

export function ProfileScreen() {
  const navigation = useNavigation<any>()
  const { user, profile, session, signOut: storeSignOut } = useAuthStore()
  const [activeTab, setActiveTab] = useState<Tab>('Activity')

  // If not logged in, show sign-in prompt
  if (!session) {
    return (
      <View style={styles.authPrompt}>
        <Ionicons name="person-circle-outline" size={80} color={colors.muted} />
        <Text style={styles.authTitle}>Join SavorBLK</Text>
        <Text style={styles.authSub}>Sign in to save favorites, check in, and discover your city.</Text>
        <GoldButton
          label="Sign In"
          onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
          fullWidth
          style={styles.authBtn}
        />
        <GoldButton
          label="Create Account"
          variant="outline"
          onPress={() => navigation.navigate('Auth', { screen: 'Signup' })}
          fullWidth
          style={styles.authBtn}
        />
      </View>
    )
  }

  const { data: checkinCount = 0 } = useQuery({
    queryKey: ['checkin-total', user?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from('business_checkins')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user!.id)
      return count ?? 0
    },
    enabled: !!user,
  })

  const { data: favoritesCount = 0 } = useQuery({
    queryKey: ['favorites-count', user?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from('favorites')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user!.id)
      return count ?? 0
    },
    enabled: !!user,
  })

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('favorites')
        .select('businesses(*)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(20)
      return data?.map((f: any) => f.businesses).filter(Boolean) ?? []
    },
    enabled: !!user && activeTab === 'Saved',
  })

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    storeSignOut()
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero banner */}
        <View style={styles.banner}>
          <LinearGradient
            colors={['#1a1a1a', '#0a0a0a']}
            style={StyleSheet.absoluteFill}
          />
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800' }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
          <LinearGradient colors={gradients.heroOverlay} style={StyleSheet.absoluteFill} />
        </View>

        {/* Profile card */}
        <View style={styles.profileCard}>
          {/* Avatar */}
          <View style={styles.avatarRow}>
            <Avatar
              uri={profile?.avatar_url}
              name={profile?.full_name ?? profile?.username}
              size={72}
              verified={profile?.verified_creator}
            />
            <View style={styles.editRow}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => navigation.navigate('EditProfile')}
              >
                <Ionicons name="pencil-outline" size={16} color={colors.foreground} />
                <Text style={styles.editBtnText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.moreBtn} onPress={handleSignOut}>
                <Ionicons name="log-out-outline" size={20} color={colors.muted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Name + username */}
          <Text style={styles.fullName}>{profile?.full_name ?? 'SavorBLK User'}</Text>
          <Text style={styles.username}>@{profile?.username ?? 'user'}</Text>

          {/* Badges */}
          <View style={styles.badgesRow}>
            {profile?.user_type && (
              <Badge label={profile.user_type.replace('_', ' ')} variant="muted" />
            )}
            {profile?.verified_creator && (
              <Badge label="Verified Creator" variant="primary" icon="checkmark-circle-outline" />
            )}
            <UserTierBadge checkinCount={checkinCount} />
          </View>

          {/* City */}
          {profile?.home_city && (
            <View style={styles.cityRow}>
              <Ionicons name="location-outline" size={13} color={colors.muted} />
              <Text style={styles.cityText}>{profile.home_city}</Text>
            </View>
          )}

          {/* Bio */}
          {profile?.bio && (
            <Text style={styles.bio}>{profile.bio}</Text>
          )}

          {/* Social links */}
          <View style={styles.socialRow}>
            {profile?.instagram_url && (
              <Ionicons name="logo-instagram" size={20} color={colors.muted} />
            )}
            {profile?.twitter_url && (
              <Ionicons name="logo-twitter" size={20} color={colors.muted} />
            )}
            {profile?.tiktok_url && (
              <Ionicons name="logo-tiktok" size={20} color={colors.muted} />
            )}
          </View>
        </View>

        {/* Stats bar */}
        <View style={styles.statsBar}>
          <TouchableOpacity style={styles.stat} onPress={() => navigation.navigate('Favorites')}>
            <Text style={styles.statValue}>{favoritesCount}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{checkinCount}</Text>
            <Text style={styles.statLabel}>Check-ins</Text>
          </View>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.stat} onPress={() => navigation.navigate('VibeRoutes')}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Routes</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.stat}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Lists</Text>
          </TouchableOpacity>
        </View>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('PlaylistBuilder')}
          >
            <Ionicons name="map-outline" size={22} color={colors.primary} />
            <Text style={styles.actionLabel}>Build Vibe Route</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('ListBuilder')}
          >
            <Ionicons name="list-outline" size={22} color={colors.primary} />
            <Text style={styles.actionLabel}>Create List</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('CreatorApplication')}
          >
            <Ionicons name="star-outline" size={22} color={colors.primary} />
            <Text style={styles.actionLabel}>Get Verified</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab content */}
        {activeTab === 'Saved' && (
          <View style={styles.savedGrid}>
            {favorites.map((biz: any) => (
              <BusinessCard
                key={biz.id}
                business={biz}
                style={styles.savedCard}
                onPress={() => navigation.navigate('ExploreTab', {
                  screen: 'BusinessDetail',
                  params: { id: biz.id },
                })}
              />
            ))}
            {favorites.length === 0 && (
              <View style={styles.emptyTab}>
                <Ionicons name="heart-outline" size={40} color={colors.muted} />
                <Text style={styles.emptyText}>No saved spots yet</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'Activity' && (
          <View style={styles.emptyTab}>
            <Ionicons name="time-outline" size={40} color={colors.muted} />
            <Text style={styles.emptyText}>Your activity will appear here</Text>
          </View>
        )}

        {activeTab === 'Lists' && (
          <View style={styles.emptyTab}>
            <Ionicons name="list-outline" size={40} color={colors.muted} />
            <Text style={styles.emptyText}>Create your first list</Text>
            <GoldButton
              label="Create List"
              variant="outline"
              size="sm"
              onPress={() => navigation.navigate('ListBuilder')}
              style={{ marginTop: 12 }}
            />
          </View>
        )}

        <View style={{ height: layout.tabBarHeight + 20 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Auth prompt
  authPrompt: {
    flex: 1, backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12,
  },
  authTitle: { ...typography.h2, color: colors.foreground },
  authSub: { ...typography.bodyMD, color: colors.muted, textAlign: 'center', lineHeight: 22 },
  authBtn: { marginTop: 4 },

  // Banner + profile card
  banner: { height: 140, overflow: 'hidden', backgroundColor: colors.secondary },
  profileCard: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: 0,
    paddingBottom: 16,
    backgroundColor: colors.card,
    marginTop: -1,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  avatarRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    marginTop: -40,
  },
  editRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.secondary,
  },
  editBtnText: { ...typography.labelSM, color: colors.foreground },
  moreBtn: { padding: 6 },

  fullName: { ...typography.h3, color: colors.foreground },
  username: { ...typography.bodyMD, color: colors.muted },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cityText: { ...typography.bodySM, color: colors.muted },
  bio: { ...typography.bodyMD, color: colors.foreground, lineHeight: 22 },
  socialRow: { flexDirection: 'row', gap: 14 },

  // Stats
  statsBar: {
    flexDirection: 'row', backgroundColor: colors.card,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statValue: { ...typography.h3, color: colors.foreground },
  statLabel: { ...typography.caption, color: colors.muted, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: colors.border, alignSelf: 'stretch', marginVertical: 10 },

  // Quick actions
  quickActions: {
    flexDirection: 'row', padding: layout.screenPaddingH,
    gap: 10, backgroundColor: colors.background,
  },
  actionCard: {
    flex: 1, backgroundColor: colors.card, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', paddingVertical: 16, gap: 8,
  },
  actionLabel: { ...typography.labelSM, color: colors.foreground, textAlign: 'center' },

  // Tabs
  tabBar: {
    flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  tabBtn: {
    flex: 1, paddingVertical: 12, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabBtnActive: { borderBottomColor: colors.primary },
  tabLabel: { ...typography.labelMD, color: colors.muted },
  tabLabelActive: { color: colors.primary },

  // Saved grid
  savedGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    padding: layout.screenPaddingH - 4,
  },
  savedCard: { width: '50%', padding: 4 },

  // Empty states
  emptyTab: {
    paddingVertical: 48, alignItems: 'center', gap: 12,
    paddingHorizontal: layout.screenPaddingH,
  },
  emptyText: { ...typography.bodyMD, color: colors.muted },
})
