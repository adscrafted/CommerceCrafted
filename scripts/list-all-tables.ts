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

  console.log('📊 Listing All BigQuery Tables');
  console.log('==============================\n');

  try {
    const [datasets] = await bigquery.getDatasets();
    
    for (const dataset of datasets) {
      console.log(`Dataset: ${dataset.id}`);
      const [tables] = await dataset.getTables();
      
      for (const table of tables) {
        const [metadata] = await table.getMetadata();
        const [rows] = await bigquery.query({
          query: `SELECT COUNT(*) as count FROM \`${dataset.id}.${table.id}\``
        });
        console.log(`  - ${table.id}: ${rows[0].count.toLocaleString()} rows`);
      }
      console.log();
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();