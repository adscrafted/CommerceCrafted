#!/usr/bin/env node

/**
 * Simple Amazon Report Processor
 * 
 * Uses a basic regex approach to extract records without full JSON parsing
 */

import { createReadStream, createWriteStream } from 'fs'
import { getBigQueryService } from '../src/lib/bigquery-service'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

async function main() {
  console.log('🚀 Simple Amazon Report Processor')
  console.log('=================================\n')

  const inputPath = '/tmp/report-1520270020276.json'
  const outputPath = '/tmp/simple-bigquery-data.ndjson'

  const reportMetadata = {
    reportId: 'cmct9mcfz00019a48mgzmp4e2',
    marketplaceId: 'ATVPDKIKX0DER',
    weekStartDate: '2025-06-29',
    weekEndDate: '2025-07-05'
  }

  try {
    console.log('1️⃣  Reading file in chunks...')
    
    const output = createWriteStream(outputPath)
    let recordCount = 0
    let buffer = ''
    const chunkSize = 1024 * 1024 // 1MB chunks
    
    const stream = createReadStream(inputPath, { highWaterMark: chunkSize })

    for await (const chunk of stream) {
      buffer += chunk.toString()
      
      // Look for complete records using a pattern
      const recordPattern = /\{[^{}]*"departmentName"[^{}]*"searchTerm"[^{}]*"conversionShare"[^{}]*\}/g
      let match
      
      while ((match = recordPattern.exec(buffer)) !== null) {
        try {
          const recordJson = match[0]
          const record = JSON.parse(recordJson)
          
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

            if (recordCount % 50000 === 0) {
              console.log(`   📊 Processed ${recordCount} records...`)
            }
          }
        } catch (e) {
          // Skip malformed records
        }
      }
      
      // Keep the last part of buffer for next iteration
      const lastBrace = buffer.lastIndexOf('}')
      if (lastBrace > 0) {
        buffer = buffer.substring(lastBrace + 1)
      }
      
      // Prevent buffer from getting too large
      if (buffer.length > chunkSize * 2) {
        buffer = buffer.substring(buffer.length - chunkSize)
      }
    }

    output.end()
    console.log(`\n✅ Processing complete! Found ${recordCount} records`)

    if (recordCount === 0) {
      console.log('❌ No records found. The file might have a different structure.')
      return
    }

    console.log('2️⃣  Loading data into BigQuery...')
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