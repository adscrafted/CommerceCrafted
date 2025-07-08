#!/usr/bin/env node

/**
 * Upload ready NDJSON files to BigQuery
 */

import { getBigQueryService } from '../src/lib/bigquery-service'
import { config } from 'dotenv'
import fs from 'fs/promises'

config({ path: '.env.local' })

async function uploadReadyFiles() {
  const bigQueryService = getBigQueryService()
  
  console.log('📤 Uploading Ready NDJSON Files to BigQuery')
  console.log('===========================================\n')

  const readyFiles = [
    {
      path: '/Users/anthony/Documents/Projects/CommerceCrafted/tmp/report-1520535020276.ndjson',
      reportId: '1520535020276',
      week: 'April 13, 2025'
    },
    {
      path: '/Users/anthony/Documents/Projects/CommerceCrafted/tmp/report-1520541020276.ndjson',
      reportId: '1520541020276', 
      week: 'April 20, 2025'
    }
  ]

  let totalUploaded = 0

  for (const file of readyFiles) {
    try {
      const stats = await fs.stat(file.path)
      const sizeGB = (stats.size / 1024 / 1024 / 1024).toFixed(2)
      
      console.log(`📊 Uploading ${file.reportId} (${file.week})`)
      console.log(`   📦 File size: ${sizeGB} GB`)
      
      // Upload to BigQuery with corrected schema
      console.log('   ⬆️  Starting upload...')
      await bigQueryService.loadSearchTermsData(file.path)
      
      console.log(`   ✅ Successfully uploaded!\n`)
      totalUploaded++
      
    } catch (error) {
      console.error(`   ❌ Failed to upload ${file.week}:`, error.message)
      console.log('')
    }
  }

  // Check final status
  if (totalUploaded > 0) {
    console.log('🔍 Verifying BigQuery data...')
    
    try {
      const [job] = await bigQueryService.client.createQueryJob({
        query: `
          SELECT 
            COUNT(*) as total,
            COUNT(DISTINCT search_term) as unique_terms,
            COUNT(DISTINCT week_start_date) as weeks,
            MIN(search_term) as sample_term_1,
            MAX(search_term) as sample_term_2
          FROM \`commercecrafted.amazon_analytics.search_terms\`
          WHERE search_term IS NOT NULL AND search_term != ""
        `,
        location: 'US',
      })
      const [rows] = await job.getQueryResults()
      
      console.log('✅ BigQuery Status:')
      console.log(`   📊 Total records: ${parseInt(rows[0].total).toLocaleString()}`)
      console.log(`   🔍 Unique search terms: ${parseInt(rows[0].unique_terms).toLocaleString()}`)
      console.log(`   📅 Weeks uploaded: ${rows[0].weeks}`)
      console.log(`   💡 Sample terms: "${rows[0].sample_term_1}", "${rows[0].sample_term_2}"`)
      
    } catch (error) {
      console.error('❌ Error verifying data:', error.message)
    }
  }

  console.log(`\n🎉 Upload Summary: ${totalUploaded} files uploaded successfully!`)
}

uploadReadyFiles().catch(console.error)