// Stream download large report file
import dotenv from 'dotenv'
import axios from 'axios'
import zlib from 'zlib'
import fs from 'fs'
import { pipeline } from 'stream/promises'
import { getAmazonSearchTermsService } from '../src/lib/amazon-search-terms-service'

dotenv.config({ path: '.env.local' })

async function streamDownloadReport() {
  const reportDocumentId = 'amzn1.spdoc.1.4.na.6d986d56-62b0-4388-9d55-caf9b1f14565.T388EG3WWJ83OU.5600'
  
  console.log('Stream downloading large report...\n')

  try {
    const service = getAmazonSearchTermsService()
    const client = (service as any).client
    
    // Get download URL
    const documentResponse = await client.callAPI({
      operation: 'getReportDocument',
      endpoint: 'reports',
      path: { reportDocumentId }
    })

    console.log('Download URL obtained')
    console.log('Compression:', documentResponse.compressionAlgorithm)

    // Stream download to file
    const tempGzPath = '/tmp/report-compressed.gz'
    const csvPath = '/tmp/amazon-search-terms-full.csv'
    
    console.log('\nDownloading compressed file...')
    const response = await axios({
      method: 'GET',
      url: documentResponse.url,
      responseType: 'stream'
    })

    // Save compressed file
    await pipeline(
      response.data,
      fs.createWriteStream(tempGzPath)
    )

    const stats = fs.statSync(tempGzPath)
    console.log(`Downloaded: ${(stats.size / 1024 / 1024).toFixed(2)} MB (compressed)`)

    // Decompress
    console.log('\nDecompressing...')
    await pipeline(
      fs.createReadStream(tempGzPath),
      zlib.createGunzip(),
      fs.createWriteStream(csvPath)
    )

    const csvStats = fs.statSync(csvPath)
    console.log(`Decompressed: ${(csvStats.size / 1024 / 1024).toFixed(2)} MB`)

    // Read first few lines
    console.log('\nReading first 10 lines...')
    const readline = require('readline')
    const fileStream = fs.createReadStream(csvPath)
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    })

    let lineCount = 0
    const sampleLines: string[] = []
    
    for await (const line of rl) {
      lineCount++
      if (lineCount <= 10) {
        console.log(`Line ${lineCount}: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`)
        sampleLines.push(line)
      }
      if (lineCount === 10) {
        rl.close()
        break
      }
    }

    // Count total lines
    console.log('\nCounting total lines...')
    const countStream = fs.createReadStream(csvPath)
    const countRl = readline.createInterface({
      input: countStream,
      crlfDelay: Infinity
    })

    let totalLines = 0
    for await (const line of countRl) {
      totalLines++
    }

    console.log(`Total lines: ${totalLines.toLocaleString()}`)
    console.log(`\n✅ Report successfully downloaded to: ${csvPath}`)
    console.log(`   Compressed file: ${tempGzPath}`)

    // Parse headers
    if (sampleLines.length > 0) {
      const headers = sampleLines[0].split('\t')
      console.log(`\nHeaders (${headers.length} columns):`)
      headers.forEach((h, i) => console.log(`  ${i + 1}. ${h}`))
    }

  } catch (error) {
    console.error('Error:', error)
  }
}

streamDownloadReport().catch(console.error)