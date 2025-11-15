/**
 * Script to check carols in Supabase database
 * 
 * Usage:
 *   npx tsx scripts/check-supabase-carols.ts
 */

import { getCarols } from '../lib/storage'

async function main() {
  try {
    console.log('\n🔍 Checking carols in Supabase...')
    console.log('=' .repeat(50))
    
    const carols = await getCarols()
    
    console.log(`\nTotal carols: ${carols.length}`)
    
    const selectedCarols = carols.filter(c => c.selected)
    console.log(`Selected carols: ${selectedCarols.length}`)
    
    if (selectedCarols.length > 0) {
      console.log('\n📋 Selected Carols:')
      console.log('-'.repeat(50))
      selectedCarols.forEach(c => {
        console.log(`  ID: ${c.id}`)
        console.log(`  Name: ${c.name}`)
        console.log(`  Branch: ${c.branch || '(none)'}`)
        console.log(`  Team: ${c.team || '(none)'}`)
        console.log(`  Selected: ${c.selected}`)
        console.log('-'.repeat(50))
      })
    } else {
      console.log('\n⚠️  No selected carols found')
    }
    
    // Check for KELANIYA specifically
    const kelaniyaCarols = carols.filter(c => 
      c.branch && c.branch.toUpperCase().includes('KELANIYA')
    )
    
    if (kelaniyaCarols.length > 0) {
      console.log(`\n🎯 KELANIYA carols: ${kelaniyaCarols.length}`)
      kelaniyaCarols.forEach(c => {
        console.log(`  - ${c.name} (ID: ${c.id}, Selected: ${c.selected}, Team: ${c.team || 'N/A'})`)
      })
    } else {
      console.log('\n⚠️  No carols found for KELANIYA')
    }
    
    console.log('\n' + '='.repeat(50))
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

main()

