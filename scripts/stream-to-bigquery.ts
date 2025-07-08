#!/usr/bin/env node
import { config } from 'dotenv';
import { BigQuery } from '@google-cloud/bigquery';
import { createReadStream } from 'fs';
import { join } from 'path';
import readline from 'readline';

config({ path: '.env.local' });

const inputFile = process.argv[2];
if (!inputFile) {
  console.error('Usage: tsx scripts/stream-to-bigquery.ts <json-file>');
  process.exit(1);
}

async function streamToBigQuery() {
  const bigquery = new BigQuery({
    projectId: 'commercecrafted',
    keyFilename: join(process.cwd(), 'google-service-key.json')
  });

  console.log('📤 Streaming Amazon Report to BigQuery');
  console.log('=====================================\n');

  console.log(`File: ${inputFile}\n`);

  const dataset = bigquery.dataset('amazon_analytics');
  const table = dataset.table('search_terms');
  
  const rl = readline.createInterface({
    input: createReadStream(inputFile),
    crlfDelay: Infinity
  });

  let inDataSection = false;
  let recordCount = 0;
  let batchRecords = [];
  const batchSize = 500;
  let searchTermData = new Map();

  console.log('⏳ Processing file...\n');

  for await (const line of rl) {
    // Check if we're entering the data section
    if (line.includes('"dataByDepartmentAndSearchTerm" : [')) {
      inDataSection = true;
      continue;
    }
    
    // Check if we're exiting the data section
    if (inDataSection && line.includes('] }')) {
      inDataSection = false;
      break;
    }
    
    if (inDataSection) {
      try {
        // Clean up the line
        let jsonLine = line.trim();
        if (jsonLine.endsWith(',')) {
          jsonLine = jsonLine.slice(0, -1);
        }
        
        // Skip empty lines or array brackets
        if (!jsonLine || jsonLine === '}' || jsonLine === '{' || jsonLine.length < 10) {
          continue;
        }
        
        // Try to parse as complete record
        if (jsonLine.startsWith('{') && jsonLine.endsWith('}')) {
          const record = JSON.parse(jsonLine);
          
          // Create composite key
          const key = `${record.departmentName}|${record.searchTerm}|${record.searchFrequencyRank}`;
          
          if (!searchTermData.has(key)) {
            searchTermData.set(key, {
              search_term: record.searchTerm,
              search_frequency_rank: record.searchFrequencyRank,
              department: record.departmentName,
              products: []
            });
          }
          
          const data = searchTermData.get(key);
          data.products.push({
            asin: record.clickedAsin,
            title: record.clickedItemName,
            clickShare: parseFloat(record.clickShare) || 0,
            conversionShare: parseFloat(record.conversionShare) || 0,
            clickShareRank: record.clickShareRank || 999
          });
          
          // Sort by click share rank
          data.products.sort((a, b) => a.clickShareRank - b.clickShareRank);
          
          recordCount++;
          
          if (recordCount % 10000 === 0) {
            console.log(`   Processed ${recordCount.toLocaleString()} product records...`);
          }
        }
      } catch (e) {
        // Skip malformed records
      }
    }
  }

  console.log(`\n📊 Converting to search term records...`);
  
  // Convert to BigQuery format
  for (const [key, data] of searchTermData) {
    const bqRecord = {
      search_term: data.search_term,
      search_frequency_rank: data.search_frequency_rank,
      department: data.department,
      clicked_asin_1: data.products[0]?.asin || '',
      product_title_1: data.products[0]?.title || '',
      click_share_1: data.products[0]?.clickShare || 0,
      conversion_share_1: data.products[0]?.conversionShare || 0,
      clicked_asin_2: data.products[1]?.asin || '',
      product_title_2: data.products[1]?.title || '',
      click_share_2: data.products[1]?.clickShare || 0,
      conversion_share_2: data.products[1]?.conversionShare || 0,
      clicked_asin_3: data.products[2]?.asin || '',
      product_title_3: data.products[2]?.title || '',
      click_share_3: data.products[2]?.clickShare || 0,
      conversion_share_3: data.products[2]?.conversionShare || 0,
      total_click_share: data.products.slice(0, 3).reduce((sum, p) => sum + (p?.clickShare || 0), 0),
      total_conversion_share: data.products.slice(0, 3).reduce((sum, p) => sum + (p?.conversionShare || 0), 0),
      report_id: '1520525020276',
      marketplace_id: 'ATVPDKIKX0DER',
      week_start_date: '2025-04-06',
      week_end_date: '2025-04-12',
      ingested_at: new Date().toISOString()
    };
    
    batchRecords.push(bqRecord);
    
    // Insert in batches
    if (batchRecords.length >= batchSize) {
      try {
        await table.insert(batchRecords);
        console.log(`   ✅ Inserted batch of ${batchRecords.length} records`);
      } catch (error) {
        console.error('   ❌ Batch insert failed:', error.message);
        // Try individual inserts
        for (const rec of batchRecords) {
          try {
            await table.insert([rec]);
          } catch (e) {
            // Skip failed records
          }
        }
      }
      batchRecords = [];
    }
  }
  
  // Insert remaining records
  if (batchRecords.length > 0) {
    try {
      await table.insert(batchRecords);
      console.log(`   ✅ Inserted final batch of ${batchRecords.length} records`);
    } catch (error) {
      console.error('   ❌ Final batch insert failed:', error.message);
    }
  }

  console.log(`\n✅ Processing complete!`);
  console.log(`   📊 Total search terms: ${searchTermData.size.toLocaleString()}`);
  console.log(`   📦 Total product records: ${recordCount.toLocaleString()}`);
  
  // Check final count
  const [rows] = await bigquery.query({
    query: 'SELECT COUNT(*) as count FROM `commercecrafted.amazon_analytics.search_terms`'
  });
  console.log(`   🗄️  Total rows in BigQuery: ${rows[0].count.toLocaleString()}`);
}

streamToBigQuery().catch(console.error);