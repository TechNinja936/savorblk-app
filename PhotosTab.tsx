import React, { useState } from 'react'
import { View, StyleSheet, TouchableOpacity, FlatList, Modal, Text, Dimensions } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { businessService } from '../../../services/businessService'
import { Avatar } from '../../../components/ui/Avatar'
import { colors } from '../../../theme/colors'
import { typography } from '../../../theme/typography'
import { radius, layout } from '../../../theme/spacing'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const PHOTO_SIZE = (SCREEN_WIDTH - layout.screenPaddingH * 2 - 8) / 3

export function PhotosTab({ businessId }: { businessId: string }) {
  const [lightboxUri, setLightboxUri] = useState<string | null>(null)

  const { data: photos = [] } = useQuery({
    queryKey: ['photos', businessId],
    queryFn: () => businessService.getPhotos(businessId),
  })

  if (!photos.length) {
    return (
      <View style={styles.empty}>
        <Ionicons name="images-outline" size={40} color={colors.muted} />
        <Text style={styles.emptyText}>No photos yet</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {photos.map((post: any) => (
          <TouchableOpacity
            key={post.id}
            style={styles.photoWrapper}
            onPress={() => setLightboxUri(post.photo_url)}
            activeOpacity={0.85}
          >
            <Image
              source={{ uri: post.photo_url }}
              style={styles.photo}
              contentFit="cover"
              transition={200}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Lightbox */}
      <Modal visible={!!lightboxUri} transparent animationType="fade">
        <View style={styles.lightbox}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setLightboxUri(null)}
          >
            <Ionicons name="close" size={24} color={colors.foreground} />
          </TouchableOpacity>
          {lightboxUri && (
            <Image
              source={{ uri: lightboxUri }}
              style={styles.lightboxImage}
              contentFit="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { padding: layout.screenPaddingH },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  photoWrapper: { width: PHOTO_SIZE, height: PHOTO_SIZE, borderRadius: radius.sm, overflow: 'hidden' },
  photo: { width: '100%', height: '100%' },
  lightbox: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 8,
  },
  lightboxImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.2,
  },
  empty: { padding: 40, alignItems: 'center', gap: 12 },
  emptyText: { ...typography.bodyMD, color: colors.muted },
})
