#!/usr/bin/env node

/**
 * Test Streaming Parser
 * 
 * Tests the streaming JSON parser with the real Amazon report
 */

import { transformAmazonReportStreaming } from '../src/lib/streaming-json-parser'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

async function main() {
  console.log('🧪 Testing Streaming Parser')
  console.log('=========================\n')

  const inputPath = '/tmp/report-1520270020276.json'
  const outputPath = '/tmp/test-streaming-output.ndjson'

  const reportMetadata = {
    reportId: 'test-report',
    marketplaceId: 'ATVPDKIKX0DER',
    weekStartDate: '2025-06-29',
    weekEndDate: '2025-07-05'
  }

  try {
    console.log('🚀 Starting streaming transformation...')
    const recordCount = await transformAmazonReportStreaming(inputPath, outputPath, reportMetadata)
    
    console.log(`✅ Transformation complete! Processed ${recordCount} records`)
    
    // Check output file
    const fs = require('fs')
    const stats = fs.statSync(outputPath)
    console.log(`📄 Output file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`)
    
    // Show first few lines
    const readline = require('readline')
    const rl = readline.createInterface({
      input: fs.createReadStream(outputPath),
      crlfDelay: Infinity
    })
    
    let lineCount = 0
    console.log('\n📊 First 3 records:')
    for await (const line of rl) {
      if (lineCount < 3) {
        const record = JSON.parse(line)
        console.log(`${lineCount + 1}. ${record.search_term} (rank: ${record.search_frequency_rank})`)
      }
      lineCount++
      if (lineCount >= 3) break
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error)
  }
}

main().catch(console.error)