// Fixed test script for Amazon Search Terms Report functionality
import dotenv from 'dotenv'
import { getAmazonSearchTermsService } from '../src/lib/amazon-search-terms-service'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Helper function to get the last complete Sunday-Saturday week
function getLastCompleteWeek(): { startDate: Date, endDate: Date } {
  const today = new Date()
  const dayOfWeek = today.getDay()
  
  // Calculate days to go back to get to last Saturday
  const daysToLastSaturday = dayOfWeek === 0 ? 1 : dayOfWeek + 1
  
  const lastSaturday = new Date(today)
  lastSaturday.setDate(today.getDate() - daysToLastSaturday)
  lastSaturday.setUTCHours(23, 59, 59, 0)
  
  // Sunday is 6 days before Saturday
  const lastSunday = new Date(lastSaturday)
  lastSunday.setDate(lastSaturday.getDate() - 6)
  lastSunday.setUTCHours(0, 0, 0, 0)
  
  return { startDate: lastSunday, endDate: lastSaturday }
}

async function testSearchTermsReportFixed() {
  console.log('Testing Amazon Search Terms Report Service with FIXED dates...\n')
  
  const amazonSearchTermsService = getAmazonSearchTermsService()

  try {
    // Test 1: Request a new report with proper Sunday start date
    console.log('Test 1: Requesting new search terms report...')
    
    // Get last complete Sunday-Saturday week
    const { startDate, endDate } = getLastCompleteWeek()

    console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`)
    console.log(`Start date is: ${startDate.toLocaleDateString('en-US', { weekday: 'long' })}`)
    console.log(`End date is: ${endDate.toLocaleDateString('en-US', { weekday: 'long' })}`)
    console.log(`Marketplace: ${process.env.SP_API_MARKETPLACE_ID || 'ATVPDKIKX0DER'}`)

    const reportMetadata = await amazonSearchTermsService.requestTopSearchTermsReport({
      startDate,
      endDate,
      marketplaceId: process.env.SP_API_MARKETPLACE_ID
    })
    
    console.log('\n✅ Report requested successfully!')
    console.log('Report details:')
    console.log('- Report ID:', reportMetadata.reportId)
    console.log('- Report Type:', reportMetadata.reportType)
    console.log('- Status:', reportMetadata.processingStatus)

    // Test 2: Poll for report status
    console.log('\nTest 2: Checking report status...')
    let attempts = 0
    const maxAttempts = 30
    let currentStatus = reportMetadata

    while (currentStatus.processingStatus === 'IN_QUEUE' || currentStatus.processingStatus === 'IN_PROGRESS') {
      attempts++
      console.log(`Attempt ${attempts}/${maxAttempts} - Status: ${currentStatus.processingStatus}`)
      
      if (attempts >= maxAttempts) {
        console.log('⚠️  Report generation is taking longer than expected.')
        break
      }

      await new Promise(resolve => setTimeout(resolve, 10000))
      currentStatus = await amazonSearchTermsService.getReportStatus(reportMetadata.reportId)
    }

    if (currentStatus.processingStatus === 'DONE' && currentStatus.reportDocumentId) {
      console.log('\n✅ Report generation completed!')
      console.log('Report Document ID:', currentStatus.reportDocumentId)

      // Test 3: Download and parse the report
      console.log('\nTest 3: Downloading report data...')
      const csvData = await amazonSearchTermsService.downloadReport(currentStatus.reportDocumentId)
      console.log(`✅ Report downloaded! Size: ${csvData.length} bytes`)

      // Save raw CSV for inspection
      const fs = require('fs').promises
      await fs.writeFile('/tmp/search-terms-raw.csv', csvData)
      console.log('Raw CSV saved to: /tmp/search-terms-raw.csv')

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
        console.log()
      })

      // Save full results
      const outputPath = `/tmp/search-terms-${Date.now()}.json`
      await fs.writeFile(outputPath, JSON.stringify(searchTerms, null, 2))
      console.log(`\n✅ Full results saved to: ${outputPath}`)

    } else if (currentStatus.processingStatus === 'FATAL') {
      console.error(`\n❌ Report generation failed!`)
      
      if (currentStatus.reportDocumentId) {
        console.log('Downloading error details...')
        const errorData = await amazonSearchTermsService.downloadReport(currentStatus.reportDocumentId)
        console.log('Error details:', errorData)
      }
    }

  } catch (error) {
    console.error('\n❌ Error during test:', error)
  }
}

// Run the fixed test
console.log('🚀 Starting Amazon SP-API test with corrected dates...\n')

testSearchTermsReportFixed()
  .then(() => {
    console.log('\n✅ Test completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  })