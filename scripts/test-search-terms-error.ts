// Test script to download and check error report
import dotenv from 'dotenv'
import { getAmazonSearchTermsService } from '../src/lib/amazon-search-terms-service'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function checkErrorReport() {
  const amazonSearchTermsService = getAmazonSearchTermsService()
  
  // The report document ID from the failed report
  const reportDocumentId = 'amzn1.spdoc.1.4.na.3fb4d1b1-dc91-40b5-bddf-9ae07938b72d.T2A629VFCIL2EE.5600'
  
  try {
    console.log('Downloading error report...')
    const reportData = await amazonSearchTermsService.downloadReport(reportDocumentId)
    
    console.log('\nError Report Content:')
    console.log('='.repeat(80))
    console.log(reportData)
    console.log('='.repeat(80))
    
    // Save to file for analysis
    const fs = require('fs').promises
    await fs.writeFile('/tmp/error-report.txt', reportData)
    console.log('\nError report saved to: /tmp/error-report.txt')
    
  } catch (error) {
    console.error('Error downloading report:', error)
  }
}

checkErrorReport()