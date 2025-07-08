#!/usr/bin/env node

/**
 * Upload completed NDJSON reports to BigQuery
 */

import { getBigQueryService } from '../src/lib/bigquery-service'
import { config } from 'dotenv'
import fs from 'fs/promises'
import path from 'path'

config({ path: '.env.local' })

async function uploadCompletedReports() {
  const bigQueryService = getBigQueryService()
  
  // Reports that are ready for upload
  const completedReports = [
    {
      ndjsonPath: '/Users/anthony/Documents/Projects/CommerceCrafted/tmp/report-1520535020276.ndjson',
      reportId: '1520535020276',
      week: 'April 13, 2025'
    },
    {
      ndjsonPath: '/Users/anthony/Documents/Projects/CommerceCrafted/tmp/report-1520541020276.ndjson', 
      reportId: '1520541020276',
      week: 'April 20, 2025'
    }
  ]

  console.log('🚀 Uploading Completed Reports to BigQuery')
  console.log('==========================================\n')

  for (const report of completedReports) {
    try {
      // Check if file exists and get size
      const stats = await fs.stat(report.ndjsonPath)
      const sizeGB = (stats.size / 1024 / 1024 / 1024).toFixed(2)
      
      console.log(`📤 Uploading ${report.reportId} (${report.week})`)
      console.log(`   📦 File size: ${sizeGB} GB`)
      console.log(`   📁 Path: ${report.ndjsonPath}`)
      
      // Upload to BigQuery
      console.log('   ⬆️  Starting upload...')
      await bigQueryService.loadSearchTermsData(report.ndjsonPath)
      
      console.log(`   ✅ Successfully uploaded ${report.week}!\n`)
      
    } catch (error) {
      console.error(`   ❌ Failed to upload ${report.week}:`, error)
      console.log('')
    }
  }

  // Check final status
  console.log('🔍 Checking final BigQuery status...')
  const [job] = await bigQueryService.client.createQueryJob({
    query: 'SELECT COUNT(*) as count, COUNT(DISTINCT search_term) as unique_terms FROM `commercecrafted.amazon_analytics.search_terms`',
    location: 'US',
  })
  const [rows] = await job.getQueryResults()
  
  console.log(`✅ BigQuery Status:`)
  console.log(`   📊 Total records: ${rows[0].count}`)
  console.log(`   🔍 Unique search terms: ${rows[0].unique_terms}`)
  console.log('\n🎉 Upload complete!')
}

uploadCompletedReports().catch(console.error)