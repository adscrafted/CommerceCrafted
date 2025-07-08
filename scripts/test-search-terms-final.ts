// Final test script with exact date requirements for Amazon Search Terms Report
import dotenv from 'dotenv'
import { getAmazonSearchTermsService } from '../src/lib/amazon-search-terms-service'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function testSearchTermsReport() {
  console.log('Testing Amazon Search Terms Report Service...\n')
  
  const amazonSearchTermsService = getAmazonSearchTermsService()

  try {
    // For Brand Analytics reports with WEEK period:
    // - Start date must be Sunday at 00:00:00 UTC
    // - End date must be Saturday at 23:59:59 UTC
    // Let's use a specific week that we know should work
    
    const startDate = new Date('2025-06-29T00:00:00.000Z') // Sunday
    const endDate = new Date('2025-07-05T23:59:59.000Z')   // Saturday
    
    console.log('Test 1: Requesting search terms report...')
    console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`)
    console.log(`Start: ${startDate.toUTCString()} (${startDate.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })})`)
    console.log(`End: ${endDate.toUTCString()} (${endDate.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })})`)

    const reportMetadata = await amazonSearchTermsService.requestTopSearchTermsReport({
      startDate,
      endDate,
      marketplaceId: process.env.SP_API_MARKETPLACE_ID
    })
    
    console.log('\n✅ Report requested successfully!')
    console.log('Report ID:', reportMetadata.reportId)
    console.log('Status:', reportMetadata.processingStatus)

    // Poll for completion
    console.log('\nPolling for report completion...')
    let attempts = 0
    let currentStatus = reportMetadata

    while ((currentStatus.processingStatus === 'IN_QUEUE' || currentStatus.processingStatus === 'IN_PROGRESS') && attempts < 30) {
      attempts++
      console.log(`Attempt ${attempts}/30 - Status: ${currentStatus.processingStatus}`)
      
      await new Promise(resolve => setTimeout(resolve, 10000))
      currentStatus = await amazonSearchTermsService.getReportStatus(reportMetadata.reportId)
    }

    console.log(`\nFinal status: ${currentStatus.processingStatus}`)

    if (currentStatus.processingStatus === 'DONE' && currentStatus.reportDocumentId) {
      console.log('✅ Report completed successfully!')
      
      // Download the report
      console.log('\nDownloading report...')
      const csvData = await amazonSearchTermsService.downloadReport(currentStatus.reportDocumentId)
      console.log(`Downloaded ${csvData.length} bytes`)

      // Save raw CSV
      const fs = require('fs').promises
      const csvPath = `/tmp/search-terms-${Date.now()}.csv`
      await fs.writeFile(csvPath, csvData)
      console.log(`Raw CSV saved to: ${csvPath}`)

      // Parse the data
      console.log('\nParsing report data...')
      const searchTerms = amazonSearchTermsService.parseSearchTermsReport(csvData)
      console.log(`Parsed ${searchTerms.length} search terms`)

      // Show sample data
      if (searchTerms.length > 0) {
        console.log('\nTop 5 Search Terms:')
        searchTerms.slice(0, 5).forEach((term, i) => {
          console.log(`\n${i + 1}. "${term.searchTerm}"`)
          console.log(`   Rank: ${term.searchVolume}`)
          console.log(`   Click Share: ${(term.clickShare * 100).toFixed(2)}%`)
          console.log(`   Conversion Share: ${(term.conversionShare * 100).toFixed(2)}%`)
        })
      }

      // Save JSON
      const jsonPath = `/tmp/search-terms-${Date.now()}.json`
      await fs.writeFile(jsonPath, JSON.stringify(searchTerms, null, 2))
      console.log(`\nJSON results saved to: ${jsonPath}`)

    } else if (currentStatus.processingStatus === 'FATAL' && currentStatus.reportDocumentId) {
      console.error('❌ Report failed!')
      
      // Get error details
      const errorData = await amazonSearchTermsService.downloadReport(currentStatus.reportDocumentId)
      console.log('Error details:', errorData)
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error)
  }
}

// Run test
console.log('🚀 Starting Amazon Brand Analytics test...\n')
testSearchTermsReport()
  .then(() => console.log('\n✅ Test completed!'))
  .catch(console.error)