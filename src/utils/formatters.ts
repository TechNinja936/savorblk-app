/**
 * Currency — cents to formatted dollars
 * e.g. 1500 → "$15.00"
 */
export function formatCents(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

/**
 * Compact number
 * e.g. 1200 → "1.2K", 1500000 → "1.5M"
 */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

/**
 * Rating to one decimal
 * e.g. 4.333 → "4.3"
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1)
}

/**
 * Price range symbol → $/$$/$$$
 */
export function formatPriceRange(range: number | null | undefined): string {
  if (!range) return ''
  return '$'.repeat(Math.min(Math.max(range, 1), 4))
}

/**
 * Relative time
 * e.g. Date → "2 hours ago", "3 days ago"
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)
  const diffWk = Math.floor(diffDay / 7)
  const diffMo = Math.floor(diffDay / 30)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  if (diffWk < 5) return `${diffWk}w ago`
  if (diffMo < 12) return `${diffMo}mo ago`
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

/**
 * Date for event display
 * e.g. "Sat, Nov 2"
 */
export function formatEventDate(date: string | null | undefined): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })
}

/**
 * Date range
 * e.g. "Nov 1 – Nov 3, 2025"
 */
export function formatDateRange(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  if (s.getFullYear() !== e.getFullYear()) {
    return `${s.toLocaleDateString('en-US', { ...opts, year: 'numeric' })} – ${e.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`
  }
  return `${s.toLocaleDateString('en-US', opts)} – ${e.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`
}

/**
 * Phone number formatting
 * e.g. "5555555555" → "(555) 555-5555"
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return phone
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 1) + '…'
}

/**
 * Capitalize first letter
 */
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * Slug → Display name
 * e.g. "new-orleans" → "New Orleans"
 */
export function slugToTitle(slug: string): string {
  return slug.split('-').map(capitalize).join(' ')
}
