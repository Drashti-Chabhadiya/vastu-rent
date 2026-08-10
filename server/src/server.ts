import url from 'node:url'
import { app } from './app.js'
import { connectPrisma, prisma } from './config/prisma.js'
import awsLambdaFastify from '@fastify/aws-lambda'

let proxy: any

export const handler = async (event: any, context: any) => {
  if (!proxy) {
    await connectPrisma()
    proxy = awsLambdaFastify(app)
  }
  return proxy(event, context)
}

const isDirectExecution =
  import.meta.url === url.pathToFileURL(process.argv[1]).href

const startServer = async () => {
  try {
    await connectPrisma()

    await app.listen({
      port: Number(process.env.PORT) || 4000,
      host: '0.0.0.0',
    })
    console.log(
      '🚀 Server running on http://localhost:' + (process.env.PORT || 4000),
    )
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Initiating graceful shutdown...`)
  try {
    await prisma.$disconnect()
    await app.close()
    console.log('👋 Graceful shutdown completed. Exiting process.')
    process.exit(0)
  } catch (err: any) {
    console.error('❌ Error during graceful shutdown:', err.message)
    process.exit(1)
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))

if (isDirectExecution) {
  startServer()
}

export default async (req: any, res: any) => {
  await app.ready()
  app.server.emit('request', req, res)
}
