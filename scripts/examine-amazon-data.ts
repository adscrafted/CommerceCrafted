#!/usr/bin/env node

/**
 * Examine Amazon Data Structure
 * 
 * Downloads the full Amazon report and examines the first few records
 * to understand the data structure
 */

import { getAmazonSearchTermsService } from '../src/lib/amazon-search-terms-service'
import { createWriteStream, createReadStream } from 'fs'
import { pipeline } from 'stream/promises'
import axios from 'axios'
import zlib from 'zlib'
import readline from 'readline'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

async function main() {
  console.log('📊 Examine Amazon Data Structure')
  console.log('===============================\n')

  const reportDocumentId = 'amzn1.spdoc.1.4.na.6d986d56-62b0-4388-9d55-caf9b1f14565.T388EG3WWJ83OU.5600'

  try {
    const amazonService = getAmazonSearchTermsService()
    
    console.log('1️⃣  Getting download URL...')
    const client = (amazonService as any).client
    const documentResponse = await client.callAPI({
      operation: 'getReportDocument',
      endpoint: 'reports',
      path: { reportDocumentId }
    })

    console.log(`   ✅ Download URL received`)
    
    const compressedPath = '/tmp/amazon-report-full.gz'
    const extractedPath = '/tmp/amazon-report-full.json'

    console.log('2️⃣  Downloading full report (this may take a few minutes)...')
    const response = await axios({
      method: 'GET',
      url: documentResponse.url,
      responseType: 'stream'
    })

    await pipeline(
      response.data,
      createWriteStream(compressedPath)
    )

    console.log('3️⃣  Extracting report...')
    await pipeline(
      createReadStream(compressedPath),
      zlib.createGunzip(),
      createWriteStream(extractedPath)
    )

    console.log('4️⃣  Analyzing first 100 lines...')
    const rl = readline.createInterface({
      input: createReadStream(extractedPath),
      crlfDelay: Infinity
    })

    let lineCount = 0
    let foundData = false
    let buffer = ''
    let recordCount = 0

    for await (const line of rl) {
      lineCount++
      
      if (lineCount <= 20) {
        console.log(`   Line ${lineCount}: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`)
      }
      
      if (line.includes('"dataByDepartmentAndSearchTerm"')) {
        console.log(`\n   🎯 Found data section at line ${lineCount}!`)
        foundData = true
        continue
      }

      if (foundData && recordCount < 3) {
        buffer += line.trim()
        
        if (buffer.includes('"conversionShare"') && line.includes('}')) {
          try {
            const match = buffer.match(/\{[^{}]*"conversionShare"[^{}]*\}/)
            if (match) {
              const record = JSON.parse(match[0])
              recordCount++
              console.log(`\n   📋 Record ${recordCount}:`)
              console.log(`   ${JSON.stringify(record, null, 2)}`)
              buffer = ''
            }
          } catch (e) {
            // Continue
          }
        }
      }
      
      if (lineCount > 1000 && recordCount >= 3) break
    }

    if (!foundData) {
      console.log('\n   ⚠️  No "dataByDepartmentAndSearchTerm" section found')
    }

    console.log('\n✅ Analysis complete!')

  } catch (error) {
    console.error('\n❌ Analysis failed:', error)
  }
}

main().catch(console.error)