import { supabase } from '../lib/supabase'
import type { HBCU } from '../types/database.types'

export const hbcuService = {
  async getAll(): Promise<HBCU[]> {
    const { data, error } = await supabase
      .from('hbcus')
      .select('*')
      .order('name', { ascending: true })
    if (error) throw error
    return data ?? []
  },

  async getBySlug(slug: string): Promise<HBCU> {
    const { data, error } = await supabase
      .from('hbcus')
      .select('*')
      .eq('slug', slug)
      .single()
    if (error) throw error
    return data
  },

  async getByState(state: string): Promise<HBCU[]> {
    const { data, error } = await supabase
      .from('hbcus')
      .select('*')
      .eq('state', state)
      .order('name', { ascending: true })
    if (error) throw error
    return data ?? []
  },

  async getByCity(city: string): Promise<HBCU[]> {
    const { data, error } = await supabase
      .from('hbcus')
      .select('id, name, slug, city, state, mascot, campus_photo_url, logo_url, school_colors, campus_vibe')
      .eq('city', city)
    if (error) throw error
    return data ?? []
  },

  async getFoodSpots(hbcuId: string) {
    const { data, error } = await supabase
      .from('hbcu_food_spots')
      .select(`
        id, category, sort_order,
        businesses(
          id, name, category, city, neighborhood,
          cover_photo_url, rating, review_count, verified, price_range
        )
      `)
      .eq('hbcu_id', hbcuId)
      .order('sort_order', { ascending: true })
    if (error) throw error
    return data ?? []
  },

  groupFoodSpotsByCategory(spots: Awaited<ReturnType<typeof hbcuService.getFoodSpots>>) {
    type Category = 'popular' | 'game-day' | 'late-night' | 'study-spots' | 'brunch' | 'date-night'
    const labels: Record<Category, string> = {
      'popular':     'Popular Picks',
      'game-day':    'Game Day Grub',
      'late-night':  'Late Night Eats',
      'study-spots': 'Study Spots',
      'brunch':      'Brunch Vibes',
      'date-night':  'Date Night',
    }
    const grouped: Record<string, { label: string; businesses: any[] }> = {}
    for (const spot of spots) {
      const cat = spot.category
      if (!grouped[cat]) {
        grouped[cat] = { label: labels[cat as Category] ?? cat, businesses: [] }
      }
      if (spot.businesses) {
        grouped[cat].businesses.push(spot.businesses)
      }
    }
    return grouped
  },

  getSchoolColors(hbcu: HBCU): [string, string] {
    if (!hbcu.school_colors) return [colors.primary, colors.secondary]
    const c = hbcu.school_colors as any
    return [c.primary ?? colors.primary, c.secondary ?? colors.secondary]
  },
}

// avoid circular import — inline colors here
const colors = { primary: '#c9990a', secondary: '#1f1f1f' }
