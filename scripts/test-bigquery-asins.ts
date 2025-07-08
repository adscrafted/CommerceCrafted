#!/usr/bin/env node

import { getBigQueryService } from '../src/lib/bigquery-service'
import { config } from 'dotenv'

config({ path: '.env.local' })

async function testASINsData() {
  console.log('🔍 Testing BigQuery ASINs data...\n')
  
  const bq = getBigQueryService()
  
  try {
    // Test the direct query
    const query = `
      SELECT 
        search_term,
        clicked_asin_1,
        clicked_asin_2,
        clicked_asin_3,
        click_share_1,
        click_share_2,
        click_share_3
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.amazon_analytics.search_terms\`
      WHERE week_start_date = '2025-04-06'
      LIMIT 5
    `
    
    const [rows] = await bq.client.query({ query, location: 'US' })
    
    console.log('Sample data from BigQuery:')
    rows.forEach((row: any, index: number) => {
      console.log(`\n${index + 1}. Search term: ${row.search_term}`)
      console.log(`   ASIN 1: ${row.clicked_asin_1} (${row.click_share_1}% clicks)`)
      console.log(`   ASIN 2: ${row.clicked_asin_2} (${row.click_share_2}% clicks)`)
      console.log(`   ASIN 3: ${row.clicked_asin_3} (${row.click_share_3}% clicks)`)
    })
    
    // Now test the service method
    console.log('\n\nTesting getTopSearchTerms method:')
    const topTerms = await bq.getTopSearchTerms('2025-04-06', 2)
    
    topTerms.forEach((term: any, index: number) => {
      console.log(`\n${index + 1}. Search term: ${term.search_term}`)
      console.log(`   Number of ASINs in array: ${term.top_asins?.length || 0}`)
      if (term.top_asins) {
        term.top_asins.forEach((asin: any, i: number) => {
          console.log(`   ASIN ${i + 1}: ${asin.clicked_asin || 'NULL'} (${asin.click_share}% clicks)`)
        })
      }
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testASINsData().catch(console.error)