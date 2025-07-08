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

  console.log('📊 Checking BigQuery Data Count');
  console.log('================================\n');

  try {
    // Check search_terms table
    const [searchTermsRows] = await bigquery.query({
      query: 'SELECT COUNT(*) as count FROM `commercecrafted.amazon_analytics.search_terms`'
    });
    console.log(`search_terms table: ${searchTermsRows[0].count.toLocaleString()} rows`);

    // Check search_terms_weekly_summary table  
    const [summaryRows] = await bigquery.query({
      query: 'SELECT COUNT(*) as count FROM `commercecrafted.amazon_analytics.search_terms_weekly_summary`'
    });
    console.log(`search_terms_weekly_summary table: ${summaryRows[0].count.toLocaleString()} rows`);

    // Check distinct weeks in search_terms
    const [weeksRows] = await bigquery.query({
      query: 'SELECT DISTINCT weekStartDate FROM `commercecrafted.amazon_analytics.search_terms` ORDER BY weekStartDate DESC LIMIT 10'
    });
    console.log('\nDistinct weeks in search_terms:');
    weeksRows.forEach(row => {
      console.log(`  - ${row.weekStartDate.value}`);
    });

    // Check if we have data for 2025-04-06
    const [aprilData] = await bigquery.query({
      query: `SELECT COUNT(*) as count FROM commercecrafted.amazon_analytics.search_terms WHERE weekStartDate = '2025-04-06'`
    });
    console.log(`\nData for 2025-04-06: ${aprilData[0].count.toLocaleString()} rows`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();