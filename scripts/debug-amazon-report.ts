#!/usr/bin/env node

/**
 * Debug Amazon Report Format
 * 
 * This script downloads and examines the Amazon report structure
 * to understand the data format for proper parsing.
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
  console.log('🔍 Debug Amazon Report Format')
  console.log('=============================\n')

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
    console.log(`   📦 Size: ${(documentResponse.fileSize / 1024 / 1024).toFixed(2)} MB compressed`)

    console.log('\n2️⃣  Downloading sample (first 10MB)...')
    const response = await axios({
      method: 'GET',
      url: documentResponse.url,
      responseType: 'stream',
      headers: {
        'Range': 'bytes=0-10485760' // First 10MB
      }
    })

    const compressedPath = '/tmp/debug-sample.gz'
    const extractedPath = '/tmp/debug-sample.json'

    await pipeline(
      response.data,
      createWriteStream(compressedPath)
    )

    console.log('3️⃣  Extracting sample...')
    await pipeline(
      createReadStream(compressedPath),
      zlib.createGunzip(),
      createWriteStream(extractedPath)
    )

    console.log('4️⃣  Analyzing structure...')
    const rl = readline.createInterface({
      input: createReadStream(extractedPath),
      crlfDelay: Infinity
    })

    let lineCount = 0
    let sampleData: any = null
    let inDataSection = false
    let buffer = ''

    for await (const line of rl) {
      lineCount++
      
      if (line.includes('"dataByDepartmentAndSearchTerm"')) {
        console.log(`   📊 Found data section at line ${lineCount}`)
        inDataSection = true
        continue
      }

      if (inDataSection && !sampleData) {
        buffer += line.trim()
        
        if (buffer.includes('"conversionShare"') && line.includes('}')) {
          try {
            const match = buffer.match(/\{[^}]+\}/)
            if (match) {
              sampleData = JSON.parse(match[0])
              console.log('   ✅ Found sample record:')
              console.log('   📋 Structure:', Object.keys(sampleData))
              console.log('   📄 Sample:', JSON.stringify(sampleData, null, 2))
              break
            }
          } catch (e) {
            // Continue trying
          }
        }
        
        if (lineCount > 1000) break // Safety limit
      }
    }

    if (!sampleData) {
      console.log('   ⚠️  No data records found in sample')
      console.log('   📝 First 5 lines:')
      
      const rl2 = readline.createInterface({
        input: createReadStream(extractedPath),
        crlfDelay: Infinity
      })
      
      let count = 0
      for await (const line of rl2) {
        if (count < 5) {
          console.log(`      ${count + 1}: ${line.substring(0, 100)}...`)
        }
        count++
        if (count >= 5) break
      }
    }

    console.log('\n✅ Debug complete!')

  } catch (error) {
    console.error('\n❌ Debug failed:', error)
  }
}

main().catch(console.error)