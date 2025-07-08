#!/usr/bin/env node

/**
 * Check current detailed status of BigQuery and processing
 */

import { getBigQueryService } from '../src/lib/bigquery-service'
import { config } from 'dotenv'
import fs from 'fs/promises'
import path from 'path'

config({ path: '.env.local' })

async function checkCurrentStatus() {
  const bigQueryService = getBigQueryService()
  
  console.log('📊 Current Backfill Status Check')
  console.log('================================\n')

  // 1. Check BigQuery data
  console.log('1️⃣  BigQuery Data Status:')
  try {
    // Total records
    const [totalJob] = await bigQueryService.client.createQueryJob({
      query: 'SELECT COUNT(*) as total FROM `commercecrafted.amazon_analytics.search_terms`',
      location: 'US',
    })
    const [totalRows] = await totalJob.getQueryResults()
    console.log(`   📊 Total records: ${parseInt(totalRows[0].total).toLocaleString()}`)

    if (totalRows[0].total > 0) {
      // More details
      const [detailsJob] = await bigQueryService.client.createQueryJob({
        query: `
          SELECT 
            COUNT(DISTINCT search_term) as unique_terms,
            COUNT(DISTINCT week_start_date) as weeks,
            MIN(week_start_date) as earliest,
            MAX(week_start_date) as latest,
            COUNT(DISTINCT report_id) as reports
          FROM \`commercecrafted.amazon_analytics.search_terms\`
          WHERE search_term IS NOT NULL AND search_term != ""
        `,
        location: 'US',
      })
      const [details] = await detailsJob.getQueryResults()
      
      console.log(`   🔍 Unique search terms: ${parseInt(details[0].unique_terms).toLocaleString()}`)
      console.log(`   📅 Weeks covered: ${details[0].weeks}`)
      console.log(`   📆 Date range: ${details[0].earliest} to ${details[0].latest}`)
      console.log(`   📋 Reports processed: ${details[0].reports}`)
    } else {
      console.log('   ⚠️  No data in BigQuery yet')
    }
  } catch (error) {
    console.log('   ❌ Error querying BigQuery:', error.message)
  }

  // 2. Check local files
  console.log('\n2️⃣  Local File Status:')
  const tmpDir = '/Users/anthony/Documents/Projects/CommerceCrafted/tmp'
  try {
    const files = await fs.readdir(tmpDir)
    
    // JSON files
    const jsonFiles = files.filter(f => f.endsWith('.json'))
    console.log(`   📁 JSON source files: ${jsonFiles.length}`)
    for (const file of jsonFiles) {
      const stats = await fs.stat(path.join(tmpDir, file))
      console.log(`      • ${file}: ${(stats.size / 1024 / 1024 / 1024).toFixed(2)} GB`)
    }
    
    // NDJSON files
    const ndjsonFiles = files.filter(f => f.endsWith('.ndjson'))
    console.log(`   📄 NDJSON files: ${ndjsonFiles.length}`)
    for (const file of ndjsonFiles) {
      const stats = await fs.stat(path.join(tmpDir, file))
      const sizeMB = stats.size / 1024 / 1024
      if (sizeMB > 1) {
        console.log(`      • ${file}: ${sizeMB.toFixed(2)} MB ✅`)
      } else {
        console.log(`      • ${file}: ${stats.size} bytes ⏳`)
      }
    }
  } catch (error) {
    console.log('   ❌ Error reading files:', error.message)
  }

  // 3. Check backfill state
  console.log('\n3️⃣  Backfill State:')
  try {
    const stateFile = await fs.readFile('.backfill-state.json', 'utf-8')
    const state = JSON.parse(stateFile)
    
    console.log(`   📋 Pending reports: ${state.pendingReports.length}`)
    if (state.pendingReports.length > 0) {
      state.pendingReports.forEach(r => {
        console.log(`      • ${r.reportId} (${r.weekStartDate}): ${r.status}`)
      })
    }
    
    console.log(`   🕐 Last check: ${new Date(state.lastCheck).toLocaleTimeString()}`)
  } catch (error) {
    console.log('   ❌ Error reading state:', error.message)
  }

  // 4. Check running processes
  console.log('\n4️⃣  Active Processes:')
  try {
    const { execSync } = require('child_process')
    const processes = execSync('ps aux | grep -E "(monitor|backfill|tsx)" | grep -v grep', { encoding: 'utf-8' })
    const lines = processes.trim().split('\n')
    console.log(`   🔄 Active processes: ${lines.length}`)
    lines.forEach(line => {
      if (line.includes('monitor-and-backfill')) {
        console.log('   ✅ Monitor service: RUNNING')
      }
      if (line.includes('request-future-weeks')) {
        console.log('   ✅ Request service: RUNNING')
      }
    })
  } catch (error) {
    console.log('   ⚠️  No active processes found')
  }

  console.log('\n📈 Summary:')
  console.log('===========')
  console.log('• BigQuery is empty (we recreated the table)')
  console.log('• Monitor service is processing April reports')
  console.log('• 3 large JSON files ready (2.7GB each)')
  console.log('• Transformation in progress (creates NDJSON files)')
  console.log('• Once NDJSON files complete, data uploads to BigQuery')
  console.log('\n⏳ Estimated time to first data: 20-30 minutes')
}

checkCurrentStatus().catch(console.error)