import { Linking } from 'react-native'

/**
 * Open Apple Maps / Google Maps directions to a business
 */
export function openDirections(
  lat: number,
  lng: number,
  label: string,
  platform: 'ios' | 'android' | 'web' = 'ios',
) {
  const encoded = encodeURIComponent(label)
  if (platform === 'ios') {
    Linking.openURL(`maps://?q=${encoded}&ll=${lat},${lng}`)
  } else {
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encoded}`)
  }
}

/**
 * Open phone dialer
 */
export function callPhone(phone: string) {
  Linking.openURL(`tel:${phone.replace(/\D/g, '')}`)
}

/**
 * Open a URL safely (handles http and custom schemes)
 */
export async function openURL(url: string): Promise<boolean> {
  try {
    const canOpen = await Linking.canOpenURL(url)
    if (canOpen) {
      await Linking.openURL(url)
      return true
    }
    return false
  } catch {
    return false
  }
}

/**
 * Build a SavorBLK deep link
 */
export const deepLinks = {
  business: (id: string) => `savorblk://business/${id}`,
  event: (id: string) => `savorblk://events/${id}`,
  profile: (username: string) => `savorblk://u/${username}`,
  list: (shareCode: string) => `savorblk://lists/${shareCode}`,
  guide: (id: string) => `savorblk://guides/${id}`,
  hbcu: (slug: string) => `savorblk://hbcu/${slug}`,
}

/**
 * Build a shareable web URL
 */
export const webLinks = {
  business: (id: string) => `https://savorblk.com/business/${id}`,
  event: (id: string) => `https://savorblk.com/events/${id}`,
  profile: (username: string) => `https://savorblk.com/u/${username}`,
  list: (shareCode: string) => `https://savorblk.com/lists/${shareCode}`,
  guide: (id: string) => `https://savorblk.com/guides/${id}`,
}
