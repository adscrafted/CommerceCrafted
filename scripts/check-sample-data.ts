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

  console.log('📊 Checking BigQuery Sample Data');
  console.log('================================\n');

  try {
    const [rows] = await bigquery.query({
      query: 'SELECT * FROM `commercecrafted.amazon_analytics.search_terms` LIMIT 5'
    });
    
    console.log(`Found ${rows.length} rows:\n`);
    
    rows.forEach((row, i) => {
      console.log(`Row ${i + 1}:`);
      console.log(`  Search Term: ${row.search_term}`);
      console.log(`  Department: ${row.department}`);
      console.log(`  Rank: ${row.search_frequency_rank}`);
      console.log(`  Product 1: ${row.clicked_asin_1} - ${row.product_title_1?.substring(0, 50)}...`);
      console.log(`  Week: ${row.week_start_date}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();