import { supabase } from '../lib/supabase'
import type { Business } from '../types/database.types'

export interface BusinessFilters {
  city?: string
  category?: string
  vibe?: string
  neighborhood?: string
  search?: string
  limit?: number
  offset?: number
}

const BUSINESS_SELECT = `
  id, name, category, city, neighborhood, address,
  cover_photo_url, photo_urls, price_range, rating,
  review_count, follower_count, verified, featured,
  top_pick, active, google_place_id, created_at
`

export const businessService = {
  async getAll(filters: BusinessFilters = {}): Promise<Business[]> {
    let query = supabase
      .from('businesses')
      .select(BUSINESS_SELECT)
      .eq('active', true)
      .order('cover_photo_url', { ascending: false, nullsFirst: false })
      .limit(filters.limit ?? 100)

    if (filters.city)     query = query.eq('city', filters.city)
    if (filters.category) query = query.eq('category', filters.category)
    if (filters.neighborhood) query = query.eq('neighborhood', filters.neighborhood)
    if (filters.search)   query = query.ilike('name', `%${filters.search}%`)
    if (filters.offset)   query = query.range(
      filters.offset,
      filters.offset + (filters.limit ?? 100) - 1
    )

    const { data, error } = await query
    if (error) throw error
    return data ?? []
  },

  async getById(id: string) {
    const [bizResult, tagsResult, checkinResult] = await Promise.all([
      supabase.from('businesses').select('*').eq('id', id).single(),
      supabase.from('business_tags').select('tag').eq('business_id', id),
      supabase
        .from('business_checkins')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', id),
    ])

    if (bizResult.error) throw bizResult.error
    return {
      ...bizResult.data,
      tags: tagsResult.data?.map((t) => t.tag) ?? [],
      checkInCount: checkinResult.count ?? 0,
    }
  },

  async getByCity(city: string): Promise<Business[]> {
    return businessService.getAll({ city, limit: 200 })
  },

  async getNewAndNotable(): Promise<Business[]> {
    const { data, error } = await supabase
      .from('businesses')
      .select(BUSINESS_SELECT)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(20)
    if (error) throw error
    // Real images first
    return (data ?? []).sort((a, b) =>
      a.cover_photo_url && !b.cover_photo_url ? -1 :
      !a.cover_photo_url && b.cover_photo_url ? 1 : 0
    )
  },

  async getFeatured(city?: string): Promise<Business[]> {
    let query = supabase
      .from('businesses')
      .select(BUSINESS_SELECT)
      .eq('active', true)
      .eq('featured', true)
      .limit(10)
    if (city) query = query.eq('city', city)
    const { data, error } = await query
    if (error) throw error
    return data ?? []
  },

  async getByVibe(vibe: string, city?: string): Promise<Business[]> {
    const { data: taggedIds, error: tagError } = await supabase
      .from('business_tags')
      .select('business_id')
      .eq('tag', vibe.toLowerCase())

    if (tagError || !taggedIds?.length) return []
    const ids = taggedIds.map((t) => t.business_id)

    let query = supabase
      .from('businesses')
      .select(BUSINESS_SELECT)
      .eq('active', true)
      .in('id', ids)
      .limit(50)
    if (city) query = query.eq('city', city)

    const { data, error } = await query
    if (error) throw error
    return data ?? []
  },

  async search(query: string, limit = 15): Promise<Business[]> {
    const { data, error } = await supabase
      .from('businesses')
      .select('id, name, category, city, cover_photo_url, verified')
      .eq('active', true)
      .ilike('name', `%${query}%`)
      .limit(limit)
    if (error) throw error
    return data ?? []
  },

  async getMenu(businessId: string) {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('business_id', businessId)
      .order('sort_order', { ascending: true })
    if (error) throw error
    return data ?? []
  },

  async getReviews(businessId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id, rating, content, created_at,
        user_profiles(id, username, avatar_url, verified_creator)
      `)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(30)
    if (error) throw error
    return data ?? []
  },

  async getPhotos(businessId: string) {
    const { data, error } = await supabase
      .from('user_posts')
      .select('id, photo_url, caption, created_at, user_profiles(username, avatar_url)')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(24)
    if (error) throw error
    return data ?? []
  },

  async submitReview(businessId: string, userId: string, rating: number, content: string) {
    const { error } = await supabase.from('reviews').upsert({
      business_id: businessId,
      user_id: userId,
      rating,
      content,
    }, { onConflict: 'user_id,business_id' })
    if (error) throw error
  },

  async getBusinessesForCity(city: string) {
    const [businesses, stats] = await Promise.all([
      businessService.getByCity(city),
      supabase
        .from('businesses')
        .select('neighborhood')
        .eq('city', city)
        .eq('active', true)
        .not('neighborhood', 'is', null),
    ])
    const neighborhoods = [...new Set(stats.data?.map((b) => b.neighborhood).filter(Boolean))]
    return { businesses, neighborhoods }
  },
}
