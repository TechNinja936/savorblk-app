import React, { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
} from 'react-native'
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

export function ListBuilderScreen() {
  const navigation = useNavigation<any>()
  const { user } = useAuthStore()
  const { showToast } = useUIStore()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [city, setCity] = useState('')

  const { mutate: create, isPending } = useMutation({
    mutationFn: async () => {
      const shareCode = Math.random().toString(36).substring(2, 8).toUpperCase()
      const editToken = Math.random().toString(36).substring(2, 16)
      const { data, error } = await supabase
        .from('curated_lists')
        .insert({ title, description, city, share_code: shareCode, edit_token: editToken, creator_id: user?.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      showToast('List created!', 'success')
      navigation.replace('SharedList', { shareCode: data.share_code })
    },
    onError: () => showToast('Could not create list', 'error'),
  })

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.title}>Create a List</Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.field}>
          <Text style={styles.label}>List Name *</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle}
            placeholder="e.g. Best Brunch Spots in Atlanta" placeholderTextColor={colors.muted}
            color={colors.foreground} />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput style={[styles.input, styles.multiline]} value={description}
            onChangeText={setDescription} placeholder="What's this list about?"
            placeholderTextColor={colors.muted} multiline numberOfLines={3}
            color={colors.foreground} />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>City</Text>
          <TextInput style={styles.input} value={city} onChangeText={setCity}
            placeholder="Houston, Atlanta..." placeholderTextColor={colors.muted}
            color={colors.foreground} />
        </View>
        <GoldButton
          label="Create List"
          loading={isPending}
          disabled={!title.trim()}
          onPress={() => create()}
          fullWidth
          style={{ marginTop: 16 }}
        />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: layout.screenPaddingH, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { ...typography.h3, color: colors.foreground },
  body: { padding: layout.screenPaddingH, gap: 16 },
  field: { gap: 6 },
  label: { ...typography.labelSM, color: colors.muted },
  input: { ...typography.bodyMD, backgroundColor: colors.secondary, borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: colors.border },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
})
