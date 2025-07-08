#!/usr/bin/env node

/**
 * Debug Backfill Service
 */

import { getDuplicatePreventionService } from '../src/lib/duplicate-prevention-service'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

async function main() {
  console.log('🔍 Debugging Backfill Service')
  console.log('==============================\n')

  try {
    const duplicateService = getDuplicatePreventionService()

    console.log('1️⃣  Testing getMissingWeeks directly...')
    
    const startDate = '2025-04-06'
    const endDate = '2025-06-29'
    
    console.log(`   📅 Start date: ${startDate}`)
    console.log(`   📅 End date: ${endDate}`)
    
    const missingWeekStrings = await duplicateService.getMissingWeeks(startDate, endDate)
    
    console.log(`   📊 Returned ${missingWeekStrings.length} missing weeks`)
    console.log('   📋 Raw data:')
    
    missingWeekStrings.forEach((week, i) => {
      console.log(`      ${i + 1}. "${week}" (type: ${typeof week})`)
      
      // Try to create date
      try {
        const date1 = new Date(week)
        const date2 = new Date(week + 'T00:00:00.000Z')
        console.log(`         Date1: ${date1.toISOString()} (valid: ${!isNaN(date1.getTime())})`)
        console.log(`         Date2: ${date2.toISOString()} (valid: ${!isNaN(date2.getTime())})`)
      } catch (e) {
        console.log(`         Error creating date: ${e.message}`)
      }
    })

  } catch (error) {
    console.error('❌ Debug failed:', error)
    if (error instanceof Error) {
      console.error('   Error details:', error.message)
    }
  }
}

main().catch(console.error)