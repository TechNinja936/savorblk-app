// Auto-generated from Supabase schema — run `npm run gen-types` to refresh
// Manual stub matching the SavorBLK spec until Supabase CLI is connected

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string
          name: string
          category: string | null
          city: string | null
          neighborhood: string | null
          address: string | null
          phone: string | null
          hours: string | null
          description: string | null
          cover_photo_url: string | null
          photo_urls: string[] | null
          website_url: string | null
          instagram_url: string | null
          facebook_url: string | null
          twitter_url: string | null
          tiktok_url: string | null
          yelp_url: string | null
          doordash_url: string | null
          ubereats_url: string | null
          opentable_url: string | null
          grubhub_url: string | null
          menu_url: string | null
          price_range: string | null
          rating: number | null
          review_count: number | null
          follower_count: number | null
          google_place_id: string | null
          verified: boolean
          featured: boolean
          top_pick: boolean
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['businesses']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['businesses']['Insert']>
      }
      user_profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          home_city: string | null
          user_type: 'foodie' | 'influencer' | 'food_blogger' | 'critic' | 'business_owner' | 'regular' | null
          verified_creator: boolean
          creator_city: string | null
          creator_specialties: string[] | null
          instagram_url: string | null
          twitter_url: string | null
          tiktok_url: string | null
          facebook_url: string | null
          youtube_url: string | null
          website_url: string | null
          follower_count: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: 'admin' | 'user' | 'owner'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_roles']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['user_roles']['Insert']>
      }
      city_profiles: {
        Row: {
          slug: string
          name: string
          description: string | null
          skyline_url: string | null
        }
        Insert: Database['public']['Tables']['city_profiles']['Row']
        Update: Partial<Database['public']['Tables']['city_profiles']['Row']>
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          business_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['favorites']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['favorites']['Insert']>
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          business_id: string
          rating: number
          content: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>
      }
      business_checkins: {
        Row: {
          id: string
          user_id: string
          business_id: string
          checkin_date: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['business_checkins']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['business_checkins']['Insert']>
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['follows']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['follows']['Insert']>
      }
      user_posts: {
        Row: {
          id: string
          user_id: string
          business_id: string | null
          photo_url: string
          caption: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_posts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['user_posts']['Insert']>
      }
      business_events: {
        Row: {
          id: string
          title: string
          flyer_url: string | null
          business_id: string
          event_date: string | null
          promoted: boolean
          promotion_expires_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['business_events']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['business_events']['Insert']>
      }
      event_rsvps: {
        Row: {
          id: string
          user_id: string
          event_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['event_rsvps']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['event_rsvps']['Insert']>
      }
      annual_city_events: {
        Row: {
          id: string
          name: string
          city: string | null
          state: string | null
          category: 'music_festival' | 'rodeo' | 'food_festival' | 'cultural_festival' | 'parade' | 'holiday_event' | 'hbcu_event' | 'sports_weekend' | 'other' | null
          typical_season: string | null
          cover_image_url: string | null
          description: string | null
          long_description: string | null
          highlights: string[] | null
          tags: string[] | null
          website_url: string | null
          ticket_url: string | null
          venue_location: string | null
          attendance: number | null
          founded_year: number | null
          featured: boolean
          is_recurring: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['annual_city_events']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['annual_city_events']['Insert']>
      }
      hbcus: {
        Row: {
          id: string
          name: string
          slug: string
          city: string | null
          state: string | null
          mascot: string | null
          founding_year: number | null
          enrollment: number | null
          school_colors: Json | null
          campus_photo_url: string | null
          logo_url: string | null
          campus_address: string | null
          campus_vibe: string | null
          description: string | null
          website_url: string | null
          nearby_neighborhoods: string[] | null
          nearby_zip_codes: string[] | null
          homecoming_date: string | null
          homecoming_label: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['hbcus']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['hbcus']['Insert']>
      }
      hbcu_food_spots: {
        Row: {
          id: string
          hbcu_id: string
          business_id: string
          category: 'popular' | 'game-day' | 'late-night' | 'study-spots' | 'brunch' | 'date-night'
          sort_order: number
        }
        Insert: Omit<Database['public']['Tables']['hbcu_food_spots']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['hbcu_food_spots']['Insert']>
      }
      guides: {
        Row: {
          id: string
          title: string
          description: string | null
          content: string | null
          category: string | null
          cover_image_url: string | null
          cities: string[] | null
          tags: string[] | null
          featured_business_ids: string[] | null
          hbcu_id: string | null
          published: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['guides']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['guides']['Insert']>
      }
      news_articles: {
        Row: {
          id: string
          title: string
          url: string
          source: string | null
          excerpt: string | null
          image: string | null
          category: string | null
          city: string | null
          visible: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['news_articles']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['news_articles']['Insert']>
      }
      itineraries: {
        Row: {
          id: string
          title: string
          city: string | null
          description: string | null
          vibe: string | null
          stops: Json | null
          start_date: string | null
          end_date: string | null
          trip_date: string | null
          cover_image_url: string | null
          tags: string[] | null
          featured: boolean
          published: boolean
          collaborator_ids: string[] | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['itineraries']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['itineraries']['Insert']>
      }
      curated_lists: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string | null
          city: string | null
          share_code: string
          edit_token: string
          creator_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['curated_lists']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['curated_lists']['Insert']>
      }
      curated_list_items: {
        Row: {
          id: string
          list_id: string
          business_id: string
          sort_order: number
        }
        Insert: Omit<Database['public']['Tables']['curated_list_items']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['curated_list_items']['Insert']>
      }
      business_tags: {
        Row: {
          id: string
          business_id: string
          tag: string
        }
        Insert: Omit<Database['public']['Tables']['business_tags']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['business_tags']['Insert']>
      }
      menu_items: {
        Row: {
          id: string
          business_id: string
          name: string
          description: string | null
          price_cents: number | null
          photo_url: string | null
          category: string | null
          sort_order: number
        }
        Insert: Omit<Database['public']['Tables']['menu_items']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['menu_items']['Insert']>
      }
      business_claims: {
        Row: {
          id: string
          user_id: string
          business_id: string
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['business_claims']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['business_claims']['Insert']>
      }
      newsletter_subscriptions: {
        Row: {
          id: string
          email: string
          city: string | null
          user_id: string | null
          subscribed: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['newsletter_subscriptions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['newsletter_subscriptions']['Insert']>
      }
      creator_applications: {
        Row: {
          id: string
          user_id: string
          status: 'pending' | 'approved' | 'rejected'
          bio: string | null
          follower_count: number | null
          platform_links: Json | null
          sample_content_urls: string[] | null
          specialties: string[] | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['creator_applications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['creator_applications']['Insert']>
      }
      historic_neighborhoods: {
        Row: {
          id: string
          city: string
          neighborhood: string
          district_name: string | null
          description: string | null
        }
        Insert: Omit<Database['public']['Tables']['historic_neighborhoods']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['historic_neighborhoods']['Insert']>
      }
    }
    Views: {}
    Functions: {}
    Enums: {
      user_type: 'foodie' | 'influencer' | 'food_blogger' | 'critic' | 'business_owner' | 'regular'
      user_role: 'admin' | 'user' | 'owner'
      claim_status: 'pending' | 'approved' | 'rejected'
      hbcu_food_category: 'popular' | 'game-day' | 'late-night' | 'study-spots' | 'brunch' | 'date-night'
      annual_event_category: 'music_festival' | 'rodeo' | 'food_festival' | 'cultural_festival' | 'parade' | 'holiday_event' | 'hbcu_event' | 'sports_weekend' | 'other'
    }
  }
}

// Convenience type aliases
export type Business = Database['public']['Tables']['businesses']['Row']
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type UserRole = Database['public']['Tables']['user_roles']['Row']
export type BusinessEvent = Database['public']['Tables']['business_events']['Row']
export type AnnualEvent = Database['public']['Tables']['annual_city_events']['Row']
export type HBCU = Database['public']['Tables']['hbcus']['Row']
export type HBCUFoodSpot = Database['public']['Tables']['hbcu_food_spots']['Row']
export type Guide = Database['public']['Tables']['guides']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type Favorite = Database['public']['Tables']['favorites']['Row']
export type Itinerary = Database['public']['Tables']['itineraries']['Row']
export type CuratedList = Database['public']['Tables']['curated_lists']['Row']
export type MenuItem = Database['public']['Tables']['menu_items']['Row']
export type NewsArticle = Database['public']['Tables']['news_articles']['Row']
