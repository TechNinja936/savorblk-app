import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '../../lib/supabase'
import { Badge } from '../../components/ui/Badge'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { layout, spacing, radius } from '../../theme/spacing'
import { formatRelativeTime } from '../../utils/formatters'

export function ArticleDetailScreen() {
  const navigation = useNavigation<any>()
  const { articleId } = useRoute<any>().params

  const { data: article } = useQuery({
    queryKey: ['article', articleId],
    queryFn: async () => {
      const { data } = await supabase
        .from('news_articles')
        .select('*')
        .eq('id', articleId)
        .single()
      return data
    },
  })

  const handleOpenSource = () => {
    if (article?.external_url) Linking.openURL(article.external_url)
  }

  if (!article) return null

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.navBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        {article.external_url && (
          <TouchableOpacity style={styles.iconBtn} onPress={handleOpenSource}>
            <Ionicons name="open-outline" size={22} color={colors.foreground} />
          </TouchableOpacity>
        )}
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        {article.cover_image_url && (
          <View style={styles.heroWrap}>
            <Image
              source={{ uri: article.cover_image_url }}
              style={styles.heroImage}
              contentFit="cover"
            />
            <LinearGradient
              colors={['transparent', colors.background]}
              style={styles.heroGradient}
            />
          </View>
        )}

        <View style={styles.content}>
          {/* Tags */}
          <View style={styles.tags}>
            {article.category && <Badge label={article.category} variant="primary" />}
            {article.featured && <Badge label="Featured" variant="outline" />}
          </View>

          {/* Title */}
          <Text style={styles.title}>{article.title}</Text>

          {/* Meta */}
          <View style={styles.meta}>
            {article.author && (
              <Text style={styles.author}>By {article.author}</Text>
            )}
            {article.published_at && (
              <Text style={styles.date}>{formatRelativeTime(article.published_at)}</Text>
            )}
            {article.read_time_minutes && (
              <Text style={styles.readTime}>{article.read_time_minutes} min read</Text>
            )}
          </View>

          {/* Excerpt */}
          {article.excerpt && (
            <Text style={styles.excerpt}>{article.excerpt}</Text>
          )}

          {/* Body content */}
          {article.body && (
            <Text style={styles.body}>{article.body}</Text>
          )}

          {/* Read full article CTA */}
          {article.external_url && (
            <TouchableOpacity style={styles.readMoreBtn} onPress={handleOpenSource}>
              <Text style={styles.readMoreText}>Read Full Article</Text>
              <Ionicons name="open-outline" size={16} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  navBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingH,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center',
  },
  heroWrap: { height: 280 },
  heroImage: { width: '100%', height: '100%' },
  heroGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 120 },
  content: { padding: layout.screenPaddingH, gap: 16, paddingBottom: spacing[12] },
  tags: { flexDirection: 'row', gap: 8 },
  title: { ...typography.displayMD, color: colors.foreground, lineHeight: 38 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  author: { ...typography.labelSM, color: colors.primary },
  date: { ...typography.caption, color: colors.muted },
  readTime: { ...typography.caption, color: colors.muted },
  excerpt: { ...typography.bodyLG, color: 'rgba(242,242,242,0.8)', lineHeight: 28, fontStyle: 'italic' },
  body: { ...typography.bodyMD, color: colors.foreground, lineHeight: 26 },
  readMoreBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: colors.primary, borderRadius: radius.lg,
    paddingHorizontal: 20, paddingVertical: 14, justifyContent: 'center',
    marginTop: 8,
  },
  readMoreText: { ...typography.buttonMD, color: colors.primary },
})
