/**
 * Apply schema-v2.sql to Supabase
 * Run with: npx tsx scripts/apply-schema.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars. Run: source .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTablesExist() {
  // Check if organizations table exists
  const { data, error } = await supabase
    .from('organizations')
    .select('id')
    .limit(1)
  
  if (error && error.code === '42P01') {
    // Table doesn't exist
    return false
  }
  return true
}

async function applySchema() {
  console.log('Checking if tables exist...')
  
  const tablesExist = await checkTablesExist()
  if (tablesExist) {
    console.log('✓ Tables already exist. Skipping schema application.')
    return
  }

  console.log('Tables do not exist. Need to apply schema via Supabase Dashboard.')
  console.log('')
  console.log('Instructions:')
  console.log('1. Go to https://supabase.com/dashboard/project/rvnyntopwrciyrmsifgy/sql/new')
  console.log('2. Copy contents of supabase/schema-v2.sql')
  console.log('3. Paste and run')
  console.log('')
  console.log('Or use: supabase db push (if you have CLI linked)')
}

applySchema().catch(console.error)
