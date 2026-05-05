import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { createDb } from './client'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL is required')

const db = createDb(databaseUrl)

await migrate(db, { migrationsFolder: './migrations' })

console.log('Migrations applied successfully')
process.exit(0)
