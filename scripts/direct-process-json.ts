#!/usr/bin/env node

/**
 * Direct JSON processing with progress tracking
 */

import { config } from 'dotenv'
import fs from 'fs'
import { createReadStream, createWriteStream } from 'fs'
import readline from 'readline'
import { getBigQueryService } from '../src/lib/bigquery-service'

config({ path: '.env.local' })

async function directProcessJson() {
  console.log('🚀 Direct JSON Processing with Progress Tracking')
  console.log('==============================================\n')

  const inputFile = '/Users/anthony/Documents/Projects/CommerceCrafted/tmp/report-1520525020276.json'
  const outputFile = '/Users/anthony/Documents/Projects/CommerceCrafted/tmp/report-april-06.ndjson'
  
  const metadata = {
    reportId: '1520525020276',
    marketplaceId: 'ATVPDKIKX0DER',
    weekStartDate: '2025-04-06',
    weekEndDate: '2025-04-12'
  }

  console.log('📊 Processing report:', metadata.reportId)
  console.log('📅 Week:', metadata.weekStartDate, 'to', metadata.weekEndDate)
  
  const rl = readline.createInterface({
    input: createReadStream(inputFile),
    crlfDelay: Infinity
  })

  const output = createWriteStream(outputFile)
  
  let inDataSection = false
  let recordCount = 0
  let lineCount = 0
  let lastProgress = Date.now()
  
  console.log('⏳ Starting processing...\n')

  for await (const line of rl) {
    lineCount++
    
    // Progress every 100k lines
    if (lineCount % 100000 === 0) {
      const elapsed = (Date.now() - lastProgress) / 1000
      console.log(`   📄 Processed ${lineCount.toLocaleString()} lines, ${recordCount.toLocaleString()} records (${elapsed.toFixed(1)}s)`)
      lastProgress = Date.now()
    }

    // Look for data section
    if (line.includes('"dataByDepartmentAndSearchTerm"')) {
      inDataSection = true
      console.log('   ✅ Found data section at line', lineCount)
      continue
    }

    if (!inDataSection) continue

    // Try to parse JSON objects
    const trimmed = line.trim()
    if (trimmed.startsWith('{') && (trimmed.endsWith('}') || trimmed.endsWith('},'))) {
      try {
        let json = trimmed
        if (json.endsWith(',')) json = json.slice(0, -1)
        
        const record = JSON.parse(json)
        
        if (record.searchTerm) {
          // Transform to BigQuery format
          const bqRecord = {
            report_id: metadata.reportId,
            marketplace_id: metadata.marketplaceId,
            week_start_date: metadata.weekStartDate,
            week_end_date: metadata.weekEndDate,
            department: record.departmentName || null,
            search_term: record.searchTerm,
            search_frequency_rank: record.searchFrequencyRank || null,
            clicked_asin_1: record.clickedAsin || null,
            product_title_1: record.clickedItemName || null,
            click_share_1: record.clickShare || null,
            conversion_share_1: record.conversionShare || null,
            clicked_asin_2: null,
            product_title_2: null,
            click_share_2: null,
            conversion_share_2: null,
            clicked_asin_3: null,
            product_title_3: null,
            click_share_3: null,
            conversion_share_3: null,
            total_click_share: record.clickShare || 0,
            total_conversion_share: record.conversionShare || 0,
            ingested_at: new Date().toISOString()
          }
          
          output.write(JSON.stringify(bqRecord) + '\n')
          recordCount++
          
          if (recordCount === 1) {
            console.log('   🎉 First record:', record.searchTerm)
          }
          
          if (recordCount % 1000000 === 0) {
            console.log(`   🚀 Milestone: ${recordCount.toLocaleString()} records!`)
          }
        }
      } catch (e) {
        // Skip malformed records
      }
    }
  }

  output.end()
  
  console.log('\n✅ Processing Complete!')
  console.log(`   📊 Total records: ${recordCount.toLocaleString()}`)
  console.log(`   📄 Total lines: ${lineCount.toLocaleString()}`)
  console.log(`   📁 Output: ${outputFile}`)
  
  // Get file size
  const stats = fs.statSync(outputFile)
  console.log(`   📦 File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`)
  
  if (recordCount > 0) {
    console.log('\n📤 Uploading to BigQuery...')
    const bigQueryService = getBigQueryService()
    
    try {
      await bigQueryService.loadSearchTermsData(outputFile)
      console.log('✅ Upload complete!')
      
      // Verify
      const [job] = await bigQueryService.client.createQueryJob({
        query: `
          SELECT 
            COUNT(*) as total,
            COUNT(DISTINCT search_term) as unique_terms,
            ARRAY_AGG(search_term ORDER BY search_frequency_rank LIMIT 5) as top_terms
          FROM \`commercecrafted.amazon_analytics.search_terms\`
        `,
        location: 'US',
      })
      const [rows] = await job.getQueryResults()
      
      console.log('\n🎉 BigQuery Data Loaded Successfully!')
      console.log(`   📊 Total records: ${parseInt(rows[0].total).toLocaleString()}`)
      console.log(`   🔍 Unique search terms: ${parseInt(rows[0].unique_terms).toLocaleString()}`)
      console.log('   🏆 Top search terms:')
      rows[0].top_terms.forEach((term, i) => {
        console.log(`      ${i + 1}. "${term}"`)
      })
      
    } catch (error) {
      console.error('❌ Upload error:', error.message)
    }
  }
}

directProcessJson().catch(console.error)