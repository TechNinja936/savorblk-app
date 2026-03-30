import { Platform, TextStyle } from 'react-native'

// Font family names must match what's loaded via expo-font
export const fonts = {
  headline: 'PlayfairDisplay_400Regular',
  headlineMedium: 'PlayfairDisplay_500Medium',
  headlineSemiBold: 'PlayfairDisplay_600SemiBold',
  headlineBold: 'PlayfairDisplay_700Bold',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodySemiBold: 'DMSans_600SemiBold',
  bodyBold: 'DMSans_700Bold',
}

// All type styles return TextStyle objects
export const typography = {
  // ── Display (Hero text) ─────────────────────────────────
  displayXL: {
    fontFamily: fonts.headlineBold,
    fontSize: 40,
    lineHeight: 50,
    letterSpacing: -0.8,
  } as TextStyle,

  displayLG: {
    fontFamily: fonts.headlineBold,
    fontSize: 32,
    lineHeight: 42,
    letterSpacing: -0.5,
  } as TextStyle,

  displayMD: {
    fontFamily: fonts.headline,
    fontSize: 26,
    lineHeight: 34,
    letterSpacing: -0.3,
  } as TextStyle,

  // ── Headings ────────────────────────────────────────────
  h1: {
    fontFamily: fonts.headlineBold,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.2,
  } as TextStyle,

  h2: {
    fontFamily: fonts.headlineBold,
    fontSize: 22,
    lineHeight: 30,
    letterSpacing: -0.1,
  } as TextStyle,

  h3: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 18,
    lineHeight: 26,
  } as TextStyle,

  h4: {
    fontFamily: fonts.headlineMedium,
    fontSize: 16,
    lineHeight: 24,
  } as TextStyle,

  // ── Body ────────────────────────────────────────────────
  bodyLG: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 26,
  } as TextStyle,

  bodyMD: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
  } as TextStyle,

  bodySM: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
  } as TextStyle,

  // ── Labels ──────────────────────────────────────────────
  labelXL: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.1,
  } as TextStyle,

  labelLG: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  } as TextStyle,

  labelMD: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.2,
  } as TextStyle,

  labelSM: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.3,
  } as TextStyle,

  // ── Caption ─────────────────────────────────────────────
  caption: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.4,
  } as TextStyle,

  captionBold: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.4,
  } as TextStyle,

  // ── Buttons ─────────────────────────────────────────────
  buttonLG: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.2,
  } as TextStyle,

  buttonMD: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
  } as TextStyle,

  buttonSM: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.3,
  } as TextStyle,
}
