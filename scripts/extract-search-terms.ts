// Extract search terms from the JSON report
import fs from 'fs'
import readline from 'readline'

interface SearchTermRecord {
  departmentName: string
  searchTerm: string
  searchFrequencyRank: number
  clickedAsin: string
  clickedItemName: string
  clickShareRank: number
  clickShare: number
  conversionShare: number
}

async function extractSearchTerms() {
  const filePath = '/tmp/amazon-search-terms-full.csv'
  const outputPath = '/tmp/top-search-terms.json'
  
  console.log('Extracting search terms from report...\n')

  try {
    const fileStream = fs.createReadStream(filePath)
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    })

    let lineCount = 0
    let inDataSection = false
    const searchTermsMap = new Map<string, SearchTermRecord[]>()
    let currentRecord = ''
    let recordCount = 0

    for await (const line of rl) {
      lineCount++
      
      // Start of data section
      if (line.includes('"dataByDepartmentAndSearchTerm"')) {
        inDataSection = true
        console.log('Found data section at line', lineCount)
        continue
      }

      if (!inDataSection) continue

      // Look for complete records
      if (line.includes('"departmentName"')) {
        currentRecord = ''
      }

      currentRecord += line.trim()

      // End of a record
      if (currentRecord.includes('"conversionShare"') && line.includes('}')) {
        try {
          // Extract the JSON object
          const match = currentRecord.match(/\{[^}]+\}/)
          if (match) {
            const jsonStr = match[0]
              .replace(/(\w+)\s*:/g, '"$1":') // Add quotes to keys
              .replace(/:\s*"([^"]+)"/g, (m, p1) => {
                // Don't quote numbers
                if (!isNaN(Number(p1))) return `: ${p1}`
                return m
              })

            const record: SearchTermRecord = JSON.parse(jsonStr)
            recordCount++

            // Group by search term
            if (!searchTermsMap.has(record.searchTerm)) {
              searchTermsMap.set(record.searchTerm, [])
            }
            searchTermsMap.get(record.searchTerm)!.push(record)

            if (recordCount % 10000 === 0) {
              console.log(`Processed ${recordCount.toLocaleString()} records...`)
            }

            // Stop after 100k records for this sample
            if (recordCount >= 100000) {
              console.log('\nReached 100k records limit for sample')
              rl.close()
              break
            }
          }
        } catch (e) {
          // Skip malformed records
        }
        currentRecord = ''
      }
    }

    console.log(`\nTotal records processed: ${recordCount.toLocaleString()}`)
    console.log(`Unique search terms: ${searchTermsMap.size.toLocaleString()}`)

    // Aggregate data by search term
    const aggregatedTerms = Array.from(searchTermsMap.entries()).map(([term, records]) => {
      const firstRecord = records[0]
      const totalClickShare = records.reduce((sum, r) => sum + r.clickShare, 0)
      const totalConversionShare = records.reduce((sum, r) => sum + r.conversionShare, 0)
      
      return {
        searchTerm: term,
        searchFrequencyRank: firstRecord.searchFrequencyRank,
        topProducts: records.slice(0, 3).map(r => ({
          asin: r.clickedAsin,
          name: r.clickedItemName,
          clickShare: r.clickShare,
          conversionShare: r.conversionShare,
          clickShareRank: r.clickShareRank
        })),
        totalClickShare,
        totalConversionShare,
        productCount: records.length
      }
    })

    // Sort by search frequency rank (lower is better)
    aggregatedTerms.sort((a, b) => a.searchFrequencyRank - b.searchFrequencyRank)

    // Save results
    fs.writeFileSync(outputPath, JSON.stringify(aggregatedTerms.slice(0, 1000), null, 2))
    console.log(`\nTop 1000 search terms saved to: ${outputPath}`)

    // Display top 20
    console.log('\nTop 20 Search Terms:')
    console.log('='.repeat(80))
    
    aggregatedTerms.slice(0, 20).forEach((term, i) => {
      console.log(`\n${i + 1}. "${term.searchTerm}" (Rank: ${term.searchFrequencyRank})`)
      console.log(`   Total Click Share: ${(term.totalClickShare * 100).toFixed(2)}%`)
      console.log(`   Total Conversion Share: ${(term.totalConversionShare * 100).toFixed(2)}%`)
      console.log(`   Top Products:`)
      term.topProducts.forEach((product, j) => {
        console.log(`     ${j + 1}. ${product.asin} - ${product.name.substring(0, 50)}...`)
        console.log(`        Click: ${(product.clickShare * 100).toFixed(2)}%, Conv: ${(product.conversionShare * 100).toFixed(2)}%`)
      })
    })

  } catch (error) {
    console.error('Error:', error)
  }
}

extractSearchTerms().catch(console.error)