import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { BusinessCard } from '../../components/business/BusinessCard'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { layout } from '../../theme/spacing'

export function SharedListScreen() {
  const navigation = useNavigation<any>()
  const { shareCode } = useRoute<any>().params

  const { data: list } = useQuery({
    queryKey: ['list', shareCode],
    queryFn: async () => {
      const { data } = await supabase
        .from('curated_lists')
        .select('*, curated_list_items(sort_order, businesses(*))')
        .eq('share_code', shareCode)
        .single()
      return data
    },
  })

  const businesses = list?.curated_list_items
    ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
    .map((item: any) => item.businesses)
    .filter(Boolean) ?? []

  const handleShare = () => {
    Share.share({
      message: `Check out this list on SavorBLK: ${list?.title}\nsavorblk.com/lists/${shareCode}`,
    })
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>{list?.title ?? 'Curated List'}</Text>
          <TouchableOpacity onPress={handleShare}>
            <Ionicons name="share-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>
        {list?.description && <Text style={styles.desc}>{list.description}</Text>}
      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.grid}>
        {businesses.map((biz: any) => (
          <BusinessCard
            key={biz.id}
            business={biz}
            style={styles.card}
            onPress={() => navigation.navigate('ExploreTab', { screen: 'BusinessDetail', params: { id: biz.id } })}
          />
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: layout.screenPaddingH },
  title: { ...typography.h3, color: colors.foreground, flex: 1, marginHorizontal: 8 },
  desc: { ...typography.bodyMD, color: colors.muted, paddingHorizontal: layout.screenPaddingH, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: layout.screenPaddingH - 4, paddingBottom: layout.tabBarHeight + 16 },
  card: { width: '50%', padding: 4 },
})
