import { prisma } from '../config/prisma.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function downloadFile(url: string, dest: string): Promise<void> {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
    console.log(`File ${dest} already exists. Skipping download.`)
    return
  }
  console.log(`Fetching ${url}...`)
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.statusText}`)
  }
  const text = await res.text()
  fs.writeFileSync(dest, text, 'utf-8')
}

async function main() {
  const dataDir = path.join(__dirname, '../../data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  const allDataFile = path.join(dataDir, 'countries+states+cities.json')

  console.log('Downloading dataset...')
  await downloadFile(
    'https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/json/countries+states+cities.json',
    allDataFile,
  )

  console.log('Parsing JSON file...')
  const rawData = fs.readFileSync(allDataFile, 'utf-8')
  const allData = JSON.parse(rawData)

  const countriesPayload: any[] = []
  const statesPayload: any[] = []
  const citiesPayload: any[] = []

  for (const country of allData) {
    countriesPayload.push({
      id: country.id,
      name: country.name,
      iso2: country.iso2,
      iso3: country.iso3,
      phonecode: country.phone_code,
      emoji: country.emoji,
    })

    if (Array.isArray(country.states)) {
      for (const state of country.states) {
        statesPayload.push({
          id: state.id,
          country_id: country.id,
          name: state.name,
          state_code: state.state_code,
        })

        if (Array.isArray(state.cities)) {
          for (const city of state.cities) {
            citiesPayload.push({
              id: city.id,
              state_id: state.id,
              country_id: country.id,
              name: city.name,
              latitude: city.latitude,
              longitude: city.longitude,
            })
          }
        }
      }
    }
  }

  console.log(
    `Parsed ${countriesPayload.length} countries, ${statesPayload.length} states, ${citiesPayload.length} cities.`,
  )

  console.log('Inserting Countries...')
  await prisma.country.createMany({
    data: countriesPayload,
    skipDuplicates: true,
  })

  console.log('Inserting States...')
  const chunkSize = 5000
  for (let i = 0; i < statesPayload.length; i += chunkSize) {
    const chunk = statesPayload.slice(i, i + chunkSize)
    await prisma.state.createMany({ data: chunk, skipDuplicates: true })
  }

  console.log('Inserting Cities...')
  for (let i = 0; i < citiesPayload.length; i += chunkSize) {
    const chunk = citiesPayload.slice(i, i + chunkSize)
    await prisma.city.createMany({ data: chunk, skipDuplicates: true })
    if (i % 50000 === 0) {
      console.log(`Inserted ${i} / ${citiesPayload.length} cities...`)
    }
  }

  console.log('Adding pg_trgm extension and GIN indexes...')
  try {
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`)
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS idx_country_name_gin ON countries USING GIN (name gin_trgm_ops);`,
    )
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS idx_state_name_gin ON states USING GIN (name gin_trgm_ops);`,
    )
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS idx_city_name_gin ON cities USING GIN (name gin_trgm_ops);`,
    )
    console.log('Successfully created GIN indexes.')
  } catch (err) {
    console.warn(
      'Could not create GIN indexes. Make sure PostgreSQL user has superuser privileges or pg_trgm is allowed.',
      err,
    )
  }

  console.log('Seeding completed successfully!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
