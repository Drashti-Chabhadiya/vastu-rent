/**
 * Better Auth session user shape.
 * This mirrors what Better Auth returns from getSession / useSession.
 */
export interface User {
  id: string
  name: string
  email: string
  image?: string | null
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Session {
  id: string
  userId: string
  expiresAt: Date
  token: string
  ipAddress?: string | null
  userAgent?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface SessionWithUser {
  session: Session
  user: User
}

// ─── Legacy input types (kept for form usage) ─────────────────────────────────

export interface CreateUserInput {
  name: string
  email: string
  password: string
}

export type LoginInput = {
  email: string
  password: string
}
