export const colors = {
  // ── Core backgrounds ─────────────────────────────────────────
  background: '#0a0a0a',       // hsl(0 0% 4%)   — near-black
  foreground: '#f2f2f2',       // hsl(0 0% 95%)  — near-white
  card: '#121212',             // hsl(0 0% 7%)   — card surface
  cardHover: '#1a1a1a',        // slightly lighter for pressed state
  secondary: '#1f1f1f',        // hsl(0 0% 12%)  — inputs, secondary surfaces
  muted: '#8c8c8c',            // hsl(0 0% 55%)  — subdued text
  border: '#262626',           // hsl(0 0% 15%)  — dividers

  // ── Brand gold ───────────────────────────────────────────────
  primary: '#c9990a',          // hsl(43 72% 52%) — gold accent (adjusted for OLED)
  primaryForeground: '#0a0a0a',
  primaryLight: '#e8b81a',     // hover/active state
  primaryDim: '#6b5204',       // subdued gold

  // ── Semantic colors ──────────────────────────────────────────
  destructive: '#c0392b',      // hsl(0 72% 51%)
  success: '#27ae60',          // hsl(142 71% 45%)
  warning: '#e67e22',          // hsl(38 92% 50%)
  info: '#2980b9',

  // ── Special badges ───────────────────────────────────────────
  hbcuGreen: '#27ae60',        // "Near HBCU" campus badge
  historicAmber: '#e67e22',    // historic district badge
  hotRed: '#e74c3c',           // 🔥 hot business badge (25+ check-ins)
  verifiedGold: '#c9990a',     // verified business ring

  // ── Glassmorphism ────────────────────────────────────────────
  glass: 'rgba(18, 18, 18, 0.85)',
  glassLight: 'rgba(30, 30, 30, 0.75)',
  glassBorder: 'rgba(255, 255, 255, 0.07)',
  glassBorderLight: 'rgba(255, 255, 255, 0.12)',

  // ── Overlays ─────────────────────────────────────────────────
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.35)',
  overlayHeavy: 'rgba(0, 0, 0, 0.85)',

  // ── Skeleton shimmer ─────────────────────────────────────────
  skeletonBase: '#1a1a1a',
  skeletonHighlight: '#2a2a2a',

  // ── Tab bar ──────────────────────────────────────────────────
  tabBarBg: 'rgba(10, 10, 10, 0.92)',
  tabActive: '#c9990a',
  tabInactive: '#5a5a5a',
}

export const gradients = {
  heroOverlay: ['transparent', 'rgba(10, 10, 10, 0.92)'] as const,
  heroOverlayFull: ['rgba(10,10,10,0.45)', 'rgba(10,10,10,0.95)'] as const,
  cardBottom: ['transparent', 'rgba(10, 10, 10, 0.97)'] as const,
  goldShimmer: ['#c9990a', '#e8d080', '#c9990a'] as const,
  darkSurface: ['#1a1a1a', '#0f0f0f'] as const,
  cityCard: ['rgba(10,10,10,0.1)', 'rgba(10,10,10,0.85)'] as const,
  tabBar: ['rgba(10,10,10,0)', 'rgba(10,10,10,0.97)'] as const,
}
