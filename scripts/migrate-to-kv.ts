/**
 * Migration script to copy carols data from file system to Vercel KV
 * 
 * Usage:
 * 1. Set KV_REST_API_URL, KV_REST_API_TOKEN, and KV_REST_API_READ_ONLY_TOKEN environment variables
 * 2. Run: npx tsx scripts/migrate-to-kv.ts
 */

import fs from 'fs'
import path from 'path'
import { kv } from '@vercel/kv'

const CAROLS_KEY = 'carols:data'
const carolsFilePath = path.join(process.cwd(), 'data', 'carols.json')

async function migrate() {
  try {
    // Check if KV is configured
    if (!process.env.KV_REST_API_URL) {
      console.error('Error: KV_REST_API_URL environment variable is not set')
      console.log('Please set KV_REST_API_URL, KV_REST_API_TOKEN, and KV_REST_API_READ_ONLY_TOKEN')
      process.exit(1)
    }

    // Read carols from file
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

    console.log(`Found ${carols.length} carols in file system`)

    // Check if KV already has data
    const existingData = await kv.get(CAROLS_KEY)
    if (existingData) {
      console.log('Warning: KV already contains data. This will overwrite it.')
      console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...')
      await new Promise(resolve => setTimeout(resolve, 5000))
    }

    // Write to KV
    await kv.set(CAROLS_KEY, carols)
    console.log(`Successfully migrated ${carols.length} carols to Vercel KV`)
    
    // Verify
    const verifyData = await kv.get(CAROLS_KEY) as any[]
    if (Array.isArray(verifyData) && verifyData.length === carols.length) {
      console.log('✓ Migration verified successfully')
    } else {
      console.error('✗ Migration verification failed')
      process.exit(1)
    }
  } catch (error: any) {
    console.error('Migration failed:', error.message)
    process.exit(1)
  }
}

migrate()

