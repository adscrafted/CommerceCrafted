#!/usr/bin/env node

/**
 * Start Historical Data Backfill
 */

import { getBackfillService } from '../src/lib/backfill-service'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

async function main() {
  const maxWeeks = parseInt(process.argv[2]) || 2
  const marketplaceId = process.argv[3] || 'ATVPDKIKX0DER'

  console.log('🚀 Starting Historical Data Backfill')
  console.log('====================================\n')
  console.log(`📊 Max weeks to request: ${maxWeeks}`)
  console.log(`🌍 Marketplace: ${marketplaceId}`)
  console.log(`⏱️  Estimated time: ${maxWeeks * 15} minutes (15 min per report)\n`)

  try {
    const backfillService = getBackfillService()

    console.log('1️⃣  Checking missing weeks...')
    const missingWeeks = await backfillService.getMissingWeeksForBackfill(marketplaceId)
    console.log(`   📋 Found ${missingWeeks.length} total missing weeks`)
    
    if (missingWeeks.length === 0) {
      console.log('✅ No missing weeks! All data is up to date.')
      return
    }

    const weeksToProcess = missingWeeks.slice(0, maxWeeks)
    console.log(`   🎯 Will process ${weeksToProcess.length} weeks:`)
    weeksToProcess.forEach((week, i) => {
      console.log(`      ${i + 1}. ${week.toISOString().split('T')[0]}`)
    })

    console.log('\n2️⃣  Starting backfill process...')
    console.log('   ⚠️  This will take time due to Amazon API rate limits (15 min between requests)')
    console.log('   💡 You can stop with Ctrl+C and resume later\n')

    const results = await backfillService.backfillHistoricalData(maxWeeks, marketplaceId)

    console.log('\n📊 Backfill Results:')
    console.log('==================')
    console.log(`✅ Reports requested: ${results.requested.length}`)
    console.log(`⏭️  Reports skipped: ${results.skipped.length}`)
    console.log(`❌ Errors: ${results.errors.length}`)

    if (results.requested.length > 0) {
      console.log('\n📝 Requested Reports:')
      results.requested.forEach(report => console.log(`   • ${report}`))
    }

    if (results.skipped.length > 0) {
      console.log('\n⏭️  Skipped Reports:')
      results.skipped.forEach(report => console.log(`   • ${report}`))
    }

    if (results.errors.length > 0) {
      console.log('\n❌ Errors:')
      results.errors.forEach(error => console.log(`   • ${error}`))
    }

    console.log('\n🎯 Next Steps:')
    console.log('==============')
    if (results.requested.length > 0) {
      console.log('1. Wait for reports to be processed by Amazon (usually 15-30 minutes)')
      console.log('2. Check report status with: npm run check-reports')
      console.log('3. Process completed reports with: npm run process-reports')
      console.log('4. Continue with more weeks if needed')
    } else {
      console.log('1. Check the errors above if any')
      console.log('2. Verify Amazon SP-API credentials')
      console.log('3. Try again or contact support')
    }

    console.log('\n✅ Backfill request complete!')

  } catch (error) {
    console.error('\n❌ Backfill failed:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
    process.exit(1)
  }
}

main().catch(console.error)