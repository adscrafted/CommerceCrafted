#!/usr/bin/env node

/**
 * Process Amazon Report with Efficient Streaming
 * 
 * This script uses an optimized streaming approach to process the 3GB Amazon report
 * and load it directly into BigQuery.
 */

import { createReadStream, createWriteStream } from 'fs'
import { getBigQueryService } from '../src/lib/bigquery-service'
import { Transform } from 'stream'
import { pipeline } from 'stream/promises'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

async function main() {
  console.log('🚀 Processing Amazon Report with Streaming')
  console.log('=========================================\n')

  const inputPath = '/tmp/report-1520270020276.json'
  const outputPath = '/tmp/optimized-bigquery-data.ndjson'

  const reportMetadata = {
    reportId: 'cmct9mcfz00019a48mgzmp4e2',
    marketplaceId: 'ATVPDKIKX0DER',
    weekStartDate: '2025-06-29',
    weekEndDate: '2025-07-05'
  }

  try {
    console.log('1️⃣  Creating optimized streaming transformer...')
    
    let recordCount = 0
    let isInDataArray = false
    let buffer = ''
    let objectDepth = 0

    const transformer = new Transform({
      objectMode: false,
      transform(chunk, encoding, callback) {
        const text = chunk.toString()
        
        for (let i = 0; i < text.length; i++) {
          const char = text[i]
          buffer += char

          if (char === '{') {
            objectDepth++
            if (!isInDataArray && buffer.includes('"dataByDepartmentAndSearchTerm"')) {
              isInDataArray = true
              buffer = ''
              objectDepth = 0
              continue
            }
          } else if (char === '}') {
            objectDepth--
            
            if (isInDataArray && objectDepth === 0) {
              try {
                // We have a complete object
                let jsonStr = buffer.trim()
                if (jsonStr.endsWith(',')) {
                  jsonStr = jsonStr.slice(0, -1)
                }
                
                // Remove any leading array syntax
                jsonStr = jsonStr.replace(/^\s*,?\s*/, '')
                
                if (jsonStr.startsWith('{') && jsonStr.endsWith('}')) {
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

                    this.push(JSON.stringify(bqRecord) + '\n')
                    recordCount++

                    if (recordCount % 100000 === 0) {
                      console.log(`   📊 Processed ${recordCount} records...`)
                    }
                  }
                }
              } catch (e) {
                // Skip malformed records
              }
              
              buffer = ''
              objectDepth = 0
            }
          }
        }

        callback()
      },
      
      flush(callback) {
        console.log(`\n✅ Total records processed: ${recordCount}`)
        callback()
      }
    })

    console.log('2️⃣  Streaming and transforming data...')
    await pipeline(
      createReadStream(inputPath),
      transformer,
      createWriteStream(outputPath)
    )

    console.log('3️⃣  Loading data into BigQuery...')
    const bigQueryService = getBigQueryService()
    await bigQueryService.loadSearchTermsData(outputPath)

    console.log('\n🎉 Success! Amazon data loaded into BigQuery')
    console.log(`   📊 Processed: ${recordCount} search term records`)
    console.log(`   💾 Stored in: commercecrafted.amazon_analytics.search_terms`)
    console.log(`   🗓️  Week: ${reportMetadata.weekStartDate} to ${reportMetadata.weekEndDate}`)

  } catch (error) {
    console.error('\n❌ Processing failed:', error)
    process.exit(1)
  }
}

main().catch(console.error)