#!/usr/bin/env node

import { getBigQueryService } from '../src/lib/bigquery-service'
import { config } from 'dotenv'

config({ path: '.env.local' })

async function checkExistingWeeks() {
  console.log('🔍 Checking existing weeks in BigQuery...\n')
  
  const bq = getBigQueryService()
  
  try {
    const query = `
      SELECT DISTINCT week_start_date 
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${process.env.BIGQUERY_DATASET || 'amazon_analytics'}.search_terms\` 
      ORDER BY week_start_date DESC
      LIMIT 20
    `
    
    const [job] = await bq.client.createQueryJob({ 
      query, 
      location: 'US' 
    })
    
    const [rows] = await job.getQueryResults()
    
    console.log('📅 Existing weeks in BigQuery:')
    rows.forEach(row => {
      const date = row.week_start_date?.value || row.week_start_date
      console.log(`  - ${date}`)
    })
    
    console.log(`\n✅ Total weeks: ${rows.length}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkExistingWeeks().catch(console.error)