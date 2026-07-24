import { prisma } from './src/config/prisma.js'

async function main() {
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  console.log('Deleted products and categories')
}

main().finally(() => prisma.$disconnect())
