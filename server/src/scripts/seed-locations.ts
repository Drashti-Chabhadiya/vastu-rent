import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding locations...')

  // 1. Create Country
  const india = await prisma.country.upsert({
    where: { name: 'India' },
    update: {},
    create: { name: 'India' },
  })
  console.log('Created country: India')

  // 2. Create States
  const states = [
    'Gujarat',
    'Maharashtra',
    'Rajasthan',
    'Delhi',
    'Karnataka',
    'Tamil Nadu',
  ]

  for (const stateName of states) {
    const state = await prisma.state.upsert({
      where: { name_countryId: { name: stateName, countryId: india.id } },
      update: {},
      create: { name: stateName, countryId: india.id },
    })

    // 3. Create some sample cities for Gujarat
    if (stateName === 'Gujarat') {
      const cities = [
        'Surat',
        'Ahmedabad',
        'Vadodara',
        'Rajkot',
        'Bhavnagar',
        'Jamnagar',
        'Gandhinagar',
      ]
      for (const cityName of cities) {
        await prisma.city.upsert({
          where: { name_stateId: { name: cityName, stateId: state.id } },
          update: {},
          create: { name: cityName, stateId: state.id },
        })
      }
    }
  }

  console.log('Finished seeding locations!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
