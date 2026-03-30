import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PlaylistRequest {
  city: string
  dates?: string
  hotel?: string
  vibes: string[]
  groupSize?: string
  dietary?: string
  userId?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body: PlaylistRequest = await req.json()
    const { city, dates, hotel, vibes, groupSize, dietary } = body

    // Fetch real businesses from Supabase for context
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const { data: businesses } = await supabase
      .from('businesses')
      .select('id, name, category, neighborhood, price_range, description, tags')
      .eq('city_slug', city.toLowerCase().replace(/\s+/g, '-'))
      .eq('is_active', true)
      .limit(50)

    const businessContext = businesses
      ? businesses.map((b: any) =>
          `- ${b.name} (${b.category}, ${b.neighborhood || 'N/A'}, ${'$'.repeat(b.price_range || 2)}) ${b.description ? '– ' + b.description.slice(0, 100) : ''}`
        ).join('\n')
      : 'No businesses found for this city yet.'

    const systemPrompt = `You are the SavorBLK AI Concierge — an expert guide for Black-owned restaurants, bars, cafes, and cultural spots across the US. You create personalized, deeply curated itineraries that feel like advice from a local friend who knows the best of Black culture and cuisine.

Your itineraries should:
- Feature ONLY Black-owned establishments
- Feel premium, personal, and culturally grounded
- Include specific times and flow naturally as a day/trip
- Highlight cultural context, not just the food
- Be honest about price range and vibe

Available spots in ${city}:
${businessContext}`

    const userPrompt = `Create a SavorBLK vibe route for ${city}${dates ? ` during ${dates}` : ''}.
Vibes: ${vibes.join(', ')}
${hotel ? `Staying near: ${hotel}` : ''}
${groupSize ? `Group size: ${groupSize}` : ''}
${dietary ? `Dietary notes: ${dietary}` : ''}

Return a JSON itinerary with this structure:
{
  "title": "Catchy route title",
  "tagline": "One-line description",
  "city": "${city}",
  "estimated_duration": "e.g. Full Day, Weekend",
  "stops": [
    {
      "time": "e.g. 10:00 AM",
      "name": "Business name",
      "category": "e.g. Brunch",
      "neighborhood": "e.g. Sweet Auburn",
      "why": "Why this spot fits your vibe (2 sentences)",
      "must_try": "Specific dish or drink to order",
      "tip": "Insider tip (optional)"
    }
  ],
  "closing_note": "A 2-3 sentence outro about the experience"
}`

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json',
          },
        }),
      }
    )

    if (!geminiRes.ok) {
      const err = await geminiRes.text()
      console.error('Gemini error:', err)
      throw new Error('AI service temporarily unavailable')
    }

    const geminiData = await geminiRes.json()
    const raw = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!raw) throw new Error('No response from AI')

    let itinerary
    try {
      itinerary = JSON.parse(raw)
    } catch {
      throw new Error('AI returned invalid format')
    }

    // Optionally save to itineraries table if userId provided
    if (body.userId && itinerary) {
      await supabase.from('itineraries').insert({
        user_id: body.userId,
        title: itinerary.title,
        city: city,
        vibes,
        stops: itinerary.stops,
        ai_generated: true,
      })
    }

    return new Response(JSON.stringify({ itinerary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('build-playlist error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
