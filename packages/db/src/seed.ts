import { createDb } from './client'
import { organizations } from './schema'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL is required')

const db = createDb(databaseUrl)

async function seed() {
  console.log('Seeding database...')

  const org = await db.insert(organizations).values({
    name: 'Acme Corp',
    slug: 'acme-corp',
  }).returning().then(r => r[0]!)

  console.log(`Created organization: ${org.name} (${org.slug})`)

  console.log('Seed complete')
  process.exit(0)
}

void seed()
