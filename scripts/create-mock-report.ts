#!/usr/bin/env node

/**
 * Create Mock Amazon Report Entry
 * 
 * This creates a mock database entry for testing the BigQuery pipeline
 * without needing to request a new report from Amazon.
 */

import { prisma } from '../src/lib/prisma'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

async function main() {
  console.log('📊 Creating Mock Amazon Report Entry')
  console.log('===================================\n')

  try {
    // Get the first admin user
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@commercecrafted.com' }
    })

    if (!adminUser) {
      throw new Error('Admin user not found. Run npm run db:seed-users first.')
    }

    // Create a mock report entry
    const report = await prisma.amazonReport.create({
      data: {
        amazonReportId: '1520270020276',
        type: 'SEARCH_TERMS',
        status: 'COMPLETED',
        startDate: new Date('2024-12-29'), // Sunday 
        endDate: new Date('2025-01-04'),   // Saturday
        marketplaceId: 'ATVPDKIKX0DER',
        reportDocumentId: 'mock-document-id-12345',
        completedAt: new Date(),
        userId: adminUser.id
      }
    })

    console.log('✅ Mock report created:')
    console.log(`   ID: ${report.id}`)
    console.log(`   Amazon Report ID: ${report.amazonReportId}`)
    console.log(`   Status: ${report.status}`)
    console.log(`   Period: ${report.startDate.toISOString().split('T')[0]} to ${report.endDate.toISOString().split('T')[0]}`)

    console.log('\n📝 Note: This is a mock entry for testing.')
    console.log('The actual report processing will fail at the download step')
    console.log('since the document ID is fake, but you can test the BigQuery')
    console.log('pipeline structure.')

  } catch (error) {
    console.error('\n❌ Failed to create mock report:', error)
    
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      console.error('\n💡 You need to create a user first. Run:')
      console.error('   npm run db:seed-users')
    }
  }
}

main().catch(console.error)