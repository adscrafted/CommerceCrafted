// Check the status of our earlier report and retrieve data if ready
import dotenv from 'dotenv'
import { getAmazonSearchTermsService } from '../src/lib/amazon-search-terms-service'
import { prisma } from '../src/lib/prisma'
import { getReportPollingService } from '../src/lib/report-polling-service'

dotenv.config({ path: '.env.local' })

async function checkExistingReport() {
  const amazonReportId = '1520270020276' // The report we created earlier
  
  console.log(`Checking status of report ${amazonReportId}...\n`)

  try {
    // First, let's check if this report exists in our database
    let report = await prisma.amazonReport.findUnique({
      where: { amazonReportId },
      include: {
        reportData: true,
        searchTerms: {
          take: 5,
          orderBy: { searchVolume: 'asc' }
        }
      }
    })

    if (report) {
      console.log('✅ Report found in database!')
      console.log(`Status: ${report.status}`)
      console.log(`Created: ${report.createdAt}`)
      
      if (report.reportData) {
        console.log(`Records: ${report.reportData.recordCount}`)
        
        if (report.searchTerms.length > 0) {
          console.log('\nTop 5 search terms:')
          report.searchTerms.forEach((term, i) => {
            console.log(`${i + 1}. "${term.term}" - Rank: ${term.searchVolume}`)
          })
        }
      }
    } else {
      console.log('Report not in database. Checking Amazon directly...')
      
      // Check the current status from Amazon
      const service = getAmazonSearchTermsService()
      const status = await service.getReportStatus(amazonReportId)
      
      console.log('Amazon API Status:', JSON.stringify(status, null, 2))
      
      if (status.processingStatus === 'DONE' && status.reportDocumentId) {
        console.log('\n✅ Report is complete! Downloading and processing...')
        
        // Download the report
        const csvData = await service.downloadReport(status.reportDocumentId)
        console.log(`Downloaded ${csvData.length} bytes of data`)
        
        // Save raw CSV
        const fs = require('fs').promises
        const csvPath = `/tmp/report-${amazonReportId}.csv`
        await fs.writeFile(csvPath, csvData)
        console.log(`Raw CSV saved to: ${csvPath}`)
        
        // Parse the data
        const searchTerms = service.parseSearchTermsReport(csvData)
        console.log(`\nParsed ${searchTerms.length} search terms`)
        
        // Show top 10
        console.log('\nTop 10 search terms by volume:')
        searchTerms.slice(0, 10).forEach((term, i) => {
          console.log(`${i + 1}. "${term.searchTerm}"`)
          console.log(`   - Search Frequency Rank: ${term.searchVolume}`)
          console.log(`   - Click Share: ${(term.clickShare * 100).toFixed(2)}%`)
          console.log(`   - Conversion Share: ${(term.conversionShare * 100).toFixed(2)}%`)
          if (term.clickedAsin) {
            console.log(`   - Top ASIN: ${term.clickedAsin}`)
          }
          console.log()
        })
        
        // Save to database for future use
        console.log('Would you like to save this report to the database? (Implement user/report creation as needed)')
        
        // Save JSON for analysis
        const jsonPath = `/tmp/report-${amazonReportId}.json`
        await fs.writeFile(jsonPath, JSON.stringify(searchTerms, null, 2))
        console.log(`\nFull results saved to: ${jsonPath}`)
        
      } else if (status.processingStatus === 'IN_PROGRESS') {
        console.log('\n⏳ Report is still processing...')
        console.log('This is normal - Brand Analytics reports can take 30+ minutes')
        
        // We could add this to our database and start polling
        console.log('\nWould you like to add this report to the polling system? (Implement as needed)')
        
      } else if (status.processingStatus === 'FATAL') {
        console.log('\n❌ Report failed')
        if (status.reportDocumentId) {
          const error = await service.downloadReport(status.reportDocumentId)
          console.log('Error details:', error)
        }
      }
    }

  } catch (error) {
    console.error('Error checking report:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the check
checkExistingReport()
  .then(() => console.log('\n✅ Check completed'))
  .catch(console.error)