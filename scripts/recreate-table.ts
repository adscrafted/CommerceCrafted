#!/usr/bin/env node

/**
 * Recreate BigQuery Table with Updated Schema
 */

import { getBigQueryService } from '../src/lib/bigquery-service'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

async function main() {
  console.log('🔄 Recreating BigQuery Table with Updated Schema')
  console.log('==============================================\n')

  try {
    const bigQueryService = getBigQueryService()
    const client = (bigQueryService as any).client
    const projectId = process.env.GOOGLE_CLOUD_PROJECT!
    const datasetId = process.env.BIGQUERY_DATASET || 'amazon_analytics'

    console.log('1️⃣  Dropping existing table...')
    const dataset = client.dataset(datasetId)
    const table = dataset.table('search_terms')
    
    try {
      await table.delete()
      console.log('   ✅ Table deleted')
    } catch (error) {
      console.log('   ⚠️  Table may not exist')
    }

    console.log('2️⃣  Creating table with updated schema...')
    await bigQueryService.initialize()

    console.log('\n✅ Table recreated successfully!')
    console.log('   📊 Updated schema allows NULL values for Amazon data inconsistencies')

  } catch (error) {
    console.error('\n❌ Recreation failed:', error)
    process.exit(1)
  }
}

main().catch(console.error)