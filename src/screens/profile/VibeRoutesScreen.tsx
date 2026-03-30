import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { GoldButton } from '../../components/ui/GoldButton'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { layout } from '../../theme/spacing'

export function VibeRoutesScreen() {
  const navigation = useNavigation<any>()
  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.title}>Vibe Routes</Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>
      <View style={styles.empty}>
        <Ionicons name="map-outline" size={56} color={colors.muted} />
        <Text style={styles.emptyTitle}>No Vibe Routes yet</Text>
        <Text style={styles.emptySub}>Let AI build you the perfect day out</Text>
        <GoldButton label="Build a Route" onPress={() => navigation.navigate('PlaylistBuilder')} style={{ marginTop: 16 }} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: layout.screenPaddingH },
  title: { ...typography.h2, color: colors.foreground },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyTitle: { ...typography.h3, color: colors.muted },
  emptySub: { ...typography.bodyMD, color: colors.muted, textAlign: 'center' },
})
