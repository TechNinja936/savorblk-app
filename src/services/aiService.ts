import { supabase } from '../lib/supabase'

export interface PlaylistRequest {
  city: string
  startDate: string
  endDate: string
  hotelName?: string
  zip?: string
  vibes: string[]
  groupSize: number
  dietaryNeeds?: string
}

export interface ItineraryStop {
  businessId: string
  businessName: string
  address: string
  day: number
  time: string
  notes: string
  category: string
}

export interface GeneratedItinerary {
  title: string
  description: string
  vibe: string
  city: string
  stops: ItineraryStop[]
}

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export const aiService = {
  async buildPlaylist(request: PlaylistRequest): Promise<GeneratedItinerary> {
    const { data, error } = await supabase.functions.invoke('build-playlist', {
      body: request,
    })
    if (error) throw error
    return data as GeneratedItinerary
  },

  async *streamPlaylist(request: PlaylistRequest) {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
    const url = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/build-playlist`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...request, stream: true }),
    })

    if (!response.ok) throw new Error(`AI service error: ${response.status}`)

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    while (reader) {
      const { done, value } = await reader.read()
      if (done) break
      yield decoder.decode(value, { stream: true })
    }
  },

  // Conversation state machine for chat-based itinerary building
  getNextPrompt(
    step: number,
    prevAnswer?: string
  ): { message: string; step: number; field: keyof PlaylistRequest | null } {
    const steps = [
      {
        message: "Hey! 👋 I'm your SavorBLK AI concierge. Which city are you exploring?",
        field: 'city' as const,
      },
      {
        message: `Love it! When are you visiting? Give me your start and end dates (e.g., June 14–16).`,
        field: 'startDate' as const,
      },
      {
        message: `Got it! What's your hotel name or Airbnb zip code? I'll build a route around you.`,
        field: 'hotelName' as const,
      },
      {
        message: `Perfect. What's your vibe? Pick all that apply:\n🥂 Brunch  🕯️ Date Night  🌙 Late Night  ✨ Upscale  😌 Casual`,
        field: 'vibes' as const,
      },
      {
        message: `How many people in your group?`,
        field: 'groupSize' as const,
      },
      {
        message: `Any dietary needs? (vegetarian, vegan, halal, gluten-free, etc.) Or just say "none"`,
        field: 'dietaryNeeds' as const,
      },
    ]

    const current = steps[step] ?? steps[steps.length - 1]
    return { message: current.message, step, field: current.field }
  },
}
