// Test script for Amazon Search Terms Report functionality
import dotenv from 'dotenv'
import { getAmazonSearchTermsService } from '../src/lib/amazon-search-terms-service'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function testSearchTermsReport() {
  console.log('Testing Amazon Search Terms Report Service...\n')
  
  const amazonSearchTermsService = getAmazonSearchTermsService()

  // Test 1: Get cached data (for development)
  console.log('Test 1: Getting cached search terms data...')
  try {
    const cachedData = await amazonSearchTermsService.getCachedSearchTerms()
    console.log(`✅ Successfully retrieved ${cachedData.length} cached search terms`)
    console.log('Sample data:', cachedData.slice(0, 3))
  } catch (error) {
    console.error('❌ Failed to get cached data:', error)
  }

  // Test 2: Request a new report (comment out if you don't want to use API credits)
  console.log('\nTest 2: Requesting new search terms report...')
  console.log('⚠️  This test is commented out to avoid using API credits')
  console.log('Uncomment the code below to test actual API calls')
  
  /*
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7) // Last 7 days

    const reportMetadata = await amazonSearchTermsService.requestTopSearchTermsReport({
      startDate,
      endDate,
      marketplaceId: process.env.SP_API_MARKETPLACE_ID
    })
    
    console.log('✅ Report requested successfully:')
    console.log('Report ID:', reportMetadata.reportId)
    console.log('Status:', reportMetadata.processingStatus)
    console.log('Type:', reportMetadata.reportType)

    // Test 3: Check report status
    console.log('\nTest 3: Checking report status...')
    const status = await amazonSearchTermsService.getReportStatus(reportMetadata.reportId)
    console.log('✅ Report status:', status.processingStatus)

    // Test 4: Complete workflow (request, wait, download)
    console.log('\nTest 4: Running complete workflow...')
    console.log('This may take several minutes as we wait for the report to generate...')
    
    const searchTerms = await amazonSearchTermsService.getTopSearchTerms({
      startDate,
      endDate,
      marketplaceId: process.env.SP_API_MARKETPLACE_ID,
      maxWaitTime: 5 * 60 * 1000 // 5 minutes
    })

    console.log(`✅ Successfully retrieved ${searchTerms.length} search terms`)
    console.log('Top 5 search terms:')
    searchTerms.slice(0, 5).forEach((term, index) => {
      console.log(`${index + 1}. "${term.searchTerm}" - Volume: ${term.searchVolume}, Click Share: ${term.clickShare}%`)
    })

  } catch (error) {
    console.error('❌ Error during API tests:', error)
  }
  */

  // Test API endpoint (requires running server)
  console.log('\nTest 5: Testing API endpoint...')
  console.log('To test the API endpoint, run the development server and use:')
  console.log('POST /api/amazon/search-terms')
  console.log('Body: {')
  console.log('  "startDate": "2024-01-01T00:00:00Z",')
  console.log('  "endDate": "2024-01-07T23:59:59Z",')
  console.log('  "useCache": true')
  console.log('}')
}

// Run tests
testSearchTermsReport()
  .then(() => {
    console.log('\n✅ All tests completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  })