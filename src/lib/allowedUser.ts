import type { User } from 'firebase/auth'

export const ALLOWED_EMAIL = 'rinijoseph87@gmail.com'

export function isAllowedUser(user: User | null): boolean {
  if (!user?.email || !user.emailVerified) return false
  return user.email.toLowerCase() === ALLOWED_EMAIL
}
