import { auth } from '../../config/auth.js'
import { FastifyInstance } from 'fastify'
import { prisma } from '../../config/prisma.js'

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

  app.all('/*', async (request, reply) => {
    // Use the configured BETTER_AUTH_URL as the base for the handler URL.
    // This ensures Better Auth generates correct session tokens and callback URLs
    // using the canonical server origin, regardless of what host header arrives.
    const baseUrl =
      process.env.BETTER_AUTH_URL || `${request.protocol}://${request.hostname}`
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
