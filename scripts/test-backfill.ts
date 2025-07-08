#!/usr/bin/env node

/**
 * Test Backfill Service
 */

import { getBackfillService } from '../src/lib/backfill-service'
import { getDuplicatePreventionService } from '../src/lib/duplicate-prevention-service'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

async function main() {
  console.log('🔄 Testing Backfill Service')
  console.log('===========================\n')

  try {
    const backfillService = getBackfillService()
    const duplicateService = getDuplicatePreventionService()

    console.log('1️⃣  Checking current data coverage...')
    
    // Check if we have any data for the current week
    const currentWeekExists = await duplicateService.isWeekAlreadyProcessed('2025-06-29')
    console.log(`   📅 Current week (2025-06-29) exists: ${currentWeekExists}`)

    console.log('\n2️⃣  Finding maximum backfill date...')
    const maxBackfillDate = await backfillService.getMaxBackfillDate()
    console.log(`   📆 Can backfill up to: ${maxBackfillDate.toISOString().split('T')[0]}`)

    console.log('\n3️⃣  Finding missing weeks...')
    const missingWeeks = await backfillService.getMissingWeeksForBackfill()
    console.log(`   📊 Total missing weeks: ${missingWeeks.length}`)
    
    if (missingWeeks.length > 0) {
      console.log('   📋 Missing weeks:')
      missingWeeks.slice(0, 10).forEach((week, i) => {
        console.log(`      ${i + 1}. ${week.toISOString().split('T')[0]}`)
      })
      if (missingWeeks.length > 10) {
        console.log(`      ... and ${missingWeeks.length - 10} more weeks`)
      }
    }

    console.log('\n4️⃣  Backfill recommendations:')
    if (missingWeeks.length === 0) {
      console.log('   ✅ No missing weeks found! All historical data is up to date.')
    } else {
      const estimatedTime = missingWeeks.length * 15
      console.log(`   ⏱️  Estimated time to backfill all: ${estimatedTime} minutes`)
      console.log(`   📝 Recommended approach:`)
      console.log(`      - Start with 2-3 weeks to test the system`)
      console.log(`      - Use: npm run backfill-start 3`)
      console.log(`      - Monitor progress and continue in batches`)
      
      console.log('\n   🎯 Next steps to start backfill:')
      console.log('      1. Review the missing weeks above')
      console.log('      2. Ensure Amazon SP-API credentials are working')
      console.log('      3. Run: npm run backfill-start 2  (for 2 weeks)')
      console.log('      4. Monitor report status and processing')
    }

    console.log('\n✅ Backfill analysis complete!')

  } catch (error) {
    console.error('❌ Backfill test failed:', error)
    if (error instanceof Error) {
      console.error('   Error details:', error.message)
    }
  }
}

main().catch(console.error)