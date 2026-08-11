import { auth } from '../../config/auth.js'
import { FastifyInstance } from 'fastify'
import { prisma } from '../../config/prisma.js'
import { sendOtpEmail } from '../../lib/mail.js'
import { encrypt, decrypt } from '../../config/encryption.js'

export async function authRoutes(app: FastifyInstance) {
  app.get('/session-token', async (request, reply) => {
    const token =
      request.cookies['better-auth.session_token'] ||
      request.cookies['__Secure-better-auth.session_token']

    if (!token) {
      return reply
        .status(401)
        .send({ error: 'No session token found in cookies' })
    }

    return { sessionToken: token }
  })

  // Check if an email is already registered (used by signup form)
  app.get('/check-email', async (request, reply) => {
    const { email } = request.query as { email?: string }
    if (!email) {
      return reply.status(400).send({ error: 'Email is required' })
    }
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })
    return reply.send({ exists: !!user })
  })

  // Rate limiting configured globally or we can use local config
  app.post(
    '/send-otp',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '1 minute',
        },
      },
    },
    async (request, reply) => {
      const { email, name } = request.body as { email: string; name?: string }
      if (!email) {
        return reply.status(400).send({ error: 'Email is required' })
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      // Save to database
      await prisma.otpCode.upsert({
        where: { email },
        update: { code: otp, expiresAt, attempts: 0 },
        create: { email, code: otp, expiresAt },
      })

      // Send email
      await sendOtpEmail({ email, name: name || 'User', otp })

      // Set temporary backend OTP session cookie
      const sessionData = encrypt(JSON.stringify({ email, name }))
      reply.setCookie('vasturent_otp_session', sessionData, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 10 * 60, // 10 minutes (matching OTP expiry)
      })

      return reply.send({ success: true, message: 'OTP sent successfully' })
    },
  )

  app.get('/pending-verification', async (request, reply) => {
    const sessionCookie = request.cookies['vasturent_otp_session']
    if (!sessionCookie) {
      return reply.status(204).send() // No pending session
    }

    try {
      const decrypted = decrypt(sessionCookie)
      const data = JSON.parse(decrypted)
      return reply.send({ pending: true, email: data.email, name: data.name })
    } catch {
      // Invalid or expired cookie
      return reply.status(204).send()
    }
  })

  app.delete('/pending-verification', async (request, reply) => {
    const sessionCookie = request.cookies['vasturent_otp_session']
    if (sessionCookie) {
      try {
        const decrypted = decrypt(sessionCookie)
        const data = JSON.parse(decrypted)

        // Delete the unverified user if exists
        const user = await prisma.user.findUnique({
          where: { email: data.email },
        })
        if (user && !user.emailVerified) {
          await prisma.user.delete({ where: { id: user.id } })
        }

        // Delete any OTP for this email
        await prisma.otpCode.deleteMany({ where: { email: data.email } })
      } catch {
        // Ignore errors if cookie is invalid or user doesn't exist
      }
    }

    reply.clearCookie('vasturent_otp_session', { path: '/' })
    return reply.send({ success: true })
  })

  app.post(
    '/verify-otp',
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '1 minute',
        },
      },
    },
    async (request, reply) => {
      const { email, otp, visitorId } = request.body as {
        email: string
        otp: string
        visitorId?: string
      }

      if (!email || !otp) {
        return reply.status(400).send({ error: 'Email and OTP are required' })
      }

      const otpRecord = await prisma.otpCode.findUnique({ where: { email } })

      if (!otpRecord) {
        return reply.status(400).send({ error: 'No OTP found for this email' })
      }

      if (otpRecord.attempts >= 5) {
        return reply.status(400).send({
          error: 'Too many failed attempts. Please request a new OTP.',
        })
      }

      if (otpRecord.expiresAt < new Date()) {
        return reply.status(400).send({ error: 'OTP has expired' })
      }

      if (otpRecord.code !== otp) {
        await prisma.otpCode.update({
          where: { email },
          data: { attempts: { increment: 1 } },
        })
        return reply.status(400).send({ error: 'Invalid OTP' })
      }

      // OTP is valid, let's verify user
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) {
        return reply.status(404).send({ error: 'User not found' })
      }

      // Check device fingerprint for free trial
      let freeTrialEligible = false

      if (visitorId) {
        const existingDevice = await prisma.user.findFirst({
          where: { deviceFingerprint: visitorId, id: { not: user.id } },
        })

        if (existingDevice) {
          // Device already used for a free trial.
          await prisma.user.update({
            where: { id: user.id },
            data: {
              emailVerified: true,
              deviceFingerprint: visitorId,
              freeListings: 0,
            },
          })
          await prisma.otpCode.delete({ where: { email } })
          return reply.send({
            success: true,
            freeTrialEligible: false,
            message:
              'An account has already been created on this device. Please log in using your existing account.',
          })
        }

        // Device is new, eligible for free trial
        freeTrialEligible = true
      }

      // Update user as verified and give free listings ONLY if eligible
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          deviceFingerprint: visitorId || null,
          freeListings: freeTrialEligible ? 5 : 0,
        },
      })

      // Clean up OTP
      await prisma.otpCode.delete({ where: { email } })

      // Clear the temporary backend OTP session cookie
      reply.clearCookie('vasturent_otp_session', { path: '/' })

      return reply.send({
        success: true,
        freeTrialEligible: freeTrialEligible,
        message: freeTrialEligible
          ? 'Email verified and free trial activated!'
          : 'Email verified successfully!',
      })
    },
  )

  app.all('/*', async (request, reply) => {
    // Use the configured BETTER_AUTH_URL as the base for the handler URL.
    // This ensures Better Auth generates correct session tokens and callback URLs
    // using the canonical server origin, regardless of what host header arrives.
    const baseUrl =
      process.env.CLIENT_URL || `${request.protocol}://${request.hostname}`
    const url = `${baseUrl}${request.url}`

    // Serialize body for POST/PUT/PATCH requests
    let body: string | undefined
    if (request.method !== 'GET' && request.method !== 'HEAD' && request.body) {
      body =
        typeof request.body === 'string'
          ? request.body
          : JSON.stringify(request.body)
    }

    const req = new Request(url, {
      method: request.method,
      headers: request.headers as Record<string, string>,
      body,
    })

    const response = await auth.handler(req)

    reply.status(response.status)
    response.headers.forEach((value: string, key: string) => {
      reply.header(key, value)
    })

    const responseText = await response.text()
    if (response.status === 200 && request.url.includes('/get-session')) {
      try {
        const json = JSON.parse(responseText)
        if (json?.user?.id) {
          const addresses = await prisma.address.findMany({
            where: { userId: json.user.id },
            orderBy: { createdAt: 'desc' },
          })
          json.user.address = addresses[0] || null
          return reply.send(JSON.stringify(json))
        }
      } catch (err) {
        console.error(
          'Failed to attach addresses to get-session response:',
          err,
        )
      }
    }

    return reply.send(responseText)
  })
}
