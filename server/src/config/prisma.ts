import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { readReplicas } from '@prisma/extension-read-replicas'
import 'dotenv/config'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment variables')
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const baseClient = new PrismaClient({ adapter })

// Parse comma-separated replica URLs from environment variables
const replicaUrls = process.env.DATABASE_URL_REPLICAS
  ? process.env.DATABASE_URL_REPLICAS.split(',')
      .map((url) => url.trim())
      .filter(Boolean)
  : []

// Initialize replica clients if any are configured
const replicaClients = replicaUrls.map((url) => {
  const replicaPool = new Pool({ connectionString: url })
  const replicaAdapter = new PrismaPg(replicaPool)
  return new PrismaClient({ adapter: replicaAdapter })
})

// Extend client with read replicas. If no replicas are configured, use baseClient as the replica.
export const prisma = baseClient.$extends(
  readReplicas({
    replicas: replicaClients.length > 0 ? replicaClients : [baseClient],
  }),
)

export async function connectPrisma() {
  try {
    await prisma.$connect()
    console.log(
      `🐘 Database connected successfully${replicaClients.length > 0 ? ` (with ${replicaClients.length} read replicas)` : ''}`,
    )
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      process.exit(1)
    }
  }
}
