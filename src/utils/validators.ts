export const validators = {
  email: (value: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),

  password: (value: string): string | null => {
    if (value.length < 6) return 'Password must be at least 6 characters'
    return null
  },

  username: (value: string): string | null => {
    if (value.length < 3) return 'Username must be at least 3 characters'
    if (value.length > 30) return 'Username must be 30 characters or less'
    if (!/^[a-z0-9_]+$/.test(value)) return 'Only lowercase letters, numbers, and underscores'
    return null
  },

  url: (value: string): boolean => {
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  },

  phone: (value: string): boolean =>
    /^\+?[\d\s\-().]{10,}$/.test(value),

  required: (value: string): boolean =>
    value.trim().length > 0,

  maxLength: (value: string, max: number): boolean =>
    value.length <= max,

  minLength: (value: string, min: number): boolean =>
    value.length >= min,
}
