import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack'
import type { BottomTabNavigationProp, BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { CompositeNavigationProp, CompositeScreenProps } from '@react-navigation/native'

// ─── Root ───────────────────────────────────────────────────────
export type RootStackParamList = {
  Auth: undefined
  Main: undefined
}

// ─── Auth Stack ─────────────────────────────────────────────────
export type AuthStackParamList = {
  Splash: undefined
  Onboarding: undefined
  Login: { redirect?: string }
  Signup: undefined
  ForgotPassword: undefined
  ResetPassword: { token: string }
}

// ─── Main Tabs ──────────────────────────────────────────────────
export type MainTabParamList = {
  HomeTab: undefined
  ExploreTab: undefined
  EventsTab: undefined
  HBCUsTab: undefined
  ProfileTab: undefined
}

// ─── Home Stack ─────────────────────────────────────────────────
export type HomeStackParamList = {
  Home: undefined
  City: { citySlug: string; cityName: string }
  GuideDetail: { guideId: string }
  Articles: undefined
  ArticleDetail: { articleId: string }
}

// ─── Explore Stack ──────────────────────────────────────────────
export type ExploreStackParamList = {
  Explore: { vibe?: string; city?: string; category?: string }
  MapExplore: { city?: string }
  BusinessDetail: { id: string }
  ClaimBusiness: { businessId: string }
  SearchResults: { query: string }
}

// ─── Events Stack ───────────────────────────────────────────────
export type EventsStackParamList = {
  Events: undefined
  SignatureEvents: undefined
  AnnualEventDetail: { id: string }
}

// ─── HBCU Stack ─────────────────────────────────────────────────
export type HBCUStackParamList = {
  HBCUList: undefined
  HBCUDetail: { slug: string }
}

// ─── Profile Stack ──────────────────────────────────────────────
export type ProfileStackParamList = {
  Profile: undefined
  EditProfile: undefined
  Favorites: undefined
  VibeRoutes: undefined
  ItineraryDetail: { id: string }
  PlaylistBuilder: undefined
  ListBuilder: undefined
  SharedList: { shareCode: string }
  MyBusiness: { id: string }
  CreatorApplication: undefined
  UserPublicProfile: { username: string }
}

// ─── Screen prop helpers ────────────────────────────────────────
export type HomeScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'Home'>,
  BottomTabScreenProps<MainTabParamList>
>

export type ExploreScreenProps = NativeStackScreenProps<ExploreStackParamList, 'Explore'>
export type BusinessDetailScreenProps = NativeStackScreenProps<ExploreStackParamList, 'BusinessDetail'>
export type CityScreenProps = NativeStackScreenProps<HomeStackParamList, 'City'>
export type EventsScreenProps = NativeStackScreenProps<EventsStackParamList, 'Events'>
export type HBCUListScreenProps = NativeStackScreenProps<HBCUStackParamList, 'HBCUList'>
export type HBCUDetailScreenProps = NativeStackScreenProps<HBCUStackParamList, 'HBCUDetail'>
export type ProfileScreenProps = NativeStackScreenProps<ProfileStackParamList, 'Profile'>
export type PlaylistBuilderScreenProps = NativeStackScreenProps<ProfileStackParamList, 'PlaylistBuilder'>
