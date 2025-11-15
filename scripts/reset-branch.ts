/**
 * Script to delete submissions and reset carols for a specific branch
 * 
 * Usage:
 *   npx tsx scripts/reset-branch.ts KELANIYA
 *   or
 *   npm run reset-branch -- KELANIYA
 */

import { deleteBranchData } from '../lib/storage'

async function main() {
  const branchName = process.argv[2]

  if (!branchName) {
    console.error('Error: Branch name is required')
    console.log('Usage: npx tsx scripts/reset-branch.ts <BRANCH_NAME>')
    console.log('Example: npx tsx scripts/reset-branch.ts KELANIYA')
    process.exit(1)
  }

  try {
    console.log(`\n🔄 Resetting data for branch: ${branchName}`)
    console.log('=' .repeat(50))
    
    const result = await deleteBranchData(branchName)
    
    console.log('\n✅ Success!')
    console.log(`   - Deleted ${result.submissionsDeleted} submission(s)`)
    console.log(`   - Reset ${result.carolsReset} carol(s)`)
    console.log('\n' + '='.repeat(50))
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

main()

