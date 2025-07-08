#!/usr/bin/env node

import { getBigQueryService } from '../src/lib/bigquery-service'
import { config } from 'dotenv'

config({ path: '.env.local' })

async function testConnection() {
  console.log('🔍 Testing BigQuery connection...\n')
  
  console.log('Environment variables:')
  console.log('- GOOGLE_CLOUD_PROJECT:', process.env.GOOGLE_CLOUD_PROJECT || 'NOT SET')
  console.log('- GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS || 'NOT SET')
  console.log('- BIGQUERY_DATASET:', process.env.BIGQUERY_DATASET || 'NOT SET')
  
  try {
    const bq = getBigQueryService()
    
    // Try a simple query
    const query = `
      SELECT COUNT(*) as total 
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${process.env.BIGQUERY_DATASET || 'amazon_analytics'}.search_terms\`
      LIMIT 1
    `
    
    console.log('\n📊 Running test query...')
    const result = await bq.client.query({ query, location: 'US' })
    console.log('✅ Query successful! Total records:', result[0][0].total)
    
    // Test the actual service method
    console.log('\n📊 Testing getTopSearchTerms...')
    const topTerms = await bq.getTopSearchTerms('2025-06-29', 5)
    console.log('✅ Found', topTerms.length, 'search terms')
    
    if (topTerms.length > 0) {
      console.log('\nSample term:', {
        search_term: topTerms[0].search_term,
        rank: topTerms[0].search_frequency_rank
      })
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error)
    if (error instanceof Error) {
      console.error('Message:', error.message)
      console.error('Stack:', error.stack)
    }
  }
}

testConnection().catch(console.error)