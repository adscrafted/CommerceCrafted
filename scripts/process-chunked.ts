#!/usr/bin/env node

/**
 * Process Amazon Report with Chunked Reading
 * 
 * Uses readline to process the 3GB file line by line with minimal memory
 */

import { createReadStream, createWriteStream } from 'fs'
import { getBigQueryService } from '../src/lib/bigquery-service'
import readline from 'readline'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

async function main() {
  console.log('🚀 Processing Amazon Report with Chunked Reading')
  console.log('===============================================\n')

  const inputPath = '/tmp/report-1520270020276.json'
  const outputPath = '/tmp/chunked-bigquery-data.ndjson'

  const reportMetadata = {
    reportId: 'cmct9mcfz00019a48mgzmp4e2',
    marketplaceId: 'ATVPDKIKX0DER',
    weekStartDate: '2025-06-29',
    weekEndDate: '2025-07-05'
  }

  try {
    console.log('1️⃣  Setting up line-by-line processing...')
    
    const output = createWriteStream(outputPath)
    let recordCount = 0
    let inDataSection = false
    let currentRecord = ''
    let braceCount = 0
    let lineCount = 0

    const rl = readline.createInterface({
      input: createReadStream(inputPath),
      crlfDelay: Infinity
    })

    console.log('2️⃣  Processing file line by line...')

    for await (const line of rl) {
      lineCount++
      
      if (lineCount % 1000000 === 0) {
        console.log(`   📄 Processed ${lineCount} lines, found ${recordCount} records...`)
      }

      // Look for data section
      if (line.includes('"dataByDepartmentAndSearchTerm"')) {
        inDataSection = true
        continue
      }

      if (!inDataSection) continue

      // Skip array opening brackets
      const trimmed = line.trim()
      if (trimmed === '[' || trimmed === '[ {') {
        if (trimmed.includes('{')) {
          currentRecord = '{'
          braceCount = 1
        }
        continue
      }

      // Track braces
      for (const char of line) {
        if (char === '{') braceCount++
        if (char === '}') braceCount--
      }

      currentRecord += line + '\n'

      // When we have a complete record
      if (braceCount === 0 && currentRecord.trim().length > 0) {
        try {
          // Clean up the record
          let jsonStr = currentRecord.trim()
          if (jsonStr.endsWith(',')) {
            jsonStr = jsonStr.slice(0, -1)
          }
          
          // Remove any array syntax
          jsonStr = jsonStr.replace(/^\s*,?\s*/, '')
          
          // Skip array closing
          if (jsonStr === '}' || jsonStr === ']' || jsonStr.length < 10) {
            currentRecord = ''
            continue
          }

          const record = JSON.parse(jsonStr)
          
          if (record.searchTerm && record.departmentName) {
            // Transform to BigQuery format
            const bqRecord = {
              report_id: reportMetadata.reportId,
              marketplace_id: reportMetadata.marketplaceId,
              week_start_date: reportMetadata.weekStartDate,
              week_end_date: reportMetadata.weekEndDate,
              department_name: record.departmentName,
              search_term: record.searchTerm,
              search_frequency_rank: record.searchFrequencyRank,
              clicked_asin: record.clickedAsin,
              clicked_item_name: record.clickedItemName,
              click_share_rank: record.clickShareRank,
              click_share: record.clickShare,
              conversion_share: record.conversionShare,
              ingested_at: new Date().toISOString()
            }

            output.write(JSON.stringify(bqRecord) + '\n')
            recordCount++

            if (recordCount % 100000 === 0) {
              console.log(`   📊 Transformed ${recordCount} records...`)
            }
          }
          
        } catch (e) {
          // Skip malformed records
        }
        
        currentRecord = ''
        braceCount = 0
      }
    }

    output.end()
    console.log(`\n✅ Transformation complete! Processed ${recordCount} records`)

    console.log('3️⃣  Loading data into BigQuery...')
    const bigQueryService = getBigQueryService()
    await bigQueryService.loadSearchTermsData(outputPath)

    console.log('\n🎉 Success! Amazon data loaded into BigQuery')
    console.log(`   📊 Records: ${recordCount.toLocaleString()} search terms`)
    console.log(`   💾 Table: commercecrafted.amazon_analytics.search_terms`)
    console.log(`   🗓️  Period: ${reportMetadata.weekStartDate} to ${reportMetadata.weekEndDate}`)
    console.log(`   🌍 Marketplace: ${reportMetadata.marketplaceId} (US)`)

  } catch (error) {
    console.error('\n❌ Processing failed:', error)
    process.exit(1)
  }
}

main().catch(console.error)