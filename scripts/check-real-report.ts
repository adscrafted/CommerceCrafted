#!/usr/bin/env node

/**
 * Check Real Amazon Report Status
 * 
 * This script checks the status of the real Amazon report we generated earlier
 */

import { getAmazonSearchTermsService } from '../src/lib/amazon-search-terms-service'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

async function main() {
  console.log('🔍 Checking Real Amazon Report Status')
  console.log('====================================\n')

  const reportId = '1520270020276'

  try {
    const amazonService = getAmazonSearchTermsService()
    
    console.log(`📊 Checking report ${reportId}...`)
    
    // Check report status
    const status = await amazonService.getReportStatus(reportId)
    console.log(`   Status: ${status.processingStatus}`)
    
    if (status.processingStatus === 'DONE') {
      console.log(`   ✅ Report completed!`)
      console.log(`   📄 Document ID: ${status.reportDocumentId}`)
      
      // Get document info
      if (status.reportDocumentId) {
        const docInfo = await amazonService.getReportDocument(status.reportDocumentId)
        console.log(`   📦 File size: ${(docInfo.fileSize / 1024 / 1024 / 1024).toFixed(2)} GB`)
        console.log(`   🔗 Download URL available: ${!!docInfo.url}`)
        console.log(`   📅 Expires: ${new Date(docInfo.expiration).toLocaleString()}`)
        
        console.log('\n✅ Report is ready for processing!')
        console.log('\n📝 Next steps:')
        console.log('   1. Create proper database entry for this report')
        console.log('   2. Run the BigQuery pipeline to process the data')
      }
    } else {
      console.log(`   ⏳ Report still processing: ${status.processingStatus}`)
    }

  } catch (error) {
    console.error('\n❌ Failed to check report:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Could not find SELLING_PARTNER_APP_CLIENT_ID')) {
        console.error('\n💡 Amazon SP-API credentials missing or incorrect')
      }
    }
  }
}

main().catch(console.error)