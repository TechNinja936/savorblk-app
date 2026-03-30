import { supabase } from '../lib/supabase'
import type { BusinessEvent, AnnualEvent } from '../types/database.types'

export const eventService = {
  // Business flyer events
  async getTrending(limit = 20): Promise<BusinessEvent[]> {
    const { data, error } = await supabase
      .from('business_events')
      .select(`
        id, title, flyer_url, event_date, promoted, promotion_expires_at,
        businesses(id, name, city, neighborhood)
      `)
      .order('promoted', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return (data ?? []) as any
  },

  async getByBusiness(businessId: string): Promise<BusinessEvent[]> {
    const { data, error } = await supabase
      .from('business_events')
      .select('*')
      .eq('business_id', businessId)
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true })
    if (error) throw error
    return data ?? []
  },

  async getByCity(city: string): Promise<BusinessEvent[]> {
    const { data, error } = await supabase
      .from('business_events')
      .select(`
        id, title, flyer_url, event_date, promoted,
        businesses!inner(id, name, city, neighborhood)
      `)
      .eq('businesses.city', city)
      .order('event_date', { ascending: true })
      .limit(30)
    if (error) throw error
    return (data ?? []) as any
  },

  // Annual / Signature events
  async getSignatureEvents(): Promise<AnnualEvent[]> {
    const { data, error } = await supabase
      .from('annual_city_events')
      .select('*')
      .neq('category', 'hbcu_event')
      .order('featured', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async getSignatureEventById(id: string): Promise<AnnualEvent> {
    const { data, error } = await supabase
      .from('annual_city_events')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async getHBCUHomecomings(): Promise<AnnualEvent[]> {
    const { data, error } = await supabase
      .from('annual_city_events')
      .select('*')
      .eq('category', 'hbcu_event')
      .order('name', { ascending: true })
    if (error) throw error
    return data ?? []
  },

  async getParticipants(eventId: string) {
    const { data, error } = await supabase
      .from('annual_event_participants')
      .select('businesses(*)')
      .eq('annual_event_id', eventId)
    if (error) throw error
    return data?.map((d: any) => d.businesses) ?? []
  },

  // RSVPs
  async getRSVPCount(eventId: string): Promise<number> {
    const { count } = await supabase
      .from('event_rsvps')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId)
    return count ?? 0
  },

  async getUserRSVP(eventId: string, userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('event_rsvps')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle()
    return !!data
  },

  async toggleRSVP(eventId: string, userId: string, isRSVPd: boolean) {
    if (isRSVPd) {
      await supabase
        .from('event_rsvps')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId)
    } else {
      await supabase.from('event_rsvps').insert({ event_id: eventId, user_id: userId })
    }
  },

  // Sort annual events by proximity to current month
  sortByUpcomingSeason(events: AnnualEvent[]): AnnualEvent[] {
    const monthAbbrevs = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
    const currentMonth = new Date().getMonth()

    return [...events].sort((a, b) => {
      const getMonthIndex = (season: string | null): number => {
        if (!season) return 12
        const lower = season.toLowerCase()
        const idx = monthAbbrevs.findIndex((m) => lower.includes(m))
        return idx === -1 ? 12 : idx
      }

      const aMonth = getMonthIndex(a.typical_season)
      const bMonth = getMonthIndex(b.typical_season)

      const aDiff = (aMonth - currentMonth + 12) % 12
      const bDiff = (bMonth - currentMonth + 12) % 12
      return aDiff - bDiff
    })
  },
}
