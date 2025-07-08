#!/usr/bin/env node
import { config } from 'dotenv';
import { BigQuery } from '@google-cloud/bigquery';
import { createReadStream, createWriteStream, statSync } from 'fs';
import { join } from 'path';
import { Transform } from 'stream';
import { pipeline } from 'stream/promises';

config({ path: '.env.local' });

const inputFile = process.argv[2];
if (!inputFile) {
  console.error('Usage: tsx scripts/process-correct-format.ts <json-file>');
  process.exit(1);
}

const outputFile = inputFile.replace('.json', '.bigquery.ndjson');

async function processAndUpload() {
  const bigquery = new BigQuery({
    projectId: 'commercecrafted',
    keyFilename: join(process.cwd(), 'google-service-key.json')
  });

  console.log('📤 Processing Amazon Report for BigQuery');
  console.log('=======================================\n');

  const fileSize = statSync(inputFile).size;
  console.log(`File: ${inputFile}`);
  console.log(`Size: ${(fileSize / 1024 / 1024 / 1024).toFixed(2)} GB\n`);

  // First, convert to NDJSON format
  console.log('📊 Converting to NDJSON format...');
  
  let recordCount = 0;
  let currentSearchTerm = null;
  let currentDepartment = null;
  let currentRank = null;
  let topProducts = [];
  let buffer = '';
  let inDataArray = false;

  const transformer = new Transform({
    transform(chunk, encoding, callback) {
      buffer += chunk.toString();
      
      // Look for the start of the data array
      if (!inDataArray) {
        const dataStart = buffer.indexOf('"dataByDepartmentAndSearchTerm" : [');
        if (dataStart !== -1) {
          inDataArray = true;
          buffer = buffer.substring(dataStart + '"dataByDepartmentAndSearchTerm" : ['.length);
        }
      }
      
      if (inDataArray) {
        // Process complete records
        let recordEnd;
        while ((recordEnd = buffer.indexOf('}, {')) !== -1 || (recordEnd = buffer.indexOf('} ]')) !== -1) {
          const isLastRecord = buffer.indexOf('} ]') === recordEnd;
          const record = buffer.substring(0, recordEnd + 1);
          buffer = buffer.substring(recordEnd + (isLastRecord ? 3 : 4));
          
          try {
            const parsed = JSON.parse(record);
            
            // Check if this is a new search term
            if (parsed.searchTerm !== currentSearchTerm || 
                parsed.departmentName !== currentDepartment || 
                parsed.searchFrequencyRank !== currentRank) {
              
              // Output the previous search term if we have data
              if (currentSearchTerm && topProducts.length > 0) {
                const outputRecord = {
                  search_term: currentSearchTerm,
                  search_frequency_rank: currentRank,
                  department: currentDepartment,
                  clicked_asin_1: topProducts[0]?.asin || '',
                  product_title_1: topProducts[0]?.title || '',
                  click_share_1: topProducts[0]?.clickShare || 0,
                  conversion_share_1: topProducts[0]?.conversionShare || 0,
                  clicked_asin_2: topProducts[1]?.asin || '',
                  product_title_2: topProducts[1]?.title || '',
                  click_share_2: topProducts[1]?.clickShare || 0,
                  conversion_share_2: topProducts[1]?.conversionShare || 0,
                  clicked_asin_3: topProducts[2]?.asin || '',
                  product_title_3: topProducts[2]?.title || '',
                  click_share_3: topProducts[2]?.clickShare || 0,
                  conversion_share_3: topProducts[2]?.conversionShare || 0,
                  total_click_share: topProducts.reduce((sum, p) => sum + (p?.clickShare || 0), 0),
                  total_conversion_share: topProducts.reduce((sum, p) => sum + (p?.conversionShare || 0), 0),
                  report_id: '1520525020276',
                  marketplace_id: 'ATVPDKIKX0DER',
                  week_start_date: '2025-04-06',
                  week_end_date: '2025-04-12',
                  ingested_at: new Date().toISOString()
                };
                
                this.push(JSON.stringify(outputRecord) + '\n');
                recordCount++;
                
                if (recordCount % 10000 === 0) {
                  console.log(`  Processed ${recordCount.toLocaleString()} search terms...`);
                }
              }
              
              // Start new search term
              currentSearchTerm = parsed.searchTerm;
              currentDepartment = parsed.departmentName;
              currentRank = parsed.searchFrequencyRank;
              topProducts = [];
            }
            
            // Add this product to the list
            topProducts.push({
              asin: parsed.clickedAsin,
              title: parsed.clickedItemName,
              clickShare: parseFloat(parsed.clickShare) || 0,
              conversionShare: parseFloat(parsed.conversionShare) || 0,
              clickShareRank: parsed.clickShareRank
            });
            
          } catch (e) {
            // Skip malformed records
          }
          
          if (isLastRecord) {
            // Output the last search term
            if (currentSearchTerm && topProducts.length > 0) {
              const outputRecord = {
                search_term: currentSearchTerm,
                search_frequency_rank: currentRank,
                department: currentDepartment,
                clicked_asin_1: topProducts[0]?.asin || '',
                product_title_1: topProducts[0]?.title || '',
                click_share_1: topProducts[0]?.clickShare || 0,
                conversion_share_1: topProducts[0]?.conversionShare || 0,
                clicked_asin_2: topProducts[1]?.asin || '',
                product_title_2: topProducts[1]?.title || '',
                click_share_2: topProducts[1]?.clickShare || 0,
                conversion_share_2: topProducts[1]?.conversionShare || 0,
                clicked_asin_3: topProducts[2]?.asin || '',
                product_title_3: topProducts[2]?.title || '',
                click_share_3: topProducts[2]?.clickShare || 0,
                conversion_share_3: topProducts[2]?.conversionShare || 0,
                total_click_share: topProducts.reduce((sum, p) => sum + (p?.clickShare || 0), 0),
                total_conversion_share: topProducts.reduce((sum, p) => sum + (p?.conversionShare || 0), 0),
                report_id: '1520525020276',
                marketplace_id: 'ATVPDKIKX0DER',
                week_start_date: '2025-04-06',
                week_end_date: '2025-04-12',
                ingested_at: new Date().toISOString()
              };
              
              this.push(JSON.stringify(outputRecord) + '\n');
              recordCount++;
            }
            inDataArray = false;
          }
        }
      }
      
      callback();
    }
  });

  await pipeline(
    createReadStream(inputFile),
    transformer,
    createWriteStream(outputFile)
  );

  console.log(`\n✅ Conversion complete! Total search terms: ${recordCount.toLocaleString()}`);
  console.log(`Output file: ${outputFile}\n`);

  // Upload to BigQuery
  console.log('📤 Uploading to BigQuery...');
  
  const dataset = bigquery.dataset('amazon_analytics');
  const table = dataset.table('search_terms');
  
  const [job] = await table.load(outputFile, {
    sourceFormat: 'NEWLINE_DELIMITED_JSON',
    writeDisposition: 'WRITE_APPEND'
  });
  
  console.log('⏳ Upload job started, waiting for completion...');
  const [jobResult] = await job.promise();
  
  console.log('✅ Upload complete!');
  
  // Check final count
  const [rows] = await bigquery.query({
    query: 'SELECT COUNT(*) as count FROM `commercecrafted.amazon_analytics.search_terms`'
  });
  console.log(`\nTotal rows in table: ${rows[0].count.toLocaleString()}`);
}

processAndUpload().catch(console.error);