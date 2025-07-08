# BigQuery Setup Guide for Amazon Search Terms Data

This guide will help you set up Google Cloud BigQuery to store and analyze your Amazon search terms data.

## Prerequisites

- Google Cloud Platform account
- Google Cloud CLI (`gcloud`) installed
- Node.js environment with the project dependencies

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Note your Project ID (e.g., `commerce-crafted-123456`)

## Step 2: Enable BigQuery API

```bash
gcloud services enable bigquery.googleapis.com
```

## Step 3: Create a Service Account

1. In the Cloud Console, go to IAM & Admin > Service Accounts
2. Click "Create Service Account"
3. Name it `bigquery-service-account`
4. Grant the following roles:
   - BigQuery Data Editor
   - BigQuery Job User
5. Create and download a JSON key file

## Step 4: Set Environment Variables

Add these to your `.env` file:

```env
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
BIGQUERY_DATASET=amazon_analytics
```

## Step 5: Initialize BigQuery Tables

Run the initialization script:

```bash
npm run bigquery:init
```

This will create:
- Dataset: `amazon_analytics`
- Table: `search_terms` (partitioned by week_start_date)
- Table: `search_terms_weekly_summary` (aggregated data)

## Step 6: Test the Setup

```bash
npm run bigquery:test
```

## Data Pipeline Overview

1. **Report Generation**: Amazon SP-API creates search terms reports
2. **Download & Extract**: Pipeline downloads compressed JSON (2.87GB uncompressed)
3. **Transform**: Converts to newline-delimited JSON for BigQuery
4. **Load**: Streams data into BigQuery tables
5. **Aggregate**: Creates weekly summaries for fast queries
6. **Cache**: Stores hot data in SQLite for sub-second responses

## Cost Estimates

Based on 150GB annual data:
- **Storage**: ~$3/month (150GB × $0.02/GB)
- **Queries**: ~$5-7/month (assuming 1TB queried)
- **Total**: ~$8-10/month

## API Endpoints

After setup, these endpoints will be available:

- `GET /api/analytics/search-terms/v2` - Query search terms with caching
- `GET /api/analytics/trending` - Get trending search terms

## Query Examples

### Top Search Terms for a Week
```sql
SELECT 
  search_term,
  search_frequency_rank,
  total_click_share,
  top_asin_1
FROM `your-project.amazon_analytics.search_terms_weekly_summary`
WHERE week_start_date = '2024-01-07'
ORDER BY search_frequency_rank
LIMIT 100
```

### Trending Terms (Week over Week)
```sql
WITH current_week AS (
  SELECT search_term, search_frequency_rank
  FROM `your-project.amazon_analytics.search_terms_weekly_summary`
  WHERE week_start_date = '2024-01-14'
),
previous_week AS (
  SELECT search_term, search_frequency_rank
  FROM `your-project.amazon_analytics.search_terms_weekly_summary`
  WHERE week_start_date = '2024-01-07'
)
SELECT 
  c.search_term,
  c.search_frequency_rank as current_rank,
  p.search_frequency_rank as previous_rank,
  p.search_frequency_rank - c.search_frequency_rank as rank_improvement
FROM current_week c
JOIN previous_week p ON c.search_term = p.search_term
WHERE p.search_frequency_rank - c.search_frequency_rank > 100
ORDER BY rank_improvement DESC
LIMIT 50
```

## Monitoring

Monitor your BigQuery usage:
1. Go to BigQuery Console
2. Check the "Job History" for query performance
3. Monitor "Storage" tab for data growth
4. Set up billing alerts at $50/month

## Troubleshooting

### Common Issues

1. **Authentication Error**
   - Verify `GOOGLE_APPLICATION_CREDENTIALS` path is absolute
   - Check service account has BigQuery permissions

2. **Dataset Not Found**
   - Run `npm run bigquery:init` to create dataset
   - Verify `GOOGLE_CLOUD_PROJECT` is correct

3. **Query Timeout**
   - BigQuery queries have a 6-hour timeout
   - For large datasets, use partitioning in WHERE clause

4. **Memory Issues with Large Files**
   - The pipeline uses streaming to handle 2.87GB files
   - Ensure at least 4GB RAM available

## Next Steps

1. Run initialization script to create BigQuery resources
2. Process your existing report (ID: 1520270020276)
3. Set up daily/weekly report automation
4. Configure monitoring and alerts