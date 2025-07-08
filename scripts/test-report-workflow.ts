// Test script to demonstrate the complete report workflow
import dotenv from 'dotenv'
import { getReportPollingService } from '../src/lib/report-polling-service'
import { prisma } from '../src/lib/prisma'

dotenv.config({ path: '.env.local' })

async function testReportWorkflow() {
  console.log('Testing complete report workflow...\n')

  try {
    // 1. Start the polling service
    console.log('1. Starting polling service...')
    const pollingService = getReportPollingService()
    await pollingService.startPolling()
    console.log('✅ Polling service started\n')

    // 2. Create a test user (or use existing)
    console.log('2. Setting up test user...')
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        subscriptionTier: 'pro'
      }
    })
    console.log('✅ Test user ready\n')

    // 3. Request a report
    console.log('3. Requesting search terms report...')
    
    // Calculate last complete Sunday-Saturday week
    const today = new Date()
    const dayOfWeek = today.getDay()
    const daysToLastSaturday = dayOfWeek === 0 ? 1 : dayOfWeek + 1
    
    const endDate = new Date(today)
    endDate.setDate(today.getDate() - daysToLastSaturday)
    endDate.setUTCHours(23, 59, 59, 999)
    
    const startDate = new Date(endDate)
    startDate.setDate(endDate.getDate() - 6)
    startDate.setUTCHours(0, 0, 0, 0)

    console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`)

    const reportId = await pollingService.requestReport(
      testUser.id,
      'SEARCH_TERMS' as any,
      startDate,
      endDate
    )
    console.log(`✅ Report requested with ID: ${reportId}\n`)

    // 4. Check status periodically
    console.log('4. Checking report status...')
    let attempts = 0
    let reportStatus = await pollingService.getReportStatus(reportId)

    while (reportStatus.status === 'PENDING' || reportStatus.status === 'PROCESSING') {
      attempts++
      console.log(`Attempt ${attempts}: Status = ${reportStatus.status}`)
      
      if (attempts > 5) {
        console.log('⚠️  Report still processing. The polling service will continue in the background.')
        break
      }

      await new Promise(resolve => setTimeout(resolve, 10000))
      reportStatus = await pollingService.getReportStatus(reportId)
    }

    console.log(`\nFinal status: ${reportStatus.status}`)

    if (reportStatus.status === 'COMPLETED') {
      console.log('✅ Report completed successfully!')
      
      // Get some sample data
      const searchTerms = await prisma.searchTerm.findMany({
        where: { reportId },
        take: 5,
        orderBy: { searchVolume: 'asc' }
      })

      console.log(`\nFound ${reportStatus.reportData?.recordCount || 0} search terms`)
      console.log('Top 5 search terms:')
      searchTerms.forEach((term, i) => {
        console.log(`${i + 1}. "${term.term}" - Rank: ${term.searchVolume}`)
      })
    }

    // 5. List all reports for the user
    console.log('\n5. Listing all reports for user...')
    const allReports = await prisma.amazonReport.findMany({
      where: { userId: testUser.id },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`Found ${allReports.length} reports:`)
    allReports.forEach(report => {
      console.log(`- ${report.id}: ${report.type} (${report.status}) - ${report.createdAt.toLocaleDateString()}`)
    })

    // Stop polling
    console.log('\n6. Stopping polling service...')
    pollingService.stopPolling()
    console.log('✅ Polling service stopped')

  } catch (error) {
    console.error('Error in workflow test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testReportWorkflow()
  .then(() => console.log('\n✅ Workflow test completed!'))
  .catch(console.error)