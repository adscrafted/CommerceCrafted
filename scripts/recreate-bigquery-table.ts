#!/usr/bin/env node

/**
 * Recreate BigQuery table with full schema to match all data formats
 */

import { BigQuery } from '@google-cloud/bigquery'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

async function recreateBigQueryTable() {
  console.log('🔄 Recreating BigQuery Table with Complete Schema')
  console.log('================================================\n')

  const client = new BigQuery({
    projectId: process.env.GOOGLE_CLOUD_PROJECT,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
  })

  const dataset = client.dataset('amazon_analytics')
  const table = dataset.table('search_terms')

  try {
    // Check if table exists
    const [exists] = await table.exists()
    if (exists) {
      console.log('📋 Current table exists, checking data...')
      
      // Get current row count
      const [job] = await client.createQueryJob({
        query: 'SELECT COUNT(*) as count FROM `commercecrafted.amazon_analytics.search_terms`',
        location: 'US',
      })
      const [rows] = await job.getQueryResults()
      const currentCount = rows[0].count
      console.log(`   Current records: ${currentCount}`)
      
      // Delete existing table
      console.log('🗑️  Deleting existing table...')
      await table.delete()
      console.log('   ✅ Table deleted')
    }

    // Create new table with complete schema
    console.log('🏗️  Creating new table with complete schema...')
    
    const schema = [
      { name: 'search_term', type: 'STRING', mode: 'NULLABLE' },
      { name: 'search_frequency_rank', type: 'INTEGER', mode: 'NULLABLE' },
      { name: 'department', type: 'STRING', mode: 'NULLABLE' },
      
      // Top 3 clicked products
      { name: 'clicked_asin_1', type: 'STRING', mode: 'NULLABLE' },
      { name: 'product_title_1', type: 'STRING', mode: 'NULLABLE' },
      { name: 'click_share_1', type: 'FLOAT', mode: 'NULLABLE' },
      { name: 'conversion_share_1', type: 'FLOAT', mode: 'NULLABLE' },
      
      { name: 'clicked_asin_2', type: 'STRING', mode: 'NULLABLE' },
      { name: 'product_title_2', type: 'STRING', mode: 'NULLABLE' },
      { name: 'click_share_2', type: 'FLOAT', mode: 'NULLABLE' },
      { name: 'conversion_share_2', type: 'FLOAT', mode: 'NULLABLE' },
      
      { name: 'clicked_asin_3', type: 'STRING', mode: 'NULLABLE' },
      { name: 'product_title_3', type: 'STRING', mode: 'NULLABLE' },
      { name: 'click_share_3', type: 'FLOAT', mode: 'NULLABLE' },
      { name: 'conversion_share_3', type: 'FLOAT', mode: 'NULLABLE' },
      
      // Aggregated fields
      { name: 'total_click_share', type: 'FLOAT', mode: 'NULLABLE' },
      { name: 'total_conversion_share', type: 'FLOAT', mode: 'NULLABLE' },
      
      // Metadata
      { name: 'report_id', type: 'STRING', mode: 'REQUIRED' },
      { name: 'marketplace_id', type: 'STRING', mode: 'REQUIRED' },
      { name: 'week_start_date', type: 'DATE', mode: 'REQUIRED' },
      { name: 'week_end_date', type: 'DATE', mode: 'REQUIRED' },
      { name: 'ingested_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
    ]

    const options = {
      schema: schema,
      location: 'US',
    }

    const [newTable] = await dataset.createTable('search_terms', options)
    console.log('✅ Table created successfully!')
    console.log(`   Fields: ${schema.length}`)
    
    // List all fields
    console.log('\n📋 Schema fields:')
    schema.forEach(field => {
      console.log(`   • ${field.name} (${field.type})`)
    })

  } catch (error) {
    console.error('❌ Error recreating table:', error)
    throw error
  }
}

// Run the script
recreateBigQueryTable().catch(console.error)