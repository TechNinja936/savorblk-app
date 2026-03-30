import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, Linking,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { FlashList } from '@shopify/flash-list'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '../../lib/supabase'
import { SkeletonLoader } from '../../components/ui/SkeletonLoader'
import { Badge } from '../../components/ui/Badge'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { layout, spacing, radius } from '../../theme/spacing'

const CATEGORIES = ['All', 'Food Culture', 'HBCU', 'Business', 'Events', 'Travel', 'Community']

export function ArticlesScreen() {
  const navigation = useNavigation<any>()
  const [activeCategory, setActiveCategory] = useState('All')

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['articles', activeCategory],
    queryFn: async () => {
      let query = supabase
        .from('news_articles')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false })

      if (activeCategory !== 'All') {
        query = query.eq('category', activeCategory)
      }

      const { data } = await query.limit(30)
      return data || []
    },
  })

  const featuredArticle = articles[0]
  const rest = articles.slice(1)

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Stories & News</Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>

      <FlashList
        data={isLoading ? [] : rest}
        estimatedItemSize={120}
        ListHeaderComponent={
          <>
            {/* Category filter */}
            <FlashList
              data={CATEGORIES}
              horizontal
              estimatedItemSize={80}
              contentContainerStyle={styles.catRow}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item: cat }) => (
                <TouchableOpacity
                  style={[styles.catPill, activeCategory === cat && styles.activeCatPill]}
                  onPress={() => setActiveCategory(cat)}
                >
                  <Text style={[styles.catText, activeCategory === cat && styles.activeCatText]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              )}
            />

            {/* Featured article hero */}
            {!isLoading && featuredArticle && (
              <FeaturedArticle article={featuredArticle} />
            )}

            {isLoading && (
              <View style={{ padding: layout.screenPaddingH, gap: 16 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonLoader.BusinessCard key={i} />
                ))}
              </View>
            )}
          </>
        }
        renderItem={({ item: article }) => (
          <ArticleRow article={article} />
        )}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ paddingBottom: spacing[12] }}
      />
    </View>
  )
}

function FeaturedArticle({ article }: { article: any }) {
  const handlePress = () => {
    if (article.external_url) Linking.openURL(article.external_url)
  }

  return (
    <TouchableOpacity style={styles.featured} onPress={handlePress} activeOpacity={0.9}>
      <Image
        source={{ uri: article.cover_image_url }}
        style={styles.featuredImage}
        contentFit="cover"
        placeholder={{ blurhash: 'LGF5]+Yk^6#M@-5c,1Ex@@or[j6O' }}
      />
      <LinearGradient
        colors={['transparent', 'rgba(10,10,10,0.85)', colors.background]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.featuredContent}>
        <View style={styles.featuredTags}>
          <Badge label="Featured" variant="primary" />
          {article.category && <Badge label={article.category} variant="outline" />}
        </View>
        <Text style={styles.featuredTitle} numberOfLines={3}>{article.title}</Text>
        {article.excerpt && (
          <Text style={styles.featuredExcerpt} numberOfLines={2}>{article.excerpt}</Text>
        )}
        <ArticleMeta article={article} />
      </View>
    </TouchableOpacity>
  )
}

function ArticleRow({ article }: { article: any }) {
  const handlePress = () => {
    if (article.external_url) Linking.openURL(article.external_url)
  }

  return (
    <TouchableOpacity style={styles.articleRow} onPress={handlePress} activeOpacity={0.85}>
      <Image
        source={{ uri: article.cover_image_url }}
        style={styles.articleThumb}
        contentFit="cover"
        placeholder={{ blurhash: 'LGF5]+Yk^6#M@-5c,1Ex@@or[j6O' }}
      />
      <View style={styles.articleInfo}>
        {article.category && (
          <Text style={styles.articleCategory}>{article.category.toUpperCase()}</Text>
        )}
        <Text style={styles.articleTitle} numberOfLines={2}>{article.title}</Text>
        <ArticleMeta article={article} />
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.muted} />
    </TouchableOpacity>
  )
}

function ArticleMeta({ article }: { article: any }) {
  const date = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <View style={styles.metaRow}>
      {article.author && <Text style={styles.metaText}>{article.author}</Text>}
      {article.author && date && <Text style={styles.metaDot}>·</Text>}
      {date && <Text style={styles.metaText}>{date}</Text>}
      {article.read_time_minutes && (
        <>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{article.read_time_minutes} min read</Text>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingH, paddingVertical: 12,
  },
  headerTitle: { ...typography.h3, color: colors.foreground },
  catRow: { paddingHorizontal: layout.screenPaddingH, paddingVertical: spacing[3], gap: 8 },
  catPill: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.full,
    backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border,
  },
  activeCatPill: { backgroundColor: colors.primary, borderColor: colors.primary },
  catText: { ...typography.labelSM, color: colors.muted },
  activeCatText: { color: '#000' },

  // Featured
  featured: { marginHorizontal: layout.screenPaddingH, marginBottom: spacing[5], borderRadius: radius.xl, overflow: 'hidden', height: 360 },
  featuredImage: { ...StyleSheet.absoluteFillObject },
  featuredContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, gap: 10 },
  featuredTags: { flexDirection: 'row', gap: 8 },
  featuredTitle: { ...typography.h2, color: colors.foreground, lineHeight: 32 },
  featuredExcerpt: { ...typography.bodyMD, color: 'rgba(242,242,242,0.75)' },

  // Article row
  articleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: layout.screenPaddingH, paddingVertical: spacing[3],
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  articleThumb: { width: 80, height: 80, borderRadius: radius.md },
  articleInfo: { flex: 1, gap: 4 },
  articleCategory: { ...typography.caption, color: colors.primary, letterSpacing: 1 },
  articleTitle: { ...typography.labelMD, color: colors.foreground, lineHeight: 20 },

  // Meta
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  metaText: { ...typography.caption, color: colors.muted },
  metaDot: { ...typography.caption, color: colors.muted },
})
