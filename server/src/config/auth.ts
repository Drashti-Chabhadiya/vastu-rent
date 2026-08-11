import { betterAuth, APIError } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './prisma.js'
import { admin, bearer } from 'better-auth/plugins'
import { sendVerificationEmail, sendResetPasswordEmail } from '../lib/mail.js'

const getHostName = (urlStr?: string) => {
  if (!urlStr) return ''
  try {
    const formatted =
      urlStr.startsWith('http://') || urlStr.startsWith('https://')
        ? urlStr
        : `https://${urlStr}`
    return new URL(formatted).host
  } catch {
    return ''
  }
}

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'yopmail.com',
  'tempmail.org',
  '10minutemail.com',
  'guerrillamail.com',
  'temp-mail.org',
  'throwawaymail.com',
  'getairmail.com',
  'trashmail.com',
])

export async function validateEmailForAbuse(email: string | undefined | null) {
  if (!email || typeof email !== 'string') return

  const lowerEmail = email.trim().toLowerCase()

  if (lowerEmail.includes('+')) {
    throw new APIError('BAD_REQUEST', {
      message: 'Email addresses with "+" aliases are not allowed.',
    })
  }

  const parts = lowerEmail.split('@')
  if (parts.length !== 2) return

  const [localPart, domain] = parts

  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    throw new APIError('BAD_REQUEST', {
      message: 'Disposable or temporary email addresses are not allowed.',
    })
  }

  // Dot normalization check for ALL domains
  const normalizedLocal = localPart.replace(/\./g, '')

  // Treat gmail.com and googlemail.com as the same domain family
  const isGmail = domain === 'gmail.com' || domain === 'googlemail.com'

  let existingUsers: any[] = []

  if (isGmail) {
    existingUsers = await prisma.$queryRaw<any[]>`
      SELECT id FROM "user" 
      WHERE REPLACE(SPLIT_PART(LOWER(email), '@', 1), '.', '') = ${normalizedLocal} 
      AND SPLIT_PART(LOWER(email), '@', 2) IN ('gmail.com', 'googlemail.com')
      LIMIT 1
    `
  } else {
    existingUsers = await prisma.$queryRaw<any[]>`
      SELECT id FROM "user" 
      WHERE REPLACE(SPLIT_PART(LOWER(email), '@', 1), '.', '') = ${normalizedLocal} 
      AND SPLIT_PART(LOWER(email), '@', 2) = ${domain}
      LIMIT 1
    `
  }

  if (existingUsers.length > 0) {
    throw new APIError('BAD_REQUEST', {
      message: 'An account with this email identity already exists.',
    })
  }
}

export const auth = betterAuth({
  /**
   * The base URL where the auth server is running.
   * Better Auth uses this to build callback/redirect URLs.
   */
  baseURL: {
    allowedHosts: [
      'vastu-rent.vercel.app',
      'localhost:4000',
      'localhost:3000',
      '127.0.0.1:4000',
      '127.0.0.1:3000',
      '127.0.0.1',
      '10.0.2.2:4000',
      '10.0.2.2:3000',
      '10.0.2.2',
      '*.vercel.app',
      getHostName(process.env.CLIENT_URL),
    ].filter(Boolean) as string[],
  },

  /**
   * Secret used to sign cookies and tokens.
   * Must be a long random string — keep it in .env only.
   */
  secret: process.env.BETTER_AUTH_SECRET,

  /**
   * Prisma adapter connects Better Auth to your PostgreSQL database.
   */
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  user: {
    additionalFields: {
      gender: { type: 'string', required: false },
      phone: { type: 'string', required: false },
      language: { type: 'string', required: false },
      dob: { type: 'string', required: false },
      currency: { type: 'string', required: false },
      twoFactorEnabled: { type: 'boolean', required: false },
      bookingAlerts: { type: 'boolean', required: false },
      settlementAlerts: { type: 'boolean', required: false },
      marketingAlerts: { type: 'boolean', required: false },
      subscriptionTier: { type: 'string', required: false },
      subscriptionExpiresAt: { type: 'date', required: false },
      stripeCustomerId: { type: 'string', required: false },
      stripeSubscriptionId: { type: 'string', required: false },
      showProfile: { type: 'boolean', required: false },
      showOnline: { type: 'boolean', required: false },
      allowData: { type: 'boolean', required: false },
      lastActive: { type: 'date', required: false },
      isGreenMember: { type: 'boolean', required: false },
      instagramUrl: { type: 'string', required: false },
      facebookUrl: { type: 'string', required: false },
      deviceFingerprint: { type: 'string', required: false },
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          await validateEmailForAbuse(user.email)

          if (user.deviceFingerprint) {
            const existing = await prisma.user.findFirst({
              where: { deviceFingerprint: user.deviceFingerprint },
            })
            if (existing) {
              throw new APIError('BAD_REQUEST', {
                message: 'Device already registered.',
              })
            }
          }
          return { data: user }
        },
      },
      update: {
        before: async (user) => {
          if (user.email) {
            await validateEmailForAbuse(user.email)
          }
          return { data: user }
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          // Delete all other sessions for this user to ensure single active session
          await prisma.session.deleteMany({
            where: { userId: session.userId },
          })
          return { data: session }
        },
      },
    },
  },

  /**
   * Enable email + password sign-up / sign-in.
   */
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }) => {
      await sendResetPasswordEmail({
        email: user.email,
        name: user.name || '',
        url,
        token,
      })
    },
  },

  /**
   * Hook up email verification sending logic.
   * NOTE: Using Direct SMTP (not BullMQ queue) for instant delivery on signup.
   * Queue-based sending added ~3-4 min delay due to remote Redis latency + retry backoff.
   */
  emailVerification: {
    sendOnSignUp: false, // Disabled: We use custom OTP flow
    sendVerificationEmail: async ({ user, url, token }) => {
      // Use queue-based (non-blocking) sending so signup responds instantly.
      // Direct SMTP blocks the request and times out on Render (port 587 restricted).
      await sendVerificationEmail({
        email: user.email,
        name: user.name || '',
        url,
        token,
      })
    },
  },

  /**
   * Allow cross-origin requests from the client dev server.
   * Better Auth will set the correct CORS headers automatically.
   */
  trustedOrigins: [
    // Local development
    'http://localhost:3000',
    'http://localhost',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:4000',
    'http://10.0.2.2:3000',
    'http://10.0.2.2:4000',
    // Capacitor WebView
    'capacitor://localhost',
    // Production web app (Vercel)
    'https://vastu-rent.vercel.app',
    process.env.CLIENT_URL,
  ].filter(Boolean) as string[],

  /**
   * Enable social authentication providers.
   */
  socialProviders: {
    google: {
      clientId: [
        process.env.GOOGLE_CLIENT_ID || '',
        process.env.GOOGLE_ANDROID_CLIENT_ID || '',
        process.env.GOOGLE_IOS_CLIENT_ID || '',
      ].filter(Boolean) as string[],
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
  },

  /**
   * Enable the admin plugin for role management.
   */
  plugins: [admin(), bearer()],
})

/**
 * Inferred type of the auth instance — useful for server-side type checking.
 */
export type Auth = typeof auth
