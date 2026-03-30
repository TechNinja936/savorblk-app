import React from 'react'
import { View, Text, StyleSheet, StatusBar } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { BusinessCard } from '../../components/business/BusinessCard'
import { Skeleton } from '../../components/ui/SkeletonLoader'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { layout, radius } from '../../theme/spacing'

export function FavoritesScreen() {
  const navigation = useNavigation<any>()
  const { user } = useAuthStore()

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('favorites')
        .select('businesses(*)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
      return data?.map((f: any) => f.businesses).filter(Boolean) ?? []
    },
    enabled: !!user,
  })

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <Ionicons
            name="chevron-back"
            size={24}
            color={colors.foreground}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.title}>Saved Spots</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{favorites.length}</Text>
          </View>
        </View>
      </SafeAreaView>

      <FlashList
        data={favorites}
        numColumns={2}
        estimatedItemSize={230}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }: { item: any }) => (
          <BusinessCard
            business={item}
            style={styles.card}
            onPress={() => navigation.navigate('ExploreTab', {
              screen: 'BusinessDetail',
              params: { id: item.id },
            })}
          />
        )}
        keyExtractor={(item: any) => item.id}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={48} color={colors.muted} />
            <Text style={styles.emptyTitle}>No saved spots yet</Text>
            <Text style={styles.emptySub}>Tap the heart on any restaurant to save it</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: layout.screenPaddingH, paddingVertical: 12,
  },
  title: { ...typography.h2, color: colors.foreground, flex: 1 },
  countBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.full, backgroundColor: 'rgba(201,153,10,0.15)',
    borderWidth: 1, borderColor: colors.primaryDim,
  },
  countText: { ...typography.labelMD, color: colors.primary },
  grid: { padding: layout.screenPaddingH - 4, paddingBottom: layout.tabBarHeight + 16 },
  card: { flex: 1, margin: 4 },
  empty: { paddingTop: 80, alignItems: 'center', gap: 12, paddingHorizontal: 32 },
  emptyTitle: { ...typography.h3, color: colors.muted },
  emptySub: { ...typography.bodyMD, color: colors.muted, textAlign: 'center' },
})
