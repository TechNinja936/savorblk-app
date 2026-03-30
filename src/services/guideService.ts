import { supabase } from '../lib/supabase'
import type { Guide } from '../types/database.types'

export const guideService = {
  async getFeatured(limit = 6): Promise<Guide[]> {
    const { data, error } = await supabase
      .from('guides')
      .select('id, title, description, category, cover_image_url, cities, tags')
      .eq('published', true)
      .limit(limit)
    if (error) throw error
    return data ?? []
  },

  async getAll(): Promise<Guide[]> {
    const { data, error } = await supabase
      .from('guides')
      .select('id, title, description, category, cover_image_url, cities, tags')
      .eq('published', true)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async getById(id: string): Promise<Guide> {
    const { data, error } = await supabase
      .from('guides')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async getByHBCU(hbcuId: string): Promise<Guide[]> {
    const { data, error } = await supabase
      .from('guides')
      .select('id, title, description, category, cover_image_url')
      .eq('hbcu_id', hbcuId)
      .eq('published', true)
    if (error) throw error
    return data ?? []
  },
}
