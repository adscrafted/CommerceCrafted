#!/usr/bin/env node
import { config } from 'dotenv';
import { BigQuery } from '@google-cloud/bigquery';
import { createReadStream, statSync } from 'fs';
import { join } from 'path';
import { Transform } from 'stream';
import { pipeline } from 'stream/promises';

config({ path: '.env.local' });

const inputFile = process.argv[2];
if (!inputFile) {
  console.error('Usage: tsx scripts/simple-upload.ts <json-file>');
  process.exit(1);
}

async function main() {
  const bigquery = new BigQuery({
    projectId: 'commercecrafted',
    keyFilename: join(process.cwd(), 'google-service-key.json')
  });

  console.log('📤 Simple BigQuery Upload');
  console.log('========================\n');

  const fileSize = statSync(inputFile).size;
  console.log(`File: ${inputFile}`);
  console.log(`Size: ${(fileSize / 1024 / 1024 / 1024).toFixed(2)} GB\n`);

  // First, let's extract a small sample to test
  console.log('📊 Extracting sample data...');
  
  const sampleData = [];
  let recordCount = 0;
  let inDataArray = false;
  let buffer = '';
  let sampleComplete = false;

  const sampleTransformer = new Transform({
    transform(chunk, encoding, callback) {
      if (sampleComplete) {
        callback();
        return;
      }

      buffer += chunk.toString();
      
      // Look for the start of the data array
      if (!inDataArray) {
        const dataStart = buffer.indexOf('"dataByDepartmentAndSearchTerm":[');
        if (dataStart !== -1) {
          inDataArray = true;
          buffer = buffer.substring(dataStart + '"dataByDepartmentAndSearchTerm":['.length);
        }
      }
      
      if (inDataArray) {
        // Process complete records
        let recordEnd;
        while ((recordEnd = buffer.indexOf('},')) !== -1 && recordCount < 10) {
          const record = buffer.substring(0, recordEnd + 1);
          buffer = buffer.substring(recordEnd + 2);
          
          try {
            const parsed = JSON.parse(record);
            sampleData.push({
              search_term: parsed.searchTerm || '',
              search_frequency_rank: parseInt(parsed.searchFrequencyRank) || 0,
              department: parsed.departmentName || '',
              clicked_asin_1: parsed.clickedAsin1 || '',
              product_title_1: parsed.productTitle1 || '',
              click_share_1: parseFloat(parsed.clickShare1) || 0,
              conversion_share_1: parseFloat(parsed.conversionShare1) || 0,
              clicked_asin_2: parsed.clickedAsin2 || '',
              product_title_2: parsed.productTitle2 || '',
              click_share_2: parseFloat(parsed.clickShare2) || 0,
              conversion_share_2: parseFloat(parsed.conversionShare2) || 0,
              clicked_asin_3: parsed.clickedAsin3 || '',
              product_title_3: parsed.productTitle3 || '',
              click_share_3: parseFloat(parsed.clickShare3) || 0,
              conversion_share_3: parseFloat(parsed.conversionShare3) || 0,
              total_click_share: (parseFloat(parsed.clickShare1) || 0) + (parseFloat(parsed.clickShare2) || 0) + (parseFloat(parsed.clickShare3) || 0),
              total_conversion_share: (parseFloat(parsed.conversionShare1) || 0) + (parseFloat(parsed.conversionShare2) || 0) + (parseFloat(parsed.conversionShare3) || 0),
              report_id: '1520525020276',
              marketplace_id: 'ATVPDKIKX0DER',
              week_start_date: '2025-04-06',
              week_end_date: '2025-04-12',
              ingested_at: new Date().toISOString()
            });
            recordCount++;
            
            if (recordCount >= 10) {
              sampleComplete = true;
            }
          } catch (e) {
            // Skip malformed records
          }
        }
      }
      
      callback();
    }
  });

  await pipeline(
    createReadStream(inputFile, { end: 1024 * 1024 * 10 }), // Read first 10MB
    sampleTransformer
  );

  console.log(`Sample records extracted: ${sampleData.length}\n`);
  console.log('First record:', JSON.stringify(sampleData[0], null, 2));

  // Insert sample data
  console.log('\n📤 Inserting sample data to BigQuery...');
  
  const dataset = bigquery.dataset('amazon_analytics');
  const table = dataset.table('search_terms');
  
  try {
    await table.insert(sampleData);
    console.log('✅ Sample data inserted successfully!');
    
    // Check count
    const [rows] = await bigquery.query({
      query: 'SELECT COUNT(*) as count FROM `commercecrafted.amazon_analytics.search_terms`'
    });
    console.log(`\nTotal rows in table: ${rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Insert failed:', error);
    if (error.errors && error.errors.length > 0) {
      console.error('Detailed errors:', JSON.stringify(error.errors[0], null, 2));
    }
  }
}

main().catch(console.error);