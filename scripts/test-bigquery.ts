#!/usr/bin/env node

/**
 * BigQuery Test Script
 * 
 * This script tests the BigQuery connection and performs basic operations.
 * Run with: npm run bigquery:test
 */

import { getBigQueryService } from '../src/lib/bigquery-service'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

async function main() {
  console.log('🧪 BigQuery Test Script')
  console.log('======================\n')

  try {
    const bigQueryService = getBigQueryService()
    const projectId = process.env.GOOGLE_CLOUD_PROJECT!
    const datasetId = process.env.BIGQUERY_DATASET || 'amazon_analytics'

    console.log('1️⃣  Testing BigQuery connection...')
    const client = (bigQueryService as any).client
    const [datasets] = await client.getDatasets()
    console.log(`   ✅ Connected to project: ${projectId}`)
    console.log(`   ✅ Found ${datasets.length} datasets`)

    console.log('\n2️⃣  Checking dataset existence...')
    const datasetExists = datasets.some((d: any) => d.id === datasetId)
    if (datasetExists) {
      console.log(`   ✅ Dataset '${datasetId}' exists`)
    } else {
      console.log(`   ❌ Dataset '${datasetId}' not found`)
      console.log('   💡 Run "npm run bigquery:init" to create it')
      return
    }

    console.log('\n3️⃣  Checking tables...')
    const dataset = client.dataset(datasetId)
    const [tables] = await dataset.getTables()
    
    const expectedTables = ['search_terms', 'search_terms_weekly_summary']
    expectedTables.forEach(tableName => {
      const exists = tables.some((t: any) => t.id === tableName)
      if (exists) {
        console.log(`   ✅ Table '${tableName}' exists`)
      } else {
        console.log(`   ❌ Table '${tableName}' not found`)
      }
    })

    console.log('\n4️⃣  Testing insert with mock data...')
    const mockData = {
      report_id: 'test-' + Date.now(),
      marketplace_id: 'ATVPDKIKX0DER',
      week_start_date: '2024-01-07',
      week_end_date: '2024-01-13',
      department_name: 'Electronics',
      search_term: 'test bluetooth headphones',
      search_frequency_rank: 12345,
      clicked_asin: 'B00TEST001',
      clicked_item_name: 'Test Product',
      click_share_rank: 100,
      click_share: 0.05,
      conversion_share: 0.02,
      ingested_at: new Date().toISOString()
    }

    const table = dataset.table('search_terms')
    await table.insert([mockData])
    console.log('   ✅ Successfully inserted test record')

    console.log('\n5️⃣  Testing query...')
    const query = `
      SELECT COUNT(*) as total_records
      FROM \`${projectId}.${datasetId}.search_terms\`
      WHERE report_id LIKE 'test-%'
    `
    
    const [job] = await client.createQueryJob({ query })
    const [rows] = await job.getQueryResults()
    console.log(`   ✅ Query successful. Test records: ${rows[0].total_records}`)

    console.log('\n6️⃣  Cleaning up test data...')
    const deleteQuery = `
      DELETE FROM \`${projectId}.${datasetId}.search_terms\`
      WHERE report_id LIKE 'test-%'
    `
    
    const [deleteJob] = await client.createQueryJob({ query: deleteQuery })
    await deleteJob.getQueryResults()
    console.log('   ✅ Test data cleaned up')

    console.log('\n✅ All tests passed! BigQuery is properly configured.')
    console.log('\n📊 BigQuery Console: https://console.cloud.google.com/bigquery')
    console.log(`   Project: ${projectId}`)
    console.log(`   Dataset: ${datasetId}`)

  } catch (error) {
    console.error('\n❌ Test failed:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Not found: Dataset')) {
        console.error('\n💡 Dataset not found. Run "npm run bigquery:init" first')
      } else if (error.message.includes('Permission denied')) {
        console.error('\n💡 Permission denied. Check your service account permissions')
      } else if (error.message.includes('Could not load the default credentials')) {
        console.error('\n💡 Authentication failed. Check GOOGLE_APPLICATION_CREDENTIALS')
      }
    }
    
    process.exit(1)
  }
}

// Run the script
main().catch(console.error)