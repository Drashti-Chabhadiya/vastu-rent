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
    if (!countryId)
      return reply.status(400).send({ error: 'countryId is required' })

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
    if (!stateId)
      return reply.status(400).send({ error: 'stateId is required' })

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

  // GET /api/locations/pincode/:code
  fastify.get('/pincode/:code', async (request, reply) => {
    const { code } = request.params as { code: string }
    const cleanCode = code?.trim()

    if (!cleanCode || !/^[1-9][0-9]{5}$/.test(cleanCode)) {
      return reply
        .status(400)
        .send({ valid: false, message: 'Invalid 6-digit Pincode format' })
    }

    // 1. Check PostgreSQL Database first
    const existingPincode = await prisma.pincode.findUnique({
      where: { pincode: cleanCode },
    })

    if (existingPincode) {
      return {
        valid: true,
        pincode: existingPincode.pincode,
        district: existingPincode.district,
        state: existingPincode.state,
        country: existingPincode.country,
        source: 'database',
      }
    }

    // 2. Fetch from External Free API if not in DB
    try {
      const res = await fetch(
        `https://api.postalpincode.in/pincode/${cleanCode}`,
      )
      const data = (await res.json()) as any

      if (
        Array.isArray(data) &&
        data[0]?.Status === 'Success' &&
        data[0]?.PostOffice?.length > 0
      ) {
        const postOffice = data[0].PostOffice[0]
        const district =
          postOffice.District || postOffice.Block || postOffice.Name || ''
        const state = postOffice.State || ''

        // Save to Database for future instant lookups
        const saved = await prisma.pincode.create({
          data: {
            pincode: cleanCode,
            district,
            state,
            country: 'India',
          },
        })

        return {
          valid: true,
          pincode: saved.pincode,
          district: saved.district,
          state: saved.state,
          country: saved.country,
          source: 'api_fetched',
        }
      }
    } catch (err) {
      // Fallback or ignore fetch error
    }

    // Secondary fallback to Zippopotam
    try {
      const res = await fetch(`https://api.zippopotam.us/in/${cleanCode}`)
      if (res.ok) {
        const data = (await res.json()) as any
        if (data?.places?.length > 0) {
          const district = data.places[0]['place name'] || ''
          const state = data.places[0]['state'] || ''

          const saved = await prisma.pincode.create({
            data: {
              pincode: cleanCode,
              district,
              state,
              country: 'India',
            },
          })

          return {
            valid: true,
            pincode: saved.pincode,
            district: saved.district,
            state: saved.state,
            country: saved.country,
            source: 'api_fetched',
          }
        }
      }
    } catch (err) {
      // Fallback error
    }

    return reply
      .status(404)
      .send({
        valid: false,
        message: 'Invalid Pincode. Please check your 6-digit postal code.',
      })
  })
}
