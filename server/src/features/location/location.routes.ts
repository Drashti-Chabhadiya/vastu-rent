import { FastifyInstance } from 'fastify'
import { prisma } from '../../config/prisma.js'

export default async function locationRoutes(fastify: FastifyInstance) {
  // GET /api/locations/countries
  fastify.get('/countries', async (request, reply) => {
    const countries = await prisma.country.findMany({
      take: 50,
      orderBy: { name: 'asc' },
    })
    return countries
  })

  // GET /api/locations/countries/search?q=ind
  fastify.get('/countries/search', async (request, reply) => {
    const { q } = request.query as { q?: string }
    if (!q) return []

    // If pg_trgm is not active, 'contains' still works (though it uses standard ILIKE)
    const countries = await prisma.country.findMany({
      where: { name: { contains: q, mode: 'insensitive' as const } },
      take: 20,
      orderBy: { name: 'asc' },
    })
    return countries
  })

  // GET /api/locations/states?countryId=xxx
  fastify.get('/states', async (request, reply) => {
    const { countryId } = request.query as { countryId?: string }
    if (!countryId) return reply.status(400).send({ error: 'countryId is required' })

    const states = await prisma.state.findMany({
      where: { country_id: parseInt(countryId) },
      orderBy: { name: 'asc' },
    })
    return states
  })

  // GET /api/locations/states/search?q=guj&countryId=101
  fastify.get('/states/search', async (request, reply) => {
    const { q, countryId } = request.query as { q?: string; countryId?: string }
    if (!q) return []

    const where: any = { name: { contains: q, mode: 'insensitive' as const } }
    if (countryId) where.country_id = parseInt(countryId)

    const states = await prisma.state.findMany({
      where,
      take: 20,
      orderBy: { name: 'asc' },
    })
    return states
  })

  // GET /api/locations/cities?stateId=xxx
  fastify.get('/cities', async (request, reply) => {
    const { stateId } = request.query as { stateId?: string }
    if (!stateId) return reply.status(400).send({ error: 'stateId is required' })

    const cities = await prisma.city.findMany({
      where: { state_id: parseInt(stateId) },
      take: 100, // Cities can be many, limit just in case
      orderBy: { name: 'asc' },
    })
    return cities
  })

  // GET /api/locations/cities/search?q=ahm&stateId=4030
  fastify.get('/cities/search', async (request, reply) => {
    const { q, stateId } = request.query as { q?: string; stateId?: string }
    if (!q) return []

    const where: any = { name: { contains: q, mode: 'insensitive' as const } }
    if (stateId) where.state_id = parseInt(stateId)

    const cities = await prisma.city.findMany({
      where,
      take: 20,
      orderBy: { name: 'asc' },
    })
    return cities
  })
}
