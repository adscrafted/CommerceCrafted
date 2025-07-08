#!/usr/bin/env node

/**
 * Extract and Process Amazon Data
 * 
 * First extracts just the data array from the large JSON,
 * then processes it in manageable chunks
 */

import { createReadStream, createWriteStream } from 'fs'
import { getBigQueryService } from '../src/lib/bigquery-service'
import readline from 'readline'
import { config } from 'dotenv'
import fs from 'fs'

// Load environment variables
config({ path: '.env.local' })

async function extractDataArray() {
  console.log('1️⃣  Extracting data array from large JSON...')
  
  const inputPath = '/tmp/report-1520270020276.json'
  const dataArrayPath = '/tmp/search-terms-data-only.json'
  
  const output = createWriteStream(dataArrayPath)
  const rl = readline.createInterface({
    input: createReadStream(inputPath),
    crlfDelay: Infinity
  })

  let inDataSection = false
  let lineCount = 0

  output.write('[\n') // Start array

  for await (const line of rl) {
    lineCount++
    
    if (lineCount % 1000000 === 0) {
      console.log(`   📄 Processed ${lineCount} lines...`)
    }

    if (line.includes('"dataByDepartmentAndSearchTerm"')) {
      inDataSection = true
      continue
    }

    if (inDataSection) {
      // Skip the opening [ but include everything else until we hit the closing ]
      if (line.trim() === '[') continue
      
      if (line.trim() === ']' || line.includes('}')) {
        // Check if this is the end of the data array
        if (line.includes('}') && !line.includes('"')) {
          output.write('\n]') // Close array
          break
        }
      }
      
      output.write(line + '\n')
    }
  }

  output.end()
  console.log(`   ✅ Extracted data array to ${dataArrayPath}`)
  return dataArrayPath
}

async function processDataArray(dataArrayPath: string) {
  console.log('2️⃣  Processing extracted data array...')
  
  const outputPath = '/tmp/final-bigquery-data.ndjson'
  const reportMetadata = {
    reportId: 'cmct9mcfz00019a48mgzmp4e2',
    marketplaceId: 'ATVPDKIKX0DER',
    weekStartDate: '2025-06-29',
    weekEndDate: '2025-07-05'
  }

  // Read and parse the extracted JSON array
  console.log('   📖 Reading extracted JSON array...')
  const jsonContent = await fs.promises.readFile(dataArrayPath, 'utf-8')
  
  console.log('   🔄 Parsing JSON...')
  const dataArray = JSON.parse(jsonContent)
  
  console.log(`   ✅ Found ${dataArray.length} records`)
  
  const output = createWriteStream(outputPath)
  let recordCount = 0

  for (const record of dataArray) {
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
        console.log(`   📊 Processed ${recordCount} records...`)
      }
    }
  }

  output.end()
  console.log(`   ✅ Transformed ${recordCount} records`)
  return { outputPath, recordCount }
}

async function main() {
  console.log('🚀 Extract and Process Amazon Report')
  console.log('===================================\n')

  try {
    // Step 1: Extract just the data array
    const dataArrayPath = await extractDataArray()
    
    // Step 2: Process the data array
    const { outputPath, recordCount } = await processDataArray(dataArrayPath)

    // Step 3: Load into BigQuery
    console.log('3️⃣  Loading data into BigQuery...')
    const bigQueryService = getBigQueryService()
    await bigQueryService.loadSearchTermsData(outputPath)

    console.log('\n🎉 Success! Amazon data loaded into BigQuery')
    console.log(`   📊 Records: ${recordCount.toLocaleString()} search terms`)
    console.log(`   💾 Table: commercecrafted.amazon_analytics.search_terms`)
    console.log(`   🗓️  Period: 2025-06-29 to 2025-07-05`)
    console.log(`   🌍 Marketplace: ATVPDKIKX0DER (US)`)

    // Cleanup temp files
    console.log('\n🧹 Cleaning up temp files...')
    await fs.promises.unlink(dataArrayPath)
    await fs.promises.unlink(outputPath)

  } catch (error) {
    console.error('\n❌ Processing failed:', error)
    process.exit(1)
  }
}

main().catch(console.error)