#!/usr/bin/env node
import { config } from 'dotenv';
import { BigQuery } from '@google-cloud/bigquery';
import { join } from 'path';

config({ path: '.env.local' });

async function main() {
  const bigquery = new BigQuery({
    projectId: 'commercecrafted',
    keyFilename: join(process.cwd(), 'google-service-key.json')
  });

  console.log('📊 Checking All BigQuery Datasets');
  console.log('=================================\n');

  try {
    const [datasets] = await bigquery.getDatasets();
    console.log(`Found ${datasets.length} datasets:\n`);
    
    for (const dataset of datasets) {
      console.log(`Dataset: ${dataset.id}`);
      const [tables] = await dataset.getTables();
      console.log(`  Tables: ${tables.length}`);
      
      for (const table of tables) {
        console.log(`    - ${table.id}`);
      }
    }

    // Check if amazon_data dataset exists
    try {
      const amazonDataDataset = bigquery.dataset('amazon_data');
      const [exists] = await amazonDataDataset.exists();
      console.log(`\namazon_data dataset exists: ${exists}`);
      
      if (exists) {
        const [tables] = await amazonDataDataset.getTables();
        console.log('Tables in amazon_data:');
        for (const table of tables) {
          console.log(`  - ${table.id}`);
        }
      }
    } catch (e) {
      console.log('\namazon_data dataset does not exist');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();