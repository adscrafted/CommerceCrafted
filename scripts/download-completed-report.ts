// Download and process the completed report
import dotenv from 'dotenv'
import { getAmazonSearchTermsService } from '../src/lib/amazon-search-terms-service'
import axios from 'axios'
import zlib from 'zlib'
import fs from 'fs/promises'

dotenv.config({ path: '.env.local' })

async function downloadCompletedReport() {
  const reportDocumentId = 'amzn1.spdoc.1.4.na.6d986d56-62b0-4388-9d55-caf9b1f14565.T388EG3WWJ83OU.5600'
  
  console.log('Downloading completed report...\n')

  try {
    const service = getAmazonSearchTermsService()
    
    // Get the download URL
    const client = (service as any).client
    const documentResponse = await client.callAPI({
      operation: 'getReportDocument',
      endpoint: 'reports',
      path: {
        reportDocumentId: reportDocumentId
      }
    })

    console.log('Got download URL, fetching report...')
    console.log('Compression:', documentResponse.compressionAlgorithm)

    // Download the compressed data
    const response = await axios.get(documentResponse.url, {
      responseType: 'arraybuffer',
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    })

    console.log(`Downloaded ${response.data.byteLength} bytes (compressed)`)

    // Decompress
    let csvData: string
    if (documentResponse.compressionAlgorithm === 'GZIP') {
      const decompressed = zlib.gunzipSync(Buffer.from(response.data))
      csvData = decompressed.toString('utf-8')
      console.log(`Decompressed to ${csvData.length} characters`)
    } else {
      csvData = response.data.toString('utf-8')
    }

    // Save raw CSV
    const csvPath = '/tmp/amazon-search-terms-report.csv'
    await fs.writeFile(csvPath, csvData)
    console.log(`\nRaw CSV saved to: ${csvPath}`)

    // Get first few lines to see the format
    const lines = csvData.split('\n')
    console.log(`\nTotal lines: ${lines.length}`)
    console.log('\nFirst 5 lines:')
    lines.slice(0, 5).forEach((line, i) => {
      console.log(`${i + 1}: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`)
    })

    // Parse a sample of the data
    console.log('\nParsing sample data...')
    const sampleLines = lines.slice(0, 100).join('\n')
    const sampleData = service.parseSearchTermsReport(sampleLines)
    
    console.log(`Parsed ${sampleData.length} sample search terms`)

    // Show top 10
    console.log('\nTop 10 search terms:')
    sampleData.slice(0, 10).forEach((term, i) => {
      console.log(`\n${i + 1}. "${term.searchTerm}"`)
      console.log(`   Rank: ${term.searchVolume}`)
      console.log(`   Click Share: ${(term.clickShare * 100).toFixed(2)}%`)
      console.log(`   Conversion Share: ${(term.conversionShare * 100).toFixed(2)}%`)
      if (term.clickedAsin) {
        console.log(`   Top ASIN: ${term.clickedAsin}`)
      }
    })

    // Save sample JSON
    const jsonPath = '/tmp/amazon-search-terms-sample.json'
    await fs.writeFile(jsonPath, JSON.stringify(sampleData, null, 2))
    console.log(`\nSample JSON saved to: ${jsonPath}`)

    console.log('\n✅ Report downloaded and processed successfully!')
    console.log('Full CSV available at:', csvPath)

  } catch (error) {
    console.error('Error:', error)
  }
}

downloadCompletedReport().catch(console.error)