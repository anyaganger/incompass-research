import { Pool } from '@neondatabase/serverless'

// Pool uses Neon's HTTP-based connection — safe and efficient in serverless.
// Each call creates a pool instance; Neon handles connection reuse internally.
export function getDb() {
  return new Pool({ connectionString: process.env.DATABASE_URL! })
}
