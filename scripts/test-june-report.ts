#!/usr/bin/env node

import { AmazonSearchTermsService } from '../src/lib/amazon-search-terms-service'
import { config } from 'dotenv'

config({ path: '.env.local' })

async function testJuneReport() {
  console.log('🧪 Testing report request for June 2025...\n')
  
  const amazonService = new AmazonSearchTermsService()
  
  try {
    // Try June 22-28, 2025 (last full week of June)
    const startDate = new Date('2025-06-22T00:00:00.000Z')
    const endDate = new Date('2025-06-28T23:59:59.999Z')
    
    console.log('📅 Requesting report for:')
    console.log(`  Start: ${startDate.toISOString()}`)
    console.log(`  End: ${endDate.toISOString()}`)
    
    const report = await amazonService.requestTopSearchTermsReport({
      startDate,
      endDate,
      marketplaceId: 'ATVPDKIKX0DER'
    })
    
    console.log('\n✅ Report requested successfully!')
    console.log('Report ID:', report.reportId)
    
    // Wait a bit then check status
    console.log('\n⏳ Waiting 10 seconds to check status...')
    await new Promise(resolve => setTimeout(resolve, 10000))
    
    const status = await amazonService.getReportStatus(report.reportId)
    console.log('\n📊 Report Status:', status.processingStatus)
    
    if (status.processingStatus === 'FATAL') {
      console.log('❌ Report failed with FATAL status')
      console.log('Full status:', JSON.stringify(status, null, 2))
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testJuneReport().catch(console.error)