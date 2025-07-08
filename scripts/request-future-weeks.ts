#!/usr/bin/env node

/**
 * Request reports for weeks after April up to present
 */

import { getBackfillService } from '../src/lib/backfill-service'
import { config } from 'dotenv'

config({ path: '.env.local' })

async function requestFutureWeeks() {
  const backfillService = getBackfillService()
  
  console.log('📅 Requesting Future Weeks (May-July 2025)')
  console.log('==========================================\n')

  try {
    // Get all missing weeks
    const missingWeeks = await backfillService.getMissingWeeksForBackfill()
    
    console.log(`📊 Analysis:`)
    console.log(`   🔍 Total missing weeks: ${missingWeeks.length}`)
    
    if (missingWeeks.length > 0) {
      const firstWeek = missingWeeks[0].toISOString().split('T')[0]
      const lastWeek = missingWeeks[missingWeeks.length - 1].toISOString().split('T')[0]
      console.log(`   📆 Date range: ${firstWeek} to ${lastWeek}`)
      
      // Show all missing weeks
      console.log('\n📋 Missing weeks:')
      missingWeeks.forEach((week, index) => {
        const weekStr = week.toISOString().split('T')[0]
        console.log(`   ${index + 1}. Week of ${weekStr}`)
      })
      
      // Request reports in batches to avoid rate limits
      console.log('\n🎯 Requesting reports from Amazon...')
      console.log('   ⏳ Rate limiting: 15 minutes between requests\n')
      
      const batchSize = 6 // Request 6 weeks at a time
      const results = await backfillService.backfillHistoricalData(batchSize, 'ATVPDKIKX0DER')
      
      console.log('📋 Request Results:')
      console.log(`   ✅ Successfully requested: ${results.requested.length}`)
      console.log(`   ⏭️  Skipped (already exist): ${results.skipped.length}`)
      console.log(`   ❌ Errors: ${results.errors.length}`)
      
      if (results.requested.length > 0) {
        console.log('\n📝 Requested Reports:')
        results.requested.forEach(req => console.log(`   • ${req}`))
      }
      
      if (results.skipped.length > 0) {
        console.log('\n⏭️  Skipped Reports:')
        results.skipped.forEach(skip => console.log(`   • ${skip}`))
      }
      
      if (results.errors.length > 0) {
        console.log('\n❌ Errors:')
        results.errors.forEach(err => console.log(`   • ${err}`))
      }
      
      console.log('\n📈 Progress:')
      const totalWeeks = missingWeeks.length
      const requestedWeeks = results.requested.length
      const progressPercent = ((requestedWeeks / totalWeeks) * 100).toFixed(1)
      console.log(`   🎯 Requested: ${requestedWeeks}/${totalWeeks} weeks (${progressPercent}%)`)
      
      if (requestedWeeks < totalWeeks) {
        const remainingWeeks = totalWeeks - requestedWeeks
        console.log(`   ⏳ Remaining: ${remainingWeeks} weeks`)
        console.log(`   💡 Re-run this script later to request remaining weeks`)
      }
      
    } else {
      console.log('✅ All weeks up to present are already processed!')
    }

  } catch (error) {
    console.error('❌ Error requesting future weeks:', error)
  }

  console.log('\n🔄 Next Steps:')
  console.log('=============')
  console.log('1. Monitor service is processing current reports')
  console.log('2. New reports will be processed as they complete (15-20 minutes each)')
  console.log('3. Check status: npm run check-upload-status')
  console.log('4. Continue requesting more weeks by re-running this script')
  console.log('\n⏱️  Amazon allows ~4-6 reports per hour due to rate limits')
}

requestFutureWeeks().catch(console.error)