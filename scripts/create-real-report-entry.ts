#!/usr/bin/env node

/**
 * Create Real Amazon Report Entry
 * 
 * This creates the proper database entry for the real Amazon report
 * so we can process it through the BigQuery pipeline.
 */

import { prisma } from '../src/lib/prisma'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

async function main() {
  console.log('📊 Creating Real Amazon Report Entry')
  console.log('===================================\n')

  try {
    // Get the admin user
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@commercecrafted.com' }
    })

    if (!adminUser) {
      throw new Error('Admin user not found. Run npm run db:seed-users first.')
    }

    // Delete the mock report if it exists
    await prisma.amazonReport.deleteMany({
      where: { amazonReportId: '1520270020276' }
    })

    // Create the real report entry with correct data from Amazon
    const report = await prisma.amazonReport.create({
      data: {
        amazonReportId: '1520270020276',
        type: 'SEARCH_TERMS',
        status: 'COMPLETED',
        startDate: new Date('2025-06-29T00:00:00+00:00'), // From Amazon response
        endDate: new Date('2025-07-05T23:59:59+00:00'),   // From Amazon response
        marketplaceId: 'ATVPDKIKX0DER',
        reportDocumentId: 'amzn1.spdoc.1.4.na.6d986d56-62b0-4388-9d55-caf9b1f14565.T388EG3WWJ83OU.5600',
        completedAt: new Date('2025-07-07T14:51:11+00:00'), // Processing end time
        userId: adminUser.id
      }
    })

    console.log('✅ Real report entry created:')
    console.log(`   ID: ${report.id}`)
    console.log(`   Amazon Report ID: ${report.amazonReportId}`)
    console.log(`   Status: ${report.status}`)
    console.log(`   Period: ${report.startDate.toISOString().split('T')[0]} to ${report.endDate.toISOString().split('T')[0]}`)
    console.log(`   Document ID: ${report.reportDocumentId}`)

    console.log('\n🚀 Ready to process!')
    console.log('   Run: npm run process-report')

  } catch (error) {
    console.error('\n❌ Failed to create real report entry:', error)
    process.exit(1)
  }
}

main().catch(console.error)