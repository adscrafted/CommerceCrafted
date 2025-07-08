#!/usr/bin/env node
import { config } from 'dotenv';
import { createReadStream, createWriteStream, statSync } from 'fs';
import { join } from 'path';
import { pipeline } from 'stream/promises';
import { Transform } from 'stream';
import { BigQuery } from '@google-cloud/bigquery';

config({ path: '.env.local' });

const inputFile = process.argv[2];
if (!inputFile) {
  console.error('Usage: tsx scripts/convert-and-upload.ts <json-file>');
  process.exit(1);
}

const outputFile = inputFile.replace('.json', '.processed.ndjson');

async function convertToNDJSON() {
  console.log('📄 Converting JSON to NDJSON...');
  console.log(`Input: ${inputFile}`);
  console.log(`Output: ${outputFile}`);
  
  const fileSize = statSync(inputFile).size;
  console.log(`File size: ${(fileSize / 1024 / 1024 / 1024).toFixed(2)} GB`);
  
  let recordCount = 0;
  let inDataArray = false;
  let buffer = '';
  
  const transformer = new Transform({
    transform(chunk, encoding, callback) {
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
        while ((recordEnd = buffer.indexOf('},')) !== -1) {
          const record = buffer.substring(0, recordEnd + 1);
          buffer = buffer.substring(recordEnd + 2);
          
          try {
            // Parse and format the record
            const parsed = JSON.parse(record);
            this.push(JSON.stringify({
              weekStartDate: '2025-04-06',
              departmentName: parsed.departmentName || '',
              searchTerm: parsed.searchTerm || '',
              searchFrequencyRank: parseInt(parsed.searchFrequencyRank) || 0,
              clickShareRank1: parseInt(parsed.clickShareRank1) || 0,
              clickShareRank2: parseInt(parsed.clickShareRank2) || 0,
              clickShareRank3: parseInt(parsed.clickShareRank3) || 0,
              conversionShareRank1: parseInt(parsed.conversionShareRank1) || 0,
              conversionShareRank2: parseInt(parsed.conversionShareRank2) || 0,
              conversionShareRank3: parseInt(parsed.conversionShareRank3) || 0,
              clickShare1: parseFloat(parsed.clickShare1) || 0,
              clickShare2: parseFloat(parsed.clickShare2) || 0,
              clickShare3: parseFloat(parsed.clickShare3) || 0,
              conversionShare1: parseFloat(parsed.conversionShare1) || 0,
              conversionShare2: parseFloat(parsed.conversionShare2) || 0,
              conversionShare3: parseFloat(parsed.conversionShare3) || 0,
              clickedAsin1: parsed.clickedAsin1 || '',
              clickedAsin2: parsed.clickedAsin2 || '',
              clickedAsin3: parsed.clickedAsin3 || '',
              brandName1: parsed.brandName1 || '',
              brandName2: parsed.brandName2 || '',
              brandName3: parsed.brandName3 || '',
              productTitle1: parsed.productTitle1 || '',
              productTitle2: parsed.productTitle2 || '',
              productTitle3: parsed.productTitle3 || '',
              clickedAsinLink1: parsed.clickedAsinLink1 || '',
              clickedAsinLink2: parsed.clickedAsinLink2 || '',
              clickedAsinLink3: parsed.clickedAsinLink3 || ''
            }) + '\n');
            
            recordCount++;
            if (recordCount % 100000 === 0) {
              console.log(`Processed ${recordCount.toLocaleString()} records...`);
            }
          } catch (e) {
            // Skip malformed records
          }
        }
        
        // Check for end of array
        if (buffer.includes(']}')) {
          inDataArray = false;
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
  
  console.log(`✅ Conversion complete! Total records: ${recordCount.toLocaleString()}`);
  return outputFile;
}

async function uploadToBigQuery(ndjsonFile: string) {
  console.log('\n📤 Uploading to BigQuery...');
  
  const bigquery = new BigQuery({
    projectId: 'commercecrafted',
    keyFilename: join(process.cwd(), 'google-service-key.json')
  });
  
  const dataset = bigquery.dataset('amazon_data');
  const table = dataset.table('search_terms_weekly');
  
  const [job] = await table.load(ndjsonFile, {
    sourceFormat: 'NEWLINE_DELIMITED_JSON',
    writeDisposition: 'WRITE_APPEND',
    schema: {
      fields: [
        { name: 'weekStartDate', type: 'DATE' },
        { name: 'departmentName', type: 'STRING' },
        { name: 'searchTerm', type: 'STRING' },
        { name: 'searchFrequencyRank', type: 'INTEGER' },
        { name: 'clickShareRank1', type: 'INTEGER' },
        { name: 'clickShareRank2', type: 'INTEGER' },
        { name: 'clickShareRank3', type: 'INTEGER' },
        { name: 'conversionShareRank1', type: 'INTEGER' },
        { name: 'conversionShareRank2', type: 'INTEGER' },
        { name: 'conversionShareRank3', type: 'INTEGER' },
        { name: 'clickShare1', type: 'FLOAT' },
        { name: 'clickShare2', type: 'FLOAT' },
        { name: 'clickShare3', type: 'FLOAT' },
        { name: 'conversionShare1', type: 'FLOAT' },
        { name: 'conversionShare2', type: 'FLOAT' },
        { name: 'conversionShare3', type: 'FLOAT' },
        { name: 'clickedAsin1', type: 'STRING' },
        { name: 'clickedAsin2', type: 'STRING' },
        { name: 'clickedAsin3', type: 'STRING' },
        { name: 'brandName1', type: 'STRING' },
        { name: 'brandName2', type: 'STRING' },
        { name: 'brandName3', type: 'STRING' },
        { name: 'productTitle1', type: 'STRING' },
        { name: 'productTitle2', type: 'STRING' },
        { name: 'productTitle3', type: 'STRING' },
        { name: 'clickedAsinLink1', type: 'STRING' },
        { name: 'clickedAsinLink2', type: 'STRING' },
        { name: 'clickedAsinLink3', type: 'STRING' }
      ]
    }
  });
  
  console.log('⏳ Upload job started, waiting for completion...');
  const [jobResult] = await job.promise();
  console.log('✅ Upload complete!');
  
  return jobResult;
}

async function main() {
  try {
    const ndjsonFile = await convertToNDJSON();
    await uploadToBigQuery(ndjsonFile);
    console.log('\n🎉 Success! Data has been uploaded to BigQuery.');
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();