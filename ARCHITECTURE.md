# SavorBLK Mobile — Complete Architecture Document

---

## PHASE 1 — ARCHITECTURE

---

### 1.1 Tech Stack Decision

#### Frontend: React Native (Expo SDK 51+) ✅ NOT Flutter

**Justification:**
- Supabase has a mature JavaScript client (`@supabase/supabase-js`) — no bridging needed
- Existing web codebase is TypeScript/React — same team can ship mobile
- Expo EAS Build → App Store + Play Store in one pipeline
- Expo OTA updates → hotfix bugs without App Store review
- React Native Reanimated 3 matches animation quality of top apps
- Rich ecosystem: expo-image, expo-router, expo-notifications, Lottie

| Concern | Choice | Why |
|---------|--------|-----|
| Framework | React Native + Expo Managed | Fastest iOS+Android parity |
| Language | TypeScript | Type safety across 30+ tables |
| Navigation | React Navigation v6 | Industry standard, gesture-native |
| State | Zustand + React Query | Zustand for global UI state, RQ for server cache |
| Animations | Reanimated 3 + Lottie | 60fps native animations |
| Images | expo-image | Best-in-class caching + progressive loading |
| Backend | Supabase | Existing schema, Postgres RLS, Storage |
| Auth | Supabase Auth (Google + Apple + Email) | Native OAuth via expo-web-browser |
| Storage | Supabase Storage | Avatars, business-photos, event-flyers |
| Edge Functions | Supabase Edge (Deno) | AI, bulk import, newsletter |
| AI | Gemini API via Edge Function | Vibe Routes builder |
| Payments | Stripe React Native SDK | Featured placements, event promo |
| Push | Expo Notifications + Supabase webhooks | Event alerts, city updates |
| Maps | react-native-maps + expo-location | Explore map view |
| Offline | MMKV + React Query persistence | Business detail, favorites |

---

### 1.2 System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    SAVORBLK MOBILE APP                      │
│                  React Native (Expo SDK 51)                 │
└─────────────┬───────────────────────────────────────────────┘
              │
    ┌─────────▼──────────┐
    │   Navigation Layer  │
    │  React Navigation 6 │
    │  Stack + BottomTab  │
    └─────────┬──────────┘
              │
    ┌─────────▼──────────────────────────────────────────────┐
    │                   SCREEN LAYER                          │
    │  Home │ Explore │ Events │ HBCUs │ Profile │ Business  │
    └─────────┬──────────────────────────────────────────────┘
              │
    ┌─────────▼──────────┐      ┌──────────────────────────┐
    │    ZUSTAND STORES   │      │    REACT QUERY CACHE     │
    │  auth / ui / map   │      │  businesses / events /   │
    │  notifications     │      │  hbcus / guides / user   │
    └─────────┬──────────┘      └────────────┬─────────────┘
              │                               │
    ┌─────────▼───────────────────────────────▼────────────┐
    │                    API SERVICE LAYER                   │
    │   businessService │ eventService │ userService        │
    │   hbcuService     │ searchService │ aiService         │
    └─────────────────────────────┬────────────────────────┘
                                  │
              ┌───────────────────▼────────────────────────┐
              │              SUPABASE CLIENT               │
              │    Auth │ Database │ Storage │ Realtime    │
              └──────┬────────────────────┬────────────────┘
                     │                    │
          ┌──────────▼──────┐   ┌─────────▼───────────┐
          │  POSTGRES DB    │   │  SUPABASE STORAGE   │
          │  36 tables      │   │  avatars            │
          │  RLS policies   │   │  business-photos    │
          └─────────────────┘   │  event-flyers       │
                                │  guide-images       │
                                └─────────────────────┘
                     │
          ┌──────────▼──────────────────┐
          │     EDGE FUNCTIONS          │
          │  build-playlist (Gemini AI) │
          │  send-newsletter            │
          │  discover-restaurants       │
          │  enrich-business-photos     │
          │  update-news                │
          └─────────────────────────────┘
```

---

### 1.3 Data Flow

```
USER ACTION
    │
    ▼
Screen Component
    │ dispatch / mutate
    ▼
Zustand Action OR React Query Mutation
    │
    ▼
Service Layer (src/services/*)
    │ supabase.from('businesses')...
    ▼
Supabase Client
    │ HTTPS → Supabase API
    ▼
Postgres (Row-Level Security enforced)
    │
    ▼
Response → React Query cache → UI re-render
```

**Offline flow:**
```
App launch → MMKV.get('cached_home') → render stale data
           → background fetch → update cache → re-render
```

---

### 1.4 Database Mapping (Spec → Supabase Tables Used in App)

| App Feature | Primary Tables |
|-------------|---------------|
| Home Feed | businesses, business_events, annual_city_events, guides |
| Explore / Search | businesses, business_tags, city_profiles |
| Business Detail | businesses, business_tags, menu_items, reviews, business_checkins, user_posts, business_events, favorites |
| Events | business_events, event_rsvps, annual_city_events, annual_event_participants |
| HBCUs | hbcus, hbcu_food_spots, annual_city_events |
| Vibe Routes | itineraries, businesses |
| Profile | user_profiles, user_roles, favorites, business_checkins, follows, curated_lists, itineraries |
| Business Owner | businesses, menu_items, business_events, business_claims, featured_placements |
| Admin | All tables |
| Creator | creator_applications, creator_content |
| Social | follows, user_posts, reviews |
| Lists | curated_lists, curated_list_items |
| Notifications | newsletter_subscriptions + Expo push tokens |

---

## PHASE 2 — UI/UX SCREEN BREAKDOWN

---

### 2.1 Navigation Architecture

```
App
├── AuthStack (unauthenticated)
│   ├── SplashScreen
│   ├── OnboardingCarousel (3 slides, first launch)
│   ├── LoginScreen
│   ├── SignupScreen
│   ├── ForgotPasswordScreen
│   └── ResetPasswordScreen
│
└── MainTabs (authenticated + guest)
    ├── Tab: Home
    │   └── HomeStack
    │       ├── HomeScreen
    │       ├── CityScreen (/city/:slug)
    │       ├── GuideDetailScreen
    │       └── ArticleListScreen
    │
    ├── Tab: Explore
    │   └── ExploreStack
    │       ├── ExploreScreen
    │       ├── MapExploreScreen
    │       ├── BusinessDetailScreen (/business/:id)
    │       │   ├── MenuTab
    │       │   ├── ReviewsTab
    │       │   ├── EventsTab
    │       │   └── PhotosTab
    │       └── SearchResultsScreen
    │
    ├── Tab: Events
    │   └── EventsStack
    │       ├── EventsScreen
    │       ├── SignatureEventsScreen
    │       └── AnnualEventDetailScreen (/annual-events/:id)
    │
    ├── Tab: HBCUs
    │   └── HBCUStack
    │       ├── HBCUListScreen
    │       └── HBCUDetailScreen (/hbcus/:slug)
    │
    └── Tab: Profile
        └── ProfileStack
            ├── ProfileScreen
            ├── EditProfileScreen
            ├── FavoritesScreen
            ├── VibeRoutesScreen
            ├── ItineraryDetailScreen
            ├── ListBuilderScreen
            ├── SharedListScreen
            ├── PlaylistBuilderScreen (AI)
            ├── MyBusinessScreen
            ├── CreatorApplicationScreen
            └── UserPublicProfileScreen (/u/:username)
```

---

### 2.2 Screen-by-Screen Breakdown

---

#### SCREEN: HomeScreen

**Layout:** ScrollView with sticky header

```
┌─────────────────────────────────┐
│  [Logo]    SavorBLK    [🔔][👤] │  ← Blurred sticky header
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐   │
│  │   HERO (full-bleed)     │   │  ← expo-image, parallax scroll
│  │   Discover Black-Owned  │   │
│  │   Restaurants           │   │
│  │   [Explore] [List Biz]  │   │
│  └─────────────────────────┘   │
│                                 │
│  [🍳 Brunch][🌙 Late Night]...  │  ← Horizontal vibe pills
│                                 │
│  Signature Events ────────────  │
│  [Card][Card][Card] →           │  ← FlatList horizontal
│                                 │
│  Featured Cities ─────────────  │
│  [HTX][ATL][DET][NOLA]...      │  ← 2-col grid
│                                 │
│  New & Notable ───────────────  │
│  [BusinessCard][BusinessCard]→  │
│                                 │
│  Trending Events ─────────────  │
│  [FlyerCard] [FlyerCard] →     │
│                                 │
│  Guides & Stories ────────────  │
│  [GuideCard][GuideCard][Guide] │
│                                 │
│  Vibe Routes CTA ─────────────  │
└─────────────────────────────────┘
│  [🏠][🔍][📅][🎓][👤]          │  ← Bottom Tab Bar (blur)
└─────────────────────────────────┘
```

**Key components:** `HeroSection`, `VibePills`, `SignatureEventsCarousel`, `CitiesGrid`, `HorizontalBusinessList`, `EventFlyerCarousel`, `GuidesGrid`

**Animations:**
- Hero parallax on scroll (Reanimated 2 interpolate)
- Vibe pill press → scale(0.95) + haptic
- Card entrance → FadeInDown stagger

---

#### SCREEN: ExploreScreen

```
┌─────────────────────────────────┐
│  [← Back]  Explore     [🗺️Map] │
├─────────────────────────────────┤
│  ┌─────────────────────────┐   │
│  │ 🔍 Search restaurants...│   │  ← Animated SearchBar
│  └─────────────────────────┘   │
│  [Brunch][Date Night][Casual]→ │  ← Vibe filter pills
│  [All Cuisines ▼][City ▼]      │  ← Filter row
├─────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ Biz  │ │ Biz  │ │ Biz  │   │  ← 2-col grid (FlashList)
│  └──────┘ └──────┘ └──────┘   │
│  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ Biz  │ │ Biz  │ │ Biz  │   │
│  └──────┘ └──────┘ └──────┘   │
│              ...               │
└─────────────────────────────────┘
```

**Map Mode toggle** → slides up `MapExploreScreen` with business pins

---

#### SCREEN: BusinessDetailScreen

```
┌─────────────────────────────────┐
│ [← ] [⋯ share/flag/admin]       │  ← Floating over hero
│                                 │
│  ┌─────────────────────────┐   │
│  │   HERO IMAGE (fullbleed)│   │  ← Pinch-to-zoom gallery
│  │                    [📷] │   │
│  └─────────────────────────┘   │
│  ┌──┐                          │
│  │🖼️│  Business Name ✓         │  ← Avatar overlapping hero
│  └──┘  Category • $$ • Midtown │
│        ⭐ 4.6  (234) • 89 fans  │
│                                 │
│  ┌──────────────────────────┐  │
│  │ [💾 Save][📍Check In]    │  │  ← STICKY ACTION BAR
│  │ [↗️ Share][📞 Call]      │  │
│  └──────────────────────────┘  │
│                                 │
│  📍 123 Main St → (Maps link)  │
│  🕐 Mon-Fri 11am-10pm          │
│  ☎️  (713) 555-0123            │
│                                 │
│  [Good For] pills              │
│  [🥂Date Night][🍳Brunch]...   │
│                                 │
│  [Menu][Reviews][Events][Photos]│  ← Tab bar
│  ─────────────────────────────  │
│  (Tab content scrolls below)   │
└─────────────────────────────────┘
```

**Gesture:** Swipe left/right to switch tabs. Pinch hero image to expand gallery.

---

#### SCREEN: EventsScreen

```
┌─────────────────────────────────┐
│  Events & Experiences           │
│  [🔍 Search events...]          │
│  [Houston][Atlanta][All] →      │  ← City filter pills
├─────────────────────────────────┤
│  ┌───────┐  ┌───────┐           │
│  │ FLYER │  │ FLYER │           │  ← 2-col masonry
│  │ 3:4   │  │ 3:4   │           │
│  │ ratio │  │ ratio │           │
│  │[RSVP] │  │[RSVP] │           │
│  └───────┘  └───────┘           │
│  ┌───────┐  ┌───────┐           │
│  │       │  │[PROMO]│           │  ← Promoted badge
│  └───────┘  └───────┘           │
└─────────────────────────────────┘
```

Tap flyer → **full-screen lightbox** with pinch-zoom, save-to-photos, share

---

#### SCREEN: HBCUDetailScreen

```
┌─────────────────────────────────┐
│ ████████ school colors bar ████ │  ← Dynamic color from DB
│  [Campus Photo Hero]            │
│  [🎓 Logo]           [Share]   │
│  HOWARD UNIVERSITY              │
│  Washington, D.C. • Est. 1867   │
├─────────────────────────────────┤
│  [Popular][Game Day][Late Night]│  ← Category tabs
│  [Study Spots][Brunch][Date]    │
├─────────────────────────────────┤
│  BusinessCard grid for category │
└─────────────────────────────────┘
```

---

#### SCREEN: PlaylistBuilderScreen (AI Concierge)

```
┌─────────────────────────────────┐
│  🤖 SavorBLK AI Concierge       │
│  ─────────────────────────────  │
│                                 │
│  [AI bubble]: Hey! What city    │
│  are you exploring?             │
│                                 │
│  [User bubble]: Atlanta         │
│                                 │
│  [AI bubble]: Love it! What     │
│  dates are you visiting?        │
│                                 │
│         ...conversation...      │
│                                 │
│  [AI bubble]: Here's your       │
│  personalized Vibe Route! 🗺️   │
│  [Generated itinerary card]     │
│                                 │
├─────────────────────────────────┤
│  [Type a message...]   [Send ▶] │
└─────────────────────────────────┘
```

**Full screen** — no bottom nav. Typing indicator uses Lottie animation.

---

### 2.3 Key Reusable Components

| Component | Description |
|-----------|-------------|
| `BusinessCard` | 4:3 image, category/price badges, verified check, favorite button |
| `VibePills` | Horizontal ScrollView with haptic feedback on select |
| `SkeletonLoader` | Shimmer animation for loading states |
| `BlurTabBar` | Bottom tab bar with `expo-blur` |
| `GoldButton` | Primary CTA button, gold bg, press animation |
| `CheckInButton` | Animated check-in with count, once-per-day guard |
| `StarRating` | Interactive + display modes |
| `EventFlyerCard` | 3:4 aspect, lightbox on tap |
| `HBCUSchoolCard` | School colors bar, campus photo, mascot |
| `AITypingIndicator` | Lottie 3-dot typing animation |
| `ShareSheet` | Native share + deep link generation |
| `UserTierBadge` | Bronze/Silver/Gold/Platinum with icon |
| `VerifiedBadge` | Gold BadgeCheck icon |
| `PriceRange` | $ to $$$$ pills |
| `StickyActionBar` | Save + Check-in + Share + Call |
| `ImageGallery` | Horizontal scroll + pinch-zoom |
| `ReviewCard` | Star rating + user avatar + text |
| `MenuItemRow` | Name, price, photo thumbnail |
| `NotificationBadge` | Red dot with count on tab icon |
| `ToastNotification` | Animated slide-up/down feedback |

---

## PHASE 3 — CODEBASE STARTER

---

### 3.1 Folder Structure

```
savorblk-mobile/
├── app.json                     # Expo config
├── eas.json                     # EAS Build config
├── babel.config.js
├── tsconfig.json
├── .env                         # SUPABASE_URL, SUPABASE_ANON_KEY, etc.
│
├── assets/
│   ├── fonts/
│   │   ├── PlayfairDisplay-Regular.ttf
│   │   ├── PlayfairDisplay-Bold.ttf
│   │   └── DMSans-Regular.ttf
│   ├── images/
│   │   ├── logo.png
│   │   ├── logo-gold.png
│   │   └── splash.png
│   └── lottie/
│       ├── typing-indicator.json
│       ├── checkin-success.json
│       └── loading-fork.json
│
├── src/
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client init
│   │   ├── queryClient.ts       # React Query client + MMKV persister
│   │   ├── stripe.ts            # Stripe init
│   │   └── notifications.ts    # Expo push token registration
│   │
│   ├── stores/                  # Zustand global state
│   │   ├── authStore.ts         # User session, profile, role
│   │   ├── uiStore.ts           # Theme, modals, toasts
│   │   ├── locationStore.ts     # User coordinates, city detection
│   │   └── notificationStore.ts # Push notification state
│   │
│   ├── services/                # API abstraction layer
│   │   ├── businessService.ts
│   │   ├── eventService.ts
│   │   ├── hbcuService.ts
│   │   ├── userService.ts
│   │   ├── reviewService.ts
│   │   ├── checkinService.ts
│   │   ├── searchService.ts
│   │   ├── guideService.ts
│   │   ├── itineraryService.ts
│   │   ├── listService.ts
│   │   ├── aiService.ts         # Calls Supabase Edge Functions
│   │   └── stripeService.ts
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useBusinesses.ts
│   │   ├── useBusinessDetail.ts
│   │   ├── useEvents.ts
│   │   ├── useHBCUs.ts
│   │   ├── useSearch.ts
│   │   ├── useCheckin.ts
│   │   ├── useFavorites.ts
│   │   ├── useAuth.ts
│   │   ├── useLocation.ts
│   │   └── useNotifications.ts
│   │
│   ├── navigation/
│   │   ├── AppNavigator.tsx     # Root navigator (auth gate)
│   │   ├── AuthStack.tsx
│   │   ├── MainTabs.tsx         # Bottom tabs
│   │   ├── HomeStack.tsx
│   │   ├── ExploreStack.tsx
│   │   ├── EventsStack.tsx
│   │   ├── HBCUStack.tsx
│   │   └── ProfileStack.tsx
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── SplashScreen.tsx
│   │   │   ├── OnboardingScreen.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── SignupScreen.tsx
│   │   │   └── ForgotPasswordScreen.tsx
│   │   │
│   │   ├── home/
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── CityScreen.tsx
│   │   │   └── ArticlesScreen.tsx
│   │   │
│   │   ├── explore/
│   │   │   ├── ExploreScreen.tsx
│   │   │   ├── MapExploreScreen.tsx
│   │   │   └── SearchResultsScreen.tsx
│   │   │
│   │   ├── business/
│   │   │   ├── BusinessDetailScreen.tsx
│   │   │   ├── BusinessDetailTabs/
│   │   │   │   ├── MenuTab.tsx
│   │   │   │   ├── ReviewsTab.tsx
│   │   │   │   ├── EventsTab.tsx
│   │   │   │   └── PhotosTab.tsx
│   │   │   └── ClaimBusinessScreen.tsx
│   │   │
│   │   ├── events/
│   │   │   ├── EventsScreen.tsx
│   │   │   ├── SignatureEventsScreen.tsx
│   │   │   └── AnnualEventDetailScreen.tsx
│   │   │
│   │   ├── hbcus/
│   │   │   ├── HBCUListScreen.tsx
│   │   │   └── HBCUDetailScreen.tsx
│   │   │
│   │   └── profile/
│   │       ├── ProfileScreen.tsx
│   │       ├── EditProfileScreen.tsx
│   │       ├── FavoritesScreen.tsx
│   │       ├── VibeRoutesScreen.tsx
│   │       ├── ItineraryDetailScreen.tsx
│   │       ├── PlaylistBuilderScreen.tsx
│   │       ├── ListBuilderScreen.tsx
│   │       ├── SharedListScreen.tsx
│   │       ├── MyBusinessScreen.tsx
│   │       ├── CreatorApplicationScreen.tsx
│   │       └── UserPublicProfileScreen.tsx
│   │
│   ├── components/
│   │   ├── ui/                  # Base design system components
│   │   │   ├── GoldButton.tsx
│   │   │   ├── OutlineButton.tsx
│   │   │   ├── SkeletonLoader.tsx
│   │   │   ├── BlurView.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── StarRating.tsx
│   │   │   ├── PriceRange.tsx
│   │   │   ├── ToastNotification.tsx
│   │   │   └── Divider.tsx
│   │   │
│   │   ├── business/
│   │   │   ├── BusinessCard.tsx
│   │   │   ├── BusinessCardSkeleton.tsx
│   │   │   ├── StickyActionBar.tsx
│   │   │   ├── CheckInButton.tsx
│   │   │   ├── FavoriteButton.tsx
│   │   │   ├── ReviewCard.tsx
│   │   │   ├── ReviewForm.tsx
│   │   │   ├── MenuItemRow.tsx
│   │   │   └── ImageGallery.tsx
│   │   │
│   │   ├── events/
│   │   │   ├── EventFlyerCard.tsx
│   │   │   ├── EventLightbox.tsx
│   │   │   ├── RSVPButton.tsx
│   │   │   └── AnnualEventCard.tsx
│   │   │
│   │   ├── hbcu/
│   │   │   ├── HBCUCard.tsx
│   │   │   └── SchoolColorsBar.tsx
│   │   │
│   │   ├── navigation/
│   │   │   ├── BlurTabBar.tsx
│   │   │   ├── HeaderLogo.tsx
│   │   │   └── BackButton.tsx
│   │   │
│   │   ├── search/
│   │   │   ├── SearchBar.tsx
│   │   │   ├── SearchResultItem.tsx
│   │   │   └── VibePills.tsx
│   │   │
│   │   ├── profile/
│   │   │   ├── UserTierBadge.tsx
│   │   │   ├── VerifiedBadge.tsx
│   │   │   ├── ProfileStatsBar.tsx
│   │   │   └── FollowButton.tsx
│   │   │
│   │   └── ai/
│   │       ├── ChatBubble.tsx
│   │       ├── AITypingIndicator.tsx
│   │       └── ItineraryCard.tsx
│   │
│   ├── theme/
│   │   ├── colors.ts            # Full color token system
│   │   ├── typography.ts        # Playfair + DM Sans scales
│   │   ├── spacing.ts           # 4pt grid
│   │   └── shadows.ts           # Elevation system
│   │
│   └── utils/
│       ├── formatters.ts        # Currency, dates, ratings
│       ├── validators.ts        # Username, email rules
│       ├── deepLinks.ts         # URL scheme handlers
│       └── permissions.ts      # Camera, location, notifications
│
└── supabase/
    ├── functions/               # Edge functions (already deployed)
    └── migrations/              # Schema migrations
```

---

### 3.2 Core Implementation Files

#### `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import { MMKV } from 'react-native-mmkv'
import type { Database } from '../types/database.types'

const storage = new MMKV()

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}

export const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)

export { storage }
```

---

#### `src/theme/colors.ts`

```typescript
export const colors = {
  // Core brand
  background: 'hsl(0, 0%, 4%)',       // #0a0a0a near-black
  foreground: 'hsl(0, 0%, 95%)',       // #f2f2f2 near-white
  primary: 'hsl(43, 72%, 52%)',        // #d4a017 gold
  primaryForeground: 'hsl(0, 0%, 4%)',

  // Surfaces
  card: 'hsl(0, 0%, 7%)',              // #121212
  cardHover: 'hsl(0, 0%, 10%)',        // slightly lighter
  secondary: 'hsl(0, 0%, 12%)',        // #1f1f1f inputs
  muted: 'hsl(0, 0%, 55%)',            // #8c8c8c subdued text
  border: 'hsl(0, 0%, 15%)',           // #262626 borders

  // Semantic
  destructive: 'hsl(0, 72%, 51%)',     // red
  success: 'hsl(142, 71%, 45%)',       // green
  warning: 'hsl(38, 92%, 50%)',        // amber

  // Special
  gold: 'hsl(43, 72%, 52%)',
  goldDim: 'hsl(43, 50%, 35%)',
  hbcuGreen: 'hsl(142, 71%, 45%)',     // "Near HBCU" badge
  historicAmber: 'hsl(38, 92%, 50%)',  // Historic district badge
  hotRed: 'hsl(0, 72%, 51%)',          // 🔥 Hot badge

  // Glassmorphism
  glass: 'rgba(18, 18, 18, 0.8)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
}

export const gradients = {
  heroOverlay: ['transparent', 'rgba(10, 10, 10, 0.85)'],
  cardBottom: ['transparent', 'rgba(10, 10, 10, 0.95)'],
  goldShimmer: ['#d4a017', '#f0c040', '#d4a017'],
  darkToTransparent: ['rgba(10,10,10,0.9)', 'transparent'],
}
```

---

#### `src/theme/typography.ts`

```typescript
import { Platform } from 'react-native'

export const fonts = {
  headline: 'PlayfairDisplay',
  headlineBold: 'PlayfairDisplay-Bold',
  body: 'DMSans',
  bodyMedium: 'DMSans-Medium',
  bodyBold: 'DMSans-Bold',
}

export const typography = {
  // Display (hero text)
  displayXL: { fontFamily: fonts.headline, fontSize: 40, lineHeight: 48, letterSpacing: -0.5 },
  displayLG: { fontFamily: fonts.headline, fontSize: 32, lineHeight: 40, letterSpacing: -0.3 },

  // Headings
  h1: { fontFamily: fonts.headlineBold, fontSize: 28, lineHeight: 36 },
  h2: { fontFamily: fonts.headlineBold, fontSize: 22, lineHeight: 30 },
  h3: { fontFamily: fonts.headlineBold, fontSize: 18, lineHeight: 26 },

  // Body
  bodyLG: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  bodyMD: { fontFamily: fonts.body, fontSize: 14, lineHeight: 22 },
  bodySM: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18 },

  // Labels
  labelLG: { fontFamily: fonts.bodyMedium, fontSize: 14, lineHeight: 20, letterSpacing: 0.1 },
  labelSM: { fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 16, letterSpacing: 0.3 },
  caption: { fontFamily: fonts.body, fontSize: 11, lineHeight: 16, letterSpacing: 0.4 },
}
```

---

#### `src/stores/authStore.ts`

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { MMKV } from 'react-native-mmkv'
import type { Session, User } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']
type UserRole = 'admin' | 'user' | 'owner'

const storage = new MMKV()

interface AuthState {
  session: Session | null
  user: User | null
  profile: UserProfile | null
  role: UserRole
  isLoading: boolean
  setSession: (session: Session | null) => void
  setProfile: (profile: UserProfile | null) => void
  setRole: (role: UserRole) => void
  signOut: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      user: null,
      profile: null,
      role: 'user',
      isLoading: true,
      setSession: (session) =>
        set({ session, user: session?.user ?? null, isLoading: false }),
      setProfile: (profile) => set({ profile }),
      setRole: (role) => set({ role }),
      signOut: () =>
        set({ session: null, user: null, profile: null, role: 'user' }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => ({
        getItem: (key) => storage.getString(key) ?? null,
        setItem: (key, value) => storage.set(key, value),
        removeItem: (key) => storage.delete(key),
      })),
      partialize: (state) => ({ profile: state.profile, role: state.role }),
    }
  )
)
```

---

#### `src/services/businessService.ts`

```typescript
import { supabase } from '../lib/supabase'
import type { Database } from '../types/database.types'

type Business = Database['public']['Tables']['businesses']['Row']

export interface BusinessFilters {
  city?: string
  category?: string
  vibe?: string
  neighborhood?: string
  search?: string
  limit?: number
  offset?: number
}

export const businessService = {
  async getAll(filters: BusinessFilters = {}): Promise<Business[]> {
    let query = supabase
      .from('businesses')
      .select(`
        id, name, category, city, neighborhood, address,
        cover_photo_url, photo_urls, price_range, rating,
        review_count, follower_count, verified, featured,
        top_pick, active, google_place_id
      `)
      .eq('active', true)
      .order('cover_photo_url', { ascending: false, nullsFirst: false })
      .limit(filters.limit ?? 100)

    if (filters.city) query = query.eq('city', filters.city)
    if (filters.category) query = query.eq('category', filters.category)
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }
    if (filters.offset) query = query.range(filters.offset, filters.offset + (filters.limit ?? 100) - 1)

    const { data, error } = await query
    if (error) throw error
    return data ?? []
  },

  async getById(id: string): Promise<Business & { tags: string[]; checkInCount: number }> {
    const [{ data: biz, error }, { data: tags }, { count }] = await Promise.all([
      supabase.from('businesses').select('*').eq('id', id).single(),
      supabase.from('business_tags').select('tag').eq('business_id', id),
      supabase
        .from('business_checkins')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', id),
    ])
    if (error) throw error
    return {
      ...biz!,
      tags: tags?.map((t) => t.tag) ?? [],
      checkInCount: count ?? 0,
    }
  },

  async getByCity(city: string): Promise<Business[]> {
    return businessService.getAll({ city, limit: 200 })
  },

  async getFeatured(): Promise<Business[]> {
    const { data, error } = await supabase
      .from('businesses')
      .select('id, name, category, city, cover_photo_url, photo_urls, rating, verified, featured')
      .eq('active', true)
      .eq('featured', true)
      .limit(20)
    if (error) throw error
    return data ?? []
  },

  async getNewAndNotable(): Promise<Business[]> {
    const { data, error } = await supabase
      .from('businesses')
      .select('id, name, category, city, cover_photo_url, rating, verified, created_at')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(20)
    if (error) throw error
    return (data ?? []).sort((a, b) =>
      a.cover_photo_url && !b.cover_photo_url ? -1 : 1
    )
  },

  async getByVibe(vibe: string, city?: string): Promise<Business[]> {
    const { data: taggedIds, error: tagError } = await supabase
      .from('business_tags')
      .select('business_id')
      .eq('tag', vibe.toLowerCase().replace(' ', '-'))

    if (tagError || !taggedIds?.length) return []

    const ids = taggedIds.map((t) => t.business_id)
    let query = supabase
      .from('businesses')
      .select('id, name, category, city, neighborhood, cover_photo_url, rating, verified, price_range')
      .eq('active', true)
      .in('id', ids)
      .limit(50)

    if (city) query = query.eq('city', city)
    const { data, error } = await query
    if (error) throw error
    return data ?? []
  },

  async search(query: string): Promise<Business[]> {
    const { data, error } = await supabase
      .from('businesses')
      .select('id, name, category, city, cover_photo_url, verified')
      .eq('active', true)
      .ilike('name', `%${query}%`)
      .limit(15)
    if (error) throw error
    return data ?? []
  },
}
```

---

#### `src/services/aiService.ts`

```typescript
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
  day: number
  time: string
  notes: string
  address: string
}

export interface GeneratedItinerary {
  title: string
  description: string
  stops: ItineraryStop[]
  vibe: string
}

export const aiService = {
  async buildPlaylist(request: PlaylistRequest): Promise<GeneratedItinerary> {
    const { data, error } = await supabase.functions.invoke('build-playlist', {
      body: request,
    })
    if (error) throw error
    return data as GeneratedItinerary
  },

  async streamPlaylist(
    request: PlaylistRequest,
    onChunk: (chunk: string) => void,
    onComplete: (itinerary: GeneratedItinerary) => void
  ) {
    // Stream via fetch for chat-style token-by-token output
    const { data: { session } } = await supabase.auth.getSession()
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/build-playlist`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ ...request, stream: true }),
      }
    )

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let fullText = ''

    while (reader) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value)
      fullText += chunk
      onChunk(chunk)
    }

    try {
      onComplete(JSON.parse(fullText))
    } catch {
      // Handle partial/non-JSON final chunk
    }
  },
}
```

---

#### `src/screens/home/HomeScreen.tsx`

```typescript
import React, { useCallback, useRef } from 'react'
import {
  ScrollView,
  View,
  StatusBar,
  StyleSheet,
  RefreshControl,
} from 'react-native'
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated'
import { useQuery } from '@tanstack/react-query'
import { SafeAreaView } from 'react-native-safe-area-context'

import { businessService } from '../../services/businessService'
import { eventService } from '../../services/eventService'
import { guideService } from '../../services/guideService'

import { HeroSection } from '../../components/home/HeroSection'
import { VibePills } from '../../components/search/VibePills'
import { SignatureEventsCarousel } from '../../components/home/SignatureEventsCarousel'
import { CitiesGrid } from '../../components/home/CitiesGrid'
import { HorizontalBusinessList } from '../../components/home/HorizontalBusinessList'
import { EventFlyerCarousel } from '../../components/home/EventFlyerCarousel'
import { GuidesGrid } from '../../components/home/GuidesGrid'
import { HomeHeader } from '../../components/navigation/HomeHeader'
import { BusinessCardSkeleton } from '../../components/business/BusinessCardSkeleton'
import { colors } from '../../theme/colors'

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView)

export function HomeScreen() {
  const scrollY = useSharedValue(0)
  const [refreshing, setRefreshing] = React.useState(false)

  const { data: newAndNotable, refetch: refetchNew } = useQuery({
    queryKey: ['businesses', 'new-notable'],
    queryFn: businessService.getNewAndNotable,
    staleTime: 1000 * 60 * 5, // 5 min
  })

  const { data: trendingEvents, refetch: refetchEvents } = useQuery({
    queryKey: ['events', 'trending'],
    queryFn: eventService.getTrending,
    staleTime: 1000 * 60 * 5,
  })

  const { data: guides, refetch: refetchGuides } = useQuery({
    queryKey: ['guides', 'featured'],
    queryFn: guideService.getFeatured,
    staleTime: 1000 * 60 * 10,
  })

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
    },
  })

  const headerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 80], [0, 1], Extrapolate.CLAMP),
  }))

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([refetchNew(), refetchEvents(), refetchGuides()])
    setRefreshing(false)
  }, [refetchNew, refetchEvents, refetchGuides])

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <HomeHeader animatedStyle={headerStyle} />
      <AnimatedScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <HeroSection scrollY={scrollY} />
        <VibePills style={styles.section} />
        <SignatureEventsCarousel style={styles.section} />
        <CitiesGrid style={styles.section} />
        <HorizontalBusinessList
          title="New & Notable"
          businesses={newAndNotable}
          style={styles.section}
        />
        <EventFlyerCarousel
          events={trendingEvents}
          style={styles.section}
        />
        <GuidesGrid guides={guides} style={styles.section} />
        <View style={styles.bottomPad} />
      </AnimatedScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    marginTop: 32,
  },
  bottomPad: {
    height: 100,
  },
})
```

---

#### `src/screens/explore/ExploreScreen.tsx`

```typescript
import React, { useState, useCallback, useMemo } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'
import { FlashList } from '@shopify/flash-list'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { useDebouncedCallback } from 'use-debounce'

import { businessService } from '../../services/businessService'
import { SearchBar } from '../../components/search/SearchBar'
import { VibePills } from '../../components/search/VibePills'
import { BusinessCard } from '../../components/business/BusinessCard'
import { BusinessCardSkeleton } from '../../components/business/BusinessCardSkeleton'
import { FilterBar } from '../../components/explore/FilterBar'
import { colors, gradients } from '../../theme/colors'
import { typography } from '../../theme/typography'

export function ExploreScreen() {
  const navigation = useNavigation()
  const [search, setSearch] = useState('')
  const [vibe, setVibe] = useState<string | null>(null)
  const [city, setCity] = useState<string | null>(null)
  const [category, setCategory] = useState<string | null>(null)

  const debouncedSearch = useDebouncedCallback(setSearch, 300)

  const { data: businesses, isLoading } = useQuery({
    queryKey: ['businesses', 'explore', { search, vibe, city, category }],
    queryFn: () =>
      businessService.getAll({ search, city: city ?? undefined, category: category ?? undefined }),
    staleTime: 1000 * 60 * 2,
  })

  const filtered = useMemo(() => {
    if (!vibe || !businesses) return businesses
    return businesses.filter((b) =>
      // Client-side vibe filter for instant feedback
      b.name.toLowerCase().includes(vibe) // simplified; real: cross-ref business_tags
    )
  }, [businesses, vibe])

  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={FadeIn.delay(index * 50).duration(300)}>
      <BusinessCard
        business={item}
        style={styles.card}
        onPress={() => navigation.navigate('BusinessDetail', { id: item.id })}
      />
    </Animated.View>
  ), [navigation])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => navigation.navigate('MapExplore')}
        >
          <Ionicons name="map-outline" size={20} color={colors.primary} />
          <Text style={styles.mapLabel}>Map</Text>
        </TouchableOpacity>
      </View>

      <SearchBar
        placeholder="Search restaurants, bars, cafés..."
        onChangeText={debouncedSearch}
        style={styles.searchBar}
      />

      <VibePills
        selected={vibe}
        onSelect={setVibe}
        style={styles.pills}
      />

      <FilterBar
        city={city}
        category={category}
        onCityChange={setCity}
        onCategoryChange={setCategory}
      />

      {isLoading ? (
        <View style={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <BusinessCardSkeleton key={i} style={styles.card} />
          ))}
        </View>
      ) : (
        <FlashList
          data={filtered ?? []}
          renderItem={renderItem}
          estimatedItemSize={220}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { ...typography.h2, color: colors.foreground },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  mapLabel: { ...typography.labelSM, color: colors.primary },
  searchBar: { marginHorizontal: 16, marginBottom: 8 },
  pills: { marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 },
  card: { flex: 1, margin: 4 },
  listContent: { padding: 8 },
})
```

---

#### `src/components/business/BusinessCard.tsx`

```typescript
import React, { useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'

import { FavoriteButton } from './FavoriteButton'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'
import type { Database } from '../../types/database.types'

type Business = Database['public']['Tables']['businesses']['Row']

interface BusinessCardProps {
  business: Business & { tags?: string[]; checkInCount?: number }
  onPress?: () => void
  style?: ViewStyle
}

const PLACEHOLDER = require('../../../assets/images/logo-gold.png')

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

export function BusinessCard({ business, onPress, style }: BusinessCardProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, { damping: 15 })
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }, [])

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15 })
  }, [])

  const imageSource = business.cover_photo_url
    ? { uri: business.cover_photo_url }
    : PLACEHOLDER

  const isHot = (business.checkInCount ?? 0) >= 25

  return (
    <AnimatedTouchable
      style={[styles.container, animatedStyle, style]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={imageSource}
          style={styles.image}
          contentFit="cover"
          transition={300}
          placeholder={PLACEHOLDER}
        />

        {/* Gradient overlay */}
        <View style={styles.gradient} />

        {/* Top-right: Favorite */}
        <View style={styles.favoriteButton}>
          <FavoriteButton businessId={business.id} size={18} />
        </View>

        {/* Bottom-left badges */}
        <View style={styles.badges}>
          {business.category && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{business.category}</Text>
            </View>
          )}
          {business.price_range && (
            <View style={[styles.badge, styles.priceBadge]}>
              <Text style={styles.badgeText}>{business.price_range}</Text>
            </View>
          )}
          {isHot && (
            <View style={[styles.badge, styles.hotBadge]}>
              <Text style={styles.badgeText}>🔥</Text>
            </View>
          )}
        </View>
      </View>

      {/* Card body */}
      <View style={styles.body}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {business.name}
          </Text>
          {business.verified && (
            <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
          )}
        </View>

        {business.rating ? (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={11} color={colors.primary} />
            <Text style={styles.rating}>
              {Number(business.rating).toFixed(1)}
            </Text>
            {business.review_count ? (
              <Text style={styles.reviewCount}>({business.review_count})</Text>
            ) : null}
          </View>
        ) : null}

        {business.neighborhood && (
          <Text style={styles.neighborhood} numberOfLines={1}>
            {business.neighborhood}
          </Text>
        )}
      </View>
    </AnimatedTouchable>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageContainer: {
    aspectRatio: 4 / 3,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    background: 'linear-gradient(to top, rgba(10,10,10,0.7) 0%, transparent 60%)',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  badges: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    gap: 4,
  },
  badge: {
    backgroundColor: 'rgba(10,10,10,0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  priceBadge: {
    borderColor: colors.goldDim,
  },
  hotBadge: {
    backgroundColor: 'rgba(180,30,30,0.7)',
  },
  badgeText: {
    ...typography.caption,
    color: colors.foreground,
  },
  body: {
    padding: 10,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    ...typography.labelLG,
    color: colors.foreground,
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rating: {
    ...typography.bodySM,
    color: colors.primary,
    fontWeight: '600',
  },
  reviewCount: {
    ...typography.caption,
    color: colors.muted,
  },
  neighborhood: {
    ...typography.bodySM,
    color: colors.muted,
  },
})
```

---

#### `src/navigation/MainTabs.tsx`

```typescript
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { BlurView } from 'expo-blur'
import { Platform, StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { HomeStack } from './HomeStack'
import { ExploreStack } from './ExploreStack'
import { EventsStack } from './EventsStack'
import { HBCUStack } from './HBCUStack'
import { ProfileStack } from './ProfileStack'
import { colors } from '../theme/colors'
import { useAuthStore } from '../stores/authStore'

const Tab = createBottomTabNavigator()

export function MainTabs() {
  const role = useAuthStore((s) => s.role)

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 10, fontFamily: 'DMSans-Medium' },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ExploreTab"
        component={ExploreStack}
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="EventsTab"
        component={EventsStack}
        options={{
          tabBarLabel: 'Events',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="HBCUsTab"
        component={HBCUStack}
        options={{
          tabBarLabel: 'HBCUs',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="school-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 0.5,
    borderTopColor: colors.glassBorder,
    backgroundColor: 'transparent',
    elevation: 0,
    height: Platform.OS === 'ios' ? 85 : 60,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
  },
})
```

---

#### `app.json`

```json
{
  "expo": {
    "name": "SavorBLK",
    "slug": "savorblk",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "cover",
      "backgroundColor": "#0a0a0a"
    },
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.savorblk.app",
      "buildNumber": "1",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "We use your location to show nearby Black-owned restaurants.",
        "NSPhotoLibraryUsageDescription": "Save event flyers and business photos to your photos.",
        "NSCameraUsageDescription": "Upload photos for business listings and your profile."
      },
      "entitlements": {
        "aps-environment": "production"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#0a0a0a"
      },
      "package": "com.savorblk.app",
      "versionCode": 1,
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE"
      ]
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      ["expo-notifications", {
        "icon": "./assets/images/notification-icon.png",
        "color": "#d4a017",
        "sounds": ["./assets/sounds/notification.wav"]
      }],
      ["expo-location", {
        "locationAlwaysAndWhenInUsePermission": "Allow SavorBLK to use your location to show nearby spots."
      }],
      "expo-image-picker",
      ["expo-build-properties", {
        "ios": { "deploymentTarget": "15.0" },
        "android": { "compileSdkVersion": 34, "targetSdkVersion": 34, "minSdkVersion": 26 }
      }]
    ],
    "scheme": "savorblk",
    "extra": {
      "eas": { "projectId": "YOUR_EAS_PROJECT_ID" }
    }
  }
}
```

---

#### `eas.json`

```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": { "APP_ENV": "development" }
    },
    "preview": {
      "distribution": "internal",
      "env": { "APP_ENV": "staging" }
    },
    "production": {
      "distribution": "store",
      "env": { "APP_ENV": "production" }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "YOUR_APPLE_ID",
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID",
        "appleTeamId": "YOUR_TEAM_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      }
    }
  }
}
```

---

#### `package.json` (key dependencies)

```json
{
  "name": "savorblk-mobile",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "dependencies": {
    "expo": "~51.0.0",
    "expo-router": "~3.5.0",
    "react": "18.2.0",
    "react-native": "0.74.0",

    "@supabase/supabase-js": "^2.43.0",
    "expo-secure-store": "~13.0.0",

    "@tanstack/react-query": "^5.40.0",
    "zustand": "^4.5.0",
    "react-native-mmkv": "^2.12.0",

    "react-native-reanimated": "~3.10.0",
    "react-native-gesture-handler": "~2.16.0",
    "lottie-react-native": "6.7.0",
    "expo-linear-gradient": "~13.0.0",
    "expo-blur": "~13.0.0",
    "expo-image": "~1.12.0",
    "expo-image-picker": "~15.0.0",

    "@react-navigation/native": "^6.1.17",
    "@react-navigation/bottom-tabs": "^6.5.20",
    "@react-navigation/native-stack": "^6.9.26",
    "react-native-safe-area-context": "4.10.1",
    "react-native-screens": "3.31.1",

    "@shopify/flash-list": "1.6.4",

    "react-native-maps": "1.14.0",
    "expo-location": "~17.0.0",

    "@stripe/stripe-react-native": "0.37.0",

    "expo-notifications": "~0.28.0",
    "expo-haptics": "~13.0.0",
    "expo-linking": "~6.3.0",
    "expo-web-browser": "~13.0.0",

    "@expo/vector-icons": "^14.0.0",
    "use-debounce": "^10.0.1"
  },
  "devDependencies": {
    "typescript": "~5.3.0",
    "@types/react": "~18.2.0",
    "@types/react-native": "~0.73.0",
    "eslint": "^8.57.0",
    "prettier": "^3.3.0"
  }
}
```

---

## PHASE 4 — SCALING PLAN

---

### 4.1 Current → 10k Users (Launch)

**Infrastructure (Supabase Free → Pro):**
- Supabase Pro: 8GB DB, 100GB storage, 2M edge function invocations
- Enable Supabase connection pooling (PgBouncer)
- CDN for images: use Supabase Storage with `image transformation` API
- Enable Supabase Realtime for check-in counts (cheap at this scale)

**App:**
- React Query stale-while-revalidate everywhere
- MMKV offline cache for home feed + favorites
- Expo OTA for hotfixes (no App Store wait)

**Monitoring:**
- Sentry (Expo plugin) for crash reporting
- Supabase dashboard for query performance
- Expo EAS Insights for device analytics

---

### 4.2 10k → 100k Users

**Database:**
- Add indexes on `businesses.city`, `businesses.category`, `business_tags.tag`
- Partition `business_checkins` by month
- Materialized view for city business counts (refresh every hour)
- Read replica for heavy SELECT queries (Supabase Enterprise or self-hosted replica)

**Caching layer:**
- Upstash Redis (via Supabase Edge Function middleware) for:
  - Home feed (TTL: 5 min)
  - Search results (TTL: 2 min)
  - Business detail (TTL: 10 min, invalidate on update)

**Images:**
- Migrate to Cloudflare Images (cheaper egress, global PoPs)
- Or keep Supabase Storage + enable image transformations for responsive sizes

**Push Notifications:**
- Move from Expo push to direct APNs/FCM via Supabase Edge Function
- Segment-based pushes: users in Houston get Houston events only

**AI:**
- Add response caching for Gemini (same city+dates+vibe → cached itinerary)
- Rate limiting per user (5 AI requests/day free, unlimited for premium)

**Analytics:**
- PostHog (self-hosted or cloud) for funnel analysis
- Track: search terms, vibe filter usage, check-in rates, business conversion

---

### 4.3 100k → 1M Users

**Architecture shift — microservices-ready:**

```
Mobile App
    │
    ├── API Gateway (Cloudflare Workers or Vercel Edge)
    │   ├── /businesses → Business Service (Supabase)
    │   ├── /events → Events Service (Supabase)
    │   ├── /search → Typesense (dedicated search engine)
    │   ├── /ai → AI Orchestration Service
    │   └── /push → Push Notification Service
    │
    ├── Search: Replace Supabase ILIKE → Typesense
    │   (instant search, typo tolerance, facets, geo-search)
    │
    ├── Images: Cloudflare Images + R2 storage
    │   (cheaper at scale, global CDN, face detection blur)
    │
    ├── Events pipeline: Supabase → Kafka → Consumer workers
    │   (check-ins, views, RSVPs — async processing)
    │
    └── Recommendation engine:
        - Feature store: user behavior vectors
        - Model: collaborative filtering (user × business matrix)
        - Deployed on: Modal.com or AWS SageMaker
        - Served via: Supabase Edge Function with Redis cache
```

**Database:**
- Move to dedicated Postgres cluster (Neon or RDS)
- Supabase for Auth only (or migrate to Auth0 at massive scale)
- Separate read replicas per region (US-East, US-West)
- TimescaleDB for time-series: check-in analytics, event RSVPs

**App performance:**
- Hermes JS engine (already default in Expo)
- New Architecture (Fabric + TurboModules) — Expo SDK 51 supports it
- Pre-fetching: prefetch BusinessDetail on FlatList `onViewableItemsChanged`
- Background app refresh for push tokens, cache warming

**Monetization at scale:**
- Stripe billing portal in-app
- Revenue: Featured placements → dynamic pricing based on city demand
- New tier: SavorBLK Premium (users): ad-free, exclusive events, early RSVP
- B2B: SavorBLK for Teams (restaurant groups, hotel chains)

**Compliance:**
- GDPR/CCPA: data export + deletion flows already in spec (`delete-account` edge fn)
- App Store review: NSUserTrackingUsageDescription for ATT (iOS 14.5+)

---

### 4.4 Feature Expansion Roadmap (Post-Launch)

| Phase | Feature | Tech |
|-------|---------|------|
| V1.1 | Apple Pay / Google Pay for event tickets | Stripe PaymentSheet |
| V1.2 | AR "SavorBLK Lens" — point camera at restaurant | ARKit / ARCore |
| V1.3 | Live streaming for events | Daily.co or Agora SDK |
| V2.0 | Group planning — collaborative Vibe Routes | Supabase Realtime channels |
| V2.1 | Loyalty rewards — punch cards per business | Custom rewards table |
| V2.2 | Black-owned grocery + retail expansion | New business categories |
| V3.0 | SavorBLK International — UK, Canada, Caribbean | Multi-region Supabase |

---

### 4.5 App Store Submission Checklist

**iOS:**
- [ ] Apple Developer account ($99/year)
- [ ] Provisioning profiles (EAS handles this)
- [ ] App Store screenshots (6.7", 6.1", iPad)
- [ ] App Preview video (30s max)
- [ ] Privacy policy URL
- [ ] NSUserTrackingUsageDescription (ATT)
- [ ] Age rating: 4+ (no objectionable content)
- [ ] `eas build --platform ios --profile production`
- [ ] `eas submit --platform ios`

**Android:**
- [ ] Google Play Console account ($25 one-time)
- [ ] Keystore (EAS manages)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (phone + 7" tablet)
- [ ] Content rating questionnaire
- [ ] Data safety form (what data is collected)
- [ ] `eas build --platform android --profile production`
- [ ] `eas submit --platform android`

---

## APPENDIX: Quick Start Commands

```bash
# 1. Create Expo project
npx create-expo-app savorblk-mobile --template expo-template-blank-typescript

# 2. Install all dependencies
npx expo install expo-router expo-secure-store expo-blur expo-image \
  expo-image-picker expo-location expo-notifications expo-haptics \
  expo-linear-gradient expo-web-browser expo-linking \
  react-native-reanimated react-native-gesture-handler \
  react-native-safe-area-context react-native-screens \
  react-native-maps react-native-mmkv \
  @supabase/supabase-js @tanstack/react-query zustand \
  @react-navigation/native @react-navigation/bottom-tabs \
  @react-navigation/native-stack @shopify/flash-list \
  @stripe/stripe-react-native lottie-react-native \
  @expo/vector-icons use-debounce

# 3. Set up EAS
npm install -g eas-cli
eas login
eas build:configure

# 4. Generate Supabase types
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts

# 5. Start development
npx expo start --dev-client
```
