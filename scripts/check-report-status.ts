#!/usr/bin/env node

/**
 * Check Report Status
 */

import { AmazonSearchTermsService } from '../src/lib/amazon-search-terms-service'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

async function main() {
  const reportId = process.argv[2] || '1520518020276' // Default to the report we just created
  
  console.log('📊 Checking Report Status')
  console.log('========================\n')
  console.log(`Report ID: ${reportId}\n`)

  try {
    const amazonService = new AmazonSearchTermsService()
    
    const status = await amazonService.getReportStatus(reportId)
    
    console.log('📋 Report Details:')
    console.log(`   Status: ${status.processingStatus}`)
    console.log(`   Type: ${status.reportType}`)
    console.log(`   Created: ${status.createdTime}`)
    console.log(`   Data Period: ${status.dataStartTime} to ${status.dataEndTime}`)
    
    if (status.reportDocumentId) {
      console.log(`   Document ID: ${status.reportDocumentId}`)
      console.log('\n✅ Report is ready for download!')
      console.log('   Run: npm run process-report ' + reportId)
    } else {
      console.log('\n⏳ Report is still processing...')
      console.log('   Amazon typically takes 15-30 minutes to process reports')
      console.log('   Check again in a few minutes')
    }

  } catch (error) {
    console.error('❌ Error checking report:', error)
    if (error instanceof Error) {
      console.error('Details:', error.message)
    }
  }
}

main().catch(console.error)