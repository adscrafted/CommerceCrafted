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

  console.log('📊 Checking BigQuery Table Schema');
  console.log('==================================\n');

  try {
    const dataset = bigquery.dataset('amazon_analytics');
    const table = dataset.table('search_terms');
    const [metadata] = await table.getMetadata();
    
    console.log('Table: search_terms');
    console.log('Schema:');
    metadata.schema.fields.forEach(field => {
      console.log(`  - ${field.name} (${field.type})`);
    });

    // Check row count with correct column name
    const [rows] = await bigquery.query({
      query: 'SELECT COUNT(*) as count FROM `commercecrafted.amazon_analytics.search_terms`'
    });
    console.log(`\nTotal rows: ${rows[0].count.toLocaleString()}`);

    // Check for specific week
    const [weekRows] = await bigquery.query({
      query: `SELECT COUNT(*) as count FROM commercecrafted.amazon_analytics.search_terms WHERE week_start_date = '2025-04-06'`
    });
    console.log(`Rows for 2025-04-06: ${weekRows[0].count.toLocaleString()}`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();