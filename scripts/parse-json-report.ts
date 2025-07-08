// Parse the JSON report format
import fs from 'fs'
import readline from 'readline'

async function parseJSONReport() {
  const filePath = '/tmp/amazon-search-terms-full.csv'
  
  console.log('Parsing JSON report...\n')

  try {
    // Read more lines to understand the structure
    const fileStream = fs.createReadStream(filePath)
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    })

    let lineCount = 0
    let inDataSection = false
    let bracketCount = 0
    const sampleData: any[] = []
    let currentObject = ''

    for await (const line of rl) {
      lineCount++
      
      // Skip first 100 lines (header)
      if (lineCount < 100) {
        if (line.includes('"dataRecords"')) {
          console.log(`Found dataRecords at line ${lineCount}`)
          inDataSection = true
        }
        continue
      }

      // Look for actual data
      if (inDataSection || lineCount > 100) {
        currentObject += line.trim()
        
        // Count brackets to find complete objects
        bracketCount += (line.match(/{/g) || []).length
        bracketCount -= (line.match(/}/g) || []).length

        // When we have a complete object
        if (bracketCount === 0 && currentObject.includes('}')) {
          try {
            // Remove trailing comma if present
            const cleanObject = currentObject.replace(/,\s*$/, '')
            if (cleanObject.startsWith('{') && cleanObject.endsWith('}')) {
              const parsed = JSON.parse(cleanObject)
              sampleData.push(parsed)
              
              if (sampleData.length <= 5) {
                console.log(`\nRecord ${sampleData.length}:`)
                console.log(JSON.stringify(parsed, null, 2))
              }
              
              if (sampleData.length >= 10) {
                rl.close()
                break
              }
            }
          } catch (e) {
            // Not a complete JSON object yet
          }
          currentObject = ''
        }
      }

      if (lineCount > 1000 && sampleData.length === 0) {
        console.log('Could not find data records in first 1000 lines')
        rl.close()
        break
      }
    }

    console.log(`\nFound ${sampleData.length} sample records`)

    // Save sample
    if (sampleData.length > 0) {
      const samplePath = '/tmp/search-terms-sample.json'
      fs.writeFileSync(samplePath, JSON.stringify(sampleData, null, 2))
      console.log(`Sample saved to: ${samplePath}`)

      // Extract search terms
      console.log('\nTop search terms from sample:')
      sampleData.slice(0, 5).forEach((record, i) => {
        if (record.searchTerm) {
          console.log(`${i + 1}. "${record.searchTerm}" - Rank: ${record.searchFrequencyRank}`)
        }
      })
    }

  } catch (error) {
    console.error('Error:', error)
  }
}

parseJSONReport().catch(console.error)