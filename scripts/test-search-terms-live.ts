// Live test script for Amazon Search Terms Report functionality
import dotenv from 'dotenv'
import { getAmazonSearchTermsService } from '../src/lib/amazon-search-terms-service'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function testSearchTermsReportLive() {
  console.log('Testing Amazon Search Terms Report Service with LIVE API...\n')
  
  const amazonSearchTermsService = getAmazonSearchTermsService()

  try {
    // Test 1: Request a new report for the last 7 days
    console.log('Test 1: Requesting new search terms report for last 7 days...')
    
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7) // Last 7 days

    console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`)
    console.log(`Marketplace: ${process.env.SP_API_MARKETPLACE_ID || 'ATVPDKIKX0DER'}`)

    const reportMetadata = await amazonSearchTermsService.requestTopSearchTermsReport({
      startDate,
      endDate,
      marketplaceId: process.env.SP_API_MARKETPLACE_ID
    })
    
    console.log('✅ Report requested successfully!')
    console.log('Report details:')
    console.log('- Report ID:', reportMetadata.reportId)
    console.log('- Report Type:', reportMetadata.reportType)
    console.log('- Status:', reportMetadata.processingStatus)
    console.log('- Created Time:', reportMetadata.createdTime)
    console.log('- Data Start Time:', reportMetadata.dataStartTime)
    console.log('- Data End Time:', reportMetadata.dataEndTime)

    // Test 2: Poll for report status
    console.log('\nTest 2: Checking report status...')
    let attempts = 0
    const maxAttempts = 30 // 5 minutes max (10 seconds between checks)
    let currentStatus = reportMetadata

    while (currentStatus.processingStatus === 'IN_QUEUE' || currentStatus.processingStatus === 'IN_PROGRESS') {
      attempts++
      console.log(`Attempt ${attempts}/${maxAttempts} - Status: ${currentStatus.processingStatus}`)
      
      if (attempts >= maxAttempts) {
        console.log('⚠️  Report generation is taking longer than expected. You may need to check back later.')
        break
      }

      // Wait 10 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 10000))
      
      currentStatus = await amazonSearchTermsService.getReportStatus(reportMetadata.reportId)
    }

    if (currentStatus.processingStatus === 'DONE' && currentStatus.reportDocumentId) {
      console.log('✅ Report generation completed!')
      console.log('Report Document ID:', currentStatus.reportDocumentId)

      // Test 3: Download and parse the report
      console.log('\nTest 3: Downloading report data...')
      const csvData = await amazonSearchTermsService.downloadReport(currentStatus.reportDocumentId)
      console.log(`✅ Report downloaded! Size: ${csvData.length} bytes`)

      // Test 4: Parse the report
      console.log('\nTest 4: Parsing report data...')
      const searchTerms = amazonSearchTermsService.parseSearchTermsReport(csvData)
      console.log(`✅ Successfully parsed ${searchTerms.length} search terms`)

      // Display top 10 search terms
      console.log('\nTop 10 Search Terms:')
      console.log('='.repeat(80))
      searchTerms.slice(0, 10).forEach((term, index) => {
        console.log(`${index + 1}. "${term.searchTerm}"`)
        console.log(`   - Search Frequency Rank: ${term.searchVolume}`)
        console.log(`   - Click Share: ${(term.clickShare * 100).toFixed(2)}%`)
        console.log(`   - Conversion Share: ${(term.conversionShare * 100).toFixed(2)}%`)
        console.log(`   - Relevance Score: ${term.relevance}`)
        if (term.clickedAsin) {
          console.log(`   - Top Clicked ASIN: ${term.clickedAsin}`)
        }
        if (term.clickedProductTitle) {
          console.log(`   - Top Product: ${term.clickedProductTitle.substring(0, 50)}...`)
        }
        console.log()
      })

      // Save full results to file for analysis
      const fs = require('fs').promises
      const outputPath = `/tmp/search-terms-${Date.now()}.json`
      await fs.writeFile(outputPath, JSON.stringify(searchTerms, null, 2))
      console.log(`\n✅ Full results saved to: ${outputPath}`)

    } else if (currentStatus.processingStatus === 'CANCELLED' || currentStatus.processingStatus === 'FATAL') {
      console.error(`❌ Report generation failed with status: ${currentStatus.processingStatus}`)
    }

  } catch (error) {
    console.error('\n❌ Error during live API test:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Stack trace:', error.stack)
    }
  }
}

// Run the live test
console.log('🚀 Starting live Amazon SP-API test...')
console.log('Note: This will use your API credits and may take several minutes.\n')

testSearchTermsReportLive()
  .then(() => {
    console.log('\n✅ Live test completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Live test failed:', error)
    process.exit(1)
  })