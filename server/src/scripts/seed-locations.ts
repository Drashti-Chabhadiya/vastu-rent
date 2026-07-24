import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding locations...')

  // 1. Create / Find Country
  let india = await prisma.country.findFirst({
    where: { name: 'India' },
  })

  if (!india) {
    india = await prisma.country.create({
      data: {
        id: 101,
        name: 'India',
        iso2: 'IN',
        iso3: 'IND',
        phonecode: '91',
      },
    })
  }
  console.log('Country: India (ID: ' + india.id + ')')

  // 2. Create / Find States
  const states = [
    { id: 12, name: 'Gujarat', state_code: 'GJ' },
    { id: 20, name: 'Maharashtra', state_code: 'MH' },
    { id: 29, name: 'Rajasthan', state_code: 'RJ' },
    { id: 10, name: 'Delhi', state_code: 'DL' },
    { id: 17, name: 'Karnataka', state_code: 'KA' },
    { id: 31, name: 'Tamil Nadu', state_code: 'TN' },
  ]

  for (const s of states) {
    let state = await prisma.state.findFirst({
      where: { name: s.name, country_id: india.id },
    })

    if (!state) {
      state = await prisma.state.create({
        data: {
          id: s.id,
          name: s.name,
          country_id: india.id,
          state_code: s.state_code,
        },
      })
    }

    // 3. Create some sample cities for Gujarat
    if (s.name === 'Gujarat') {
      const cities = [
        { id: 1, name: 'Surat' },
        { id: 2, name: 'Ahmedabad' },
        { id: 3, name: 'Vadodara' },
        { id: 4, name: 'Rajkot' },
        { id: 5, name: 'Bhavnagar' },
        { id: 6, name: 'Jamnagar' },
        { id: 7, name: 'Gandhinagar' },
      ]
      for (const c of cities) {
        const existingCity = await prisma.city.findFirst({
          where: { name: c.name, state_id: state.id },
        })
        if (!existingCity) {
          await prisma.city.create({
            data: {
              id: c.id,
              name: c.name,
              state_id: state.id,
              country_id: india.id,
            },
          })
        }
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
