import React from 'react'
import { View, Text, StyleSheet, FlatList, Image } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { businessService } from '../../../services/businessService'
import { Skeleton } from '../../../components/ui/SkeletonLoader'
import { colors } from '../../../theme/colors'
import { typography } from '../../../theme/typography'
import { radius, layout } from '../../../theme/spacing'

export function MenuTab({ businessId }: { businessId: string }) {
  const { data: items, isLoading } = useQuery({
    queryKey: ['menu', businessId],
    queryFn: () => businessService.getMenu(businessId),
  })

  if (isLoading) {
    return (
      <View style={styles.container}>
        {Array.from({ length: 4 }).map((_, i) => (
          <View key={i} style={styles.skeletonRow}>
            <View style={{ flex: 1, gap: 8 }}>
              <Skeleton width="60%" height={14} />
              <Skeleton width="80%" height={12} />
            </View>
            <Skeleton width={60} height={60} borderRadius={radius.md} />
          </View>
        ))}
      </View>
    )
  }

  if (!items?.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No menu items added yet.</Text>
      </View>
    )
  }

  // Group by category
  const grouped = items.reduce<Record<string, typeof items>>((acc, item) => {
    const cat = item.category ?? 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  return (
    <View style={styles.container}>
      {Object.entries(grouped).map(([category, catItems]) => (
        <View key={category}>
          <Text style={styles.categoryHeader}>{category}</Text>
          {catItems.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.description && (
                  <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
                )}
                {item.price_cents && (
                  <Text style={styles.itemPrice}>
                    ${(item.price_cents / 100).toFixed(2)}
                  </Text>
                )}
              </View>
              {item.photo_url && (
                <Image source={{ uri: item.photo_url }} style={styles.itemPhoto} />
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: layout.screenPaddingH, paddingTop: 16 },
  categoryHeader: {
    ...typography.h4,
    color: colors.primary,
    marginBottom: 12,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 6,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  itemInfo: { flex: 1 },
  itemName: { ...typography.labelLG, color: colors.foreground },
  itemDesc: { ...typography.bodySM, color: colors.muted, marginTop: 3 },
  itemPrice: { ...typography.labelMD, color: colors.primary, marginTop: 5 },
  itemPhoto: { width: 64, height: 64, borderRadius: radius.md, backgroundColor: colors.secondary },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  empty: { padding: layout.screenPaddingH, alignItems: 'center' },
  emptyText: { ...typography.bodyMD, color: colors.muted },
})
