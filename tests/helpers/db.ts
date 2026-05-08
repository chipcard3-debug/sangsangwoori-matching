import { createClient } from '@supabase/supabase-js'

// Public anon key — safe to use here (RLS disabled, test environment)
const SUPABASE_URL = 'https://xzvlhlsufywjatryxmca.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6dmxobHN1Znl3amF0cnl4bWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5OTMyMDIsImV4cCI6MjA5MzU2OTIwMn0.37BlbTLnt6FirxOWk1tAO7PULq6Dw88RRxHrdTFJWvE'

export const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// UUID that can never appear as a real row ID — used to satisfy the required filter
// while matching all rows (id != this impossible value = all rows).
const IMPOSSIBLE_UUID = '00000000-0000-0000-0000-000000000000'

export async function resetDb(): Promise<void> {
  // Delete in dependency order: matches first (FK to seniors & jobs), then seniors, then jobs.
  await db.from('matches').delete().neq('id', IMPOSSIBLE_UUID)
  await db.from('seniors').delete().neq('id', IMPOSSIBLE_UUID)
  await db.from('jobs').delete().neq('id', IMPOSSIBLE_UUID)
}

export async function insertJob(job: {
  title: string
  region: string
  job_type: string
  required_career: number
}): Promise<string> {
  const { data, error } = await db.from('jobs').insert(job).select('id').single()
  if (error || !data) throw new Error(`insertJob failed: ${error?.message}`)
  return data.id as string
}

/** Returns the single senior in the table. Throws if count is not exactly 1. */
export async function getOnlySenior(): Promise<{ id: string }> {
  const { data, error } = await db.from('seniors').select('id')
  if (error) throw new Error(`getOnlySenior failed: ${error.message}`)
  if (!data || data.length !== 1)
    throw new Error(`Expected exactly 1 senior but found ${data?.length ?? 0}`)
  return data[0]
}

export async function countSeniors(): Promise<number> {
  const { data, error } = await db.from('seniors').select('id')
  if (error) throw new Error(`countSeniors failed: ${error.message}`)
  return data?.length ?? 0
}
