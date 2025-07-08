#!/usr/bin/env node

import { getBigQueryService } from '../src/lib/bigquery-service'
import { config } from 'dotenv'

config({ path: '.env.local' })

async function checkWeekData() {
  console.log('📅 Checking if duplicate keywords are from different weeks...\n')
  
  const bq = getBigQueryService()
  
  try {
    // Check the reports and their dates
    const reportQuery = `
      SELECT DISTINCT
        report_id,
        week_start_date,
        week_end_date,
        COUNT(*) as record_count
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.amazon_analytics.search_terms\`
      WHERE report_id IN ('1520525020276', '1520976020277')
      GROUP BY report_id, week_start_date, week_end_date
      ORDER BY week_start_date
    `
    
    const [reportRows] = await bq.client.query({ query: reportQuery, location: 'US' })
    
    console.log('📊 Report Information:')
    console.log('=' * 60)
    reportRows.forEach((row: any) => {
      console.log(`Report ${row.report_id}:`)
      console.log(`  Week: ${row.week_start_date} to ${row.week_end_date}`)
      console.log(`  Records: ${row.record_count}`)
      console.log()
    })
    
    // Check "methylene blue" specifically across all weeks
    const methyleneQuery = `
      SELECT 
        search_term,
        search_frequency_rank,
        week_start_date,
        week_end_date,
        report_id,
        total_click_share,
        total_conversion_share,
        clicked_asin_1,
        clicked_asin_2,
        clicked_asin_3,
        ingested_at
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.amazon_analytics.search_terms\`
      WHERE search_term = 'methylene blue'
      ORDER BY week_start_date, ingested_at
    `
    
    const [methyleneRows] = await bq.client.query({ query: methyleneQuery, location: 'US' })
    
    console.log('🔬 "methylene blue" across all data:')
    console.log('=' * 80)
    methyleneRows.forEach((row: any, i: number) => {
      console.log(`\nRecord ${i + 1}:`)
      console.log(`  Week: ${row.week_start_date} to ${row.week_end_date}`)
      console.log(`  Report ID: ${row.report_id}`)
      console.log(`  Rank: ${row.search_frequency_rank}`)
      console.log(`  Click Share: ${row.total_click_share}%`)
      console.log(`  Conv Share: ${row.total_conversion_share}%`)
      console.log(`  ASINs: ${row.clicked_asin_1 || 'null'}, ${row.clicked_asin_2 || 'null'}, ${row.clicked_asin_3 || 'null'}`)
      console.log(`  Ingested: ${row.ingested_at}`)
    })
    
    // Check all weeks available
    const weekQuery = `
      SELECT DISTINCT
        week_start_date,
        week_end_date,
        COUNT(*) as keywords_count,
        COUNT(DISTINCT report_id) as report_count
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.amazon_analytics.search_terms\`
      GROUP BY week_start_date, week_end_date
      ORDER BY week_start_date
    `
    
    const [weekRows] = await bq.client.query({ query: weekQuery, location: 'US' })
    
    console.log('\n\n📅 All weeks in database:')
    console.log('=' * 60)
    weekRows.forEach((row: any) => {
      console.log(`${row.week_start_date} to ${row.week_end_date}: ${row.keywords_count} keywords, ${row.report_count} reports`)
    })
    
    // Determine the solution
    if (weekRows.length > 1) {
      console.log('\n💡 SOLUTION NEEDED:')
      console.log('Multiple weeks detected! We need to:')
      console.log('1. Show trend graphs with historical data across weeks')
      console.log('2. Show only the LATEST week\'s ASINs in the Top ASINs column')
      console.log('3. Update the query to include week-over-week trend data')
    } else {
      console.log('\n💡 FINDING:')
      console.log('Only one week of data, so duplicates are within the same week')
      console.log('Current deduplication approach is correct')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkWeekData().catch(console.error)