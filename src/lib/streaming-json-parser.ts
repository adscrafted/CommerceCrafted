// Streaming JSON Parser for Large Amazon Reports
import { createReadStream, createWriteStream } from 'fs'
import readline from 'readline'

export async function transformAmazonReportStreaming(
  inputPath: string,
  outputPath: string,
  reportMetadata: {
    reportId: string
    marketplaceId: string
    weekStartDate: string
    weekEndDate: string
  }
): Promise<number> {
  return new Promise((resolve, reject) => {
    console.log('Streaming and parsing large Amazon JSON report...')
    
    let recordCount = 0
    const output = createWriteStream(outputPath)
    
    // Use readline to process large files line by line
    const rl = readline.createInterface({
      input: createReadStream(inputPath),
      crlfDelay: Infinity
    })

    let inDataSection = false
    let buffer = ''
    let braceLevel = 0

    rl.on('line', (line) => {
      // Look for the data section
      if (line.includes('"dataByDepartmentAndSearchTerm"')) {
        inDataSection = true
        return
      }

      if (!inDataSection) return

      // Track brace levels to find complete records
      for (const char of line) {
        if (char === '{') braceLevel++
        if (char === '}') braceLevel--
      }

      buffer += line + '\n'

      // When we have a complete record (braces balanced and ends with })
      if (braceLevel === 0 && buffer.trim().endsWith('}')) {
        try {
          // Clean up the buffer - remove array syntax and trailing commas
          let recordJson = buffer.trim()
          if (recordJson.endsWith(',')) {
            recordJson = recordJson.slice(0, -1)
          }
          
          // Remove any leading array bracket or comma
          recordJson = recordJson.replace(/^\s*,?\s*/, '')
          
          // Skip if it's just closing array bracket
          if (recordJson === '}' || recordJson === ']') {
            buffer = ''
            return
          }

          const record = JSON.parse(recordJson)
          
          // Only process if it has the expected fields
          if (record.searchTerm && record.departmentName) {
            // Transform to BigQuery format matching the schema
            const bqRecord = {
              report_id: reportMetadata.reportId,
              marketplace_id: reportMetadata.marketplaceId,
              week_start_date: reportMetadata.weekStartDate,
              week_end_date: reportMetadata.weekEndDate,
              department: record.departmentName,
              search_term: record.searchTerm,
              search_frequency_rank: record.searchFrequencyRank,
              // Map to _1 fields for first ASIN (Amazon reports show top 3 but this data has 1)
              clicked_asin_1: record.clickedAsin,
              product_title_1: record.clickedItemName,
              click_share_1: record.clickShare,
              conversion_share_1: record.conversionShare,
              // Set other ASIN fields to null since this data format only has 1 ASIN per term
              clicked_asin_2: null,
              product_title_2: null,
              click_share_2: null,
              conversion_share_2: null,
              clicked_asin_3: null,
              product_title_3: null,
              click_share_3: null,
              conversion_share_3: null,
              // Calculate totals
              total_click_share: record.clickShare || 0,
              total_conversion_share: record.conversionShare || 0,
              ingested_at: new Date().toISOString()
            }

            output.write(JSON.stringify(bqRecord) + '\n')
            recordCount++

            if (recordCount % 50000 === 0) {
              console.log(`Transformed ${recordCount} records...`)
            }
          }
          
          // Reset buffer
          buffer = ''
          
        } catch (e) {
          // Skip malformed records but log occasionally
          if (recordCount % 10000 === 0) {
            console.warn(`Skipping malformed record at count ${recordCount}`)
          }
          buffer = ''
        }
      }
    })

    rl.on('close', () => {
      output.end()
      console.log(`Total records transformed: ${recordCount}`)
      resolve(recordCount)
    })

    rl.on('error', (error) => {
      reject(error)
    })
  })
}