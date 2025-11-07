/**
 * Migration script to create Supabase table and migrate carols data
 * 
 * Usage:
 * 1. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables (optional, defaults provided)
 * 2. Run: npx tsx scripts/migrate-to-supabase.ts
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rkyzvcaqnfsmeblztytx.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJreXp2Y2FxbmZzbWVibHp0eXR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0OTkxMjIsImV4cCI6MjA3ODA3NTEyMn0.IOuO7F535TrAswI3Xa93oaC8Fx-tNng6BfmuxtcX0JU'

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const carolsFilePath = path.join(process.cwd(), 'data', 'carols.json')

async function migrate() {
  try {
    console.log('Starting Supabase migration...')
    console.log('Supabase URL:', supabaseUrl)

    // Step 1: Read SQL migration file and execute it
    const sqlFilePath = path.join(process.cwd(), 'scripts', 'supabase-migration.sql')
    if (fs.existsSync(sqlFilePath)) {
      console.log('\n1. Creating table structure...')
      const sql = fs.readFileSync(sqlFilePath, 'utf8')
      
      // Split SQL into individual statements
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            const { error } = await supabase.rpc('exec_sql', { sql: statement })
            if (error) {
              // Try direct query if RPC doesn't work
              console.log('Note: Using direct query method (RPC may not be available)')
            }
          } catch (e) {
            // Continue - table might already exist
            console.log('Note: Some SQL statements may need to be run manually in Supabase dashboard')
          }
        }
      }
    } else {
      console.log('SQL file not found, skipping table creation. Please run the SQL manually in Supabase dashboard.')
    }

    // Step 2: Check if table exists by trying to query it
    console.log('\n2. Checking if carols table exists...')
    const { data: existingData, error: checkError } = await supabase
      .from('carols')
      .select('id')
      .limit(1)

    if (checkError) {
      console.error('Error checking table:', checkError.message)
      console.log('\n⚠️  Table might not exist yet. Please:')
      console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard')
      console.log('2. Navigate to SQL Editor')
      console.log('3. Run the SQL from scripts/supabase-migration.sql')
      console.log('4. Then run this script again')
      process.exit(1)
    }

    // Step 3: Read carols from file
    console.log('\n3. Reading carols from file...')
    if (!fs.existsSync(carolsFilePath)) {
      console.error(`Error: File not found: ${carolsFilePath}`)
      process.exit(1)
    }

    const buffer = fs.readFileSync(carolsFilePath)
    let fileContents: string
    if (buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
      fileContents = buffer.slice(3).toString('utf8')
    } else {
      fileContents = buffer.toString('utf8')
    }
    
    const carols = JSON.parse(fileContents)
    
    if (!Array.isArray(carols)) {
      console.error('Error: carols.json does not contain an array')
      process.exit(1)
    }

    console.log(`Found ${carols.length} carols in file`)

    // Step 4: Check if data already exists
    const { count } = await supabase
      .from('carols')
      .select('*', { count: 'exact', head: true })

    if (count && count > 0) {
      console.log(`\n⚠️  Warning: Table already contains ${count} carols.`)
      console.log('This will upsert (update existing, insert new) carols.')
      console.log('Press Ctrl+C to cancel, or wait 3 seconds to continue...')
      await new Promise(resolve => setTimeout(resolve, 3000))
    }

    // Step 5: Upsert carols (insert or update)
    console.log('\n4. Migrating carols to Supabase...')
    
    // Prepare data for upsert
    const carolsToUpsert = carols.map(carol => ({
      id: carol.id,
      name: carol.name,
      selected: carol.selected || false,
      branch: carol.branch || null,
      team: carol.team || null,
    }))

    // Upsert in batches to avoid timeout
    const batchSize = 10
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < carolsToUpsert.length; i += batchSize) {
      const batch = carolsToUpsert.slice(i, i + batchSize)
      const { data, error } = await supabase
        .from('carols')
        .upsert(batch, { onConflict: 'id' })

      if (error) {
        console.error(`Error upserting batch ${Math.floor(i / batchSize) + 1}:`, error.message)
        errorCount += batch.length
      } else {
        successCount += batch.length
        console.log(`Migrated ${successCount}/${carolsToUpsert.length} carols...`)
      }
    }

    if (errorCount > 0) {
      console.error(`\n✗ Migration completed with errors. ${errorCount} carols failed.`)
      process.exit(1)
    }

    // Step 6: Verify migration
    console.log('\n5. Verifying migration...')
    const { data: verifyData, error: verifyError } = await supabase
      .from('carols')
      .select('id')
      .order('id')

    if (verifyError) {
      console.error('Verification error:', verifyError.message)
      process.exit(1)
    }

    if (verifyData && verifyData.length === carols.length) {
      console.log(`✓ Successfully migrated ${carols.length} carols to Supabase`)
      console.log('✓ Migration verified successfully')
    } else {
      console.error(`✗ Verification failed. Expected ${carols.length}, got ${verifyData?.length || 0}`)
      process.exit(1)
    }

    console.log('\n✅ Migration completed successfully!')
    console.log('\nNext steps:')
    console.log('1. Set environment variables in your deployment:')
    console.log('   - NEXT_PUBLIC_SUPABASE_URL=' + supabaseUrl)
    console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY=' + supabaseAnonKey.substring(0, 20) + '...')
    console.log('2. The app will now use Supabase for data storage')

  } catch (error: any) {
    console.error('\n✗ Migration failed:', error.message)
    console.error(error)
    process.exit(1)
  }
}

migrate()

