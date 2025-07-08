#!/usr/bin/env node

/**
 * Process Existing Amazon Report Script
 * 
 * This script processes the existing Amazon report (ID: 1520270020276) 
 * and loads it into BigQuery for testing the complete pipeline.
 * 
 * Run with: npm run process-report
 */

import { ReportDataPipeline } from '../src/lib/report-data-pipeline'
import { prisma } from '../src/lib/prisma'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

async function main() {
  console.log('📊 Process Existing Amazon Report')
  console.log('================================\n')

  const reportId = '1520270020276'
  
  try {
    // Check if report exists in database
    console.log(`🔍 Looking for report ${reportId}...`)
    const report = await prisma.amazonReport.findFirst({
      where: { amazonReportId: reportId }
    })

    if (!report) {
      console.error(`❌ Report ${reportId} not found in database`)
      console.error('This report should have been created when you requested it earlier.')
      console.error('Please check the amazonReport table in your database.')
      return
    }

    console.log(`✅ Found report: ${report.id}`)
    console.log(`   Status: ${report.status}`)
    console.log(`   Created: ${report.createdAt}`)
    console.log(`   Document ID: ${report.reportDocumentId || 'Not set'}`)

    if (report.status !== 'COMPLETED') {
      console.error(`❌ Report status is '${report.status}', expected 'COMPLETED'`)
      console.error('Please wait for the report to complete or check the polling service.')
      return
    }

    if (!report.reportDocumentId) {
      console.error('❌ Report has no document ID. Cannot download data.')
      return
    }

    // Check BigQuery setup
    console.log('\n🏗️  Checking BigQuery setup...')
    if (!process.env.GOOGLE_CLOUD_PROJECT || !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.error('❌ BigQuery not configured. Please set up BigQuery first:')
      console.error('   1. Follow the setup guide in docs/BIGQUERY_SETUP.md')
      console.error('   2. Run "npm run bigquery:init"')
      return
    }

    console.log('✅ BigQuery configuration found')

    // Initialize and run pipeline
    console.log('\n🚀 Starting data pipeline...')
    const pipeline = new ReportDataPipeline()
    
    console.log('⏳ This will take several minutes for a 2.87GB report...')
    console.log('   1. Download compressed report from Amazon')
    console.log('   2. Extract and transform to BigQuery format')
    console.log('   3. Load data into BigQuery tables')
    console.log('   4. Create weekly aggregations')
    console.log('   5. Cache recent data in SQLite')

    await pipeline.processCompletedReport(report.id)

    console.log('\n✅ Pipeline completed successfully!')
    console.log('\n📊 Data is now available in:')
    console.log('   - BigQuery tables for historical analysis')
    console.log('   - SQLite cache for fast API responses')
    
    console.log('\n🔗 Test your data:')
    console.log('   - API: GET /api/analytics/search-terms/v2')
    console.log('   - Trending: GET /api/analytics/trending')
    console.log(`   - BigQuery Console: https://console.cloud.google.com/bigquery?project=${process.env.GOOGLE_CLOUD_PROJECT}`)

    // Show some sample data
    console.log('\n📈 Sample data from cache:')
    const sampleTerms = await prisma.searchTerm.findMany({
      take: 5,
      orderBy: { searchVolume: 'asc' },
      select: {
        term: true,
        searchVolume: true,
        clickShare: true,
        clickedAsin: true
      }
    })

    sampleTerms.forEach((term, index) => {
      console.log(`   ${index + 1}. "${term.term}" (rank: ${term.searchVolume}, ASIN: ${term.clickedAsin})`)
    })

  } catch (error) {
    console.error('\n❌ Pipeline failed:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Could not find SELLING_PARTNER_APP_CLIENT_ID')) {
        console.error('\n💡 Amazon SP-API credentials missing. Please ensure:')
        console.error('   - AMAZON_SP_API_CLIENT_ID is set')
        console.error('   - AMAZON_SP_API_CLIENT_SECRET is set') 
        console.error('   - AMAZON_SP_API_REFRESH_TOKEN is set')
      } else if (error.message.includes('BigQuery')) {
        console.error('\n💡 BigQuery issue. Please ensure:')
        console.error('   - GOOGLE_CLOUD_PROJECT is set')
        console.error('   - GOOGLE_APPLICATION_CREDENTIALS points to valid key file')
        console.error('   - BigQuery dataset and tables exist (run npm run bigquery:init)')
      }
    }
    
    process.exit(1)
  }
}

// Run the script  
main().catch(console.error)