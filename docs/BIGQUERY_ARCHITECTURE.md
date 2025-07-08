# BigQuery Architecture for Amazon Search Terms Data

## Data Scale Analysis

### Current Data Volume
- **Single Report**: 2.87 GB uncompressed
- **Records per Report**: ~67 million rows
- **Frequency**: Weekly reports
- **Annual Data**: ~150 GB (52 weeks)
- **Multi-Year Growth**: Could reach TB scale

### Storage Options Comparison

| Feature | SQLite (Current) | PostgreSQL | BigQuery | Hybrid Approach |
|---------|-----------------|------------|----------|-----------------|
| **Scale** | ❌ Max 281 TB but slow | ⚠️ Good to ~10TB | ✅ Petabyte scale | ✅ Best of both |
| **Query Speed** | ❌ Slow on large data | ⚠️ Needs indexing | ✅ Columnar, fast | ✅ Fast for all uses |
| **Cost** | ✅ Free | 💰 Server costs | 💰 $5/TB storage + queries | 💰 Optimized costs |
| **Real-time** | ✅ Instant | ✅ Instant | ⚠️ Batch oriented | ✅ SQLite for recent |
| **Analytics** | ❌ Limited | ⚠️ Possible | ✅ Built for it | ✅ BigQuery for analytics |

## Recommended Architecture: Hybrid Approach ✅

### 1. **SQLite/PostgreSQL** (Hot Data)
- Last 30-90 days of search terms
- User-specific saved searches
- Quick lookups for UI
- Report metadata and status

### 2. **BigQuery** (Cold Data + Analytics)
- All historical data
- Cross-marketplace analysis
- Trend analysis over time
- Machine learning datasets

## BigQuery Schema Design

```sql
-- Main search terms table (partitioned by week)
CREATE TABLE `project.dataset.search_terms`
(
  -- Identifiers
  report_id STRING NOT NULL,
  marketplace_id STRING NOT NULL,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  
  -- Search term data
  department_name STRING NOT NULL,
  search_term STRING NOT NULL,
  search_frequency_rank INT64 NOT NULL,
  
  -- Product data
  clicked_asin STRING NOT NULL,
  clicked_item_name STRING NOT NULL,
  click_share_rank INT64 NOT NULL,
  click_share FLOAT64 NOT NULL,
  conversion_share FLOAT64 NOT NULL,
  
  -- Metadata
  ingested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY week_start_date
CLUSTER BY search_term, clicked_asin;

-- Aggregated weekly summary table
CREATE TABLE `project.dataset.search_terms_weekly_summary`
(
  week_start_date DATE NOT NULL,
  search_term STRING NOT NULL,
  search_frequency_rank INT64 NOT NULL,
  total_click_share FLOAT64 NOT NULL,
  total_conversion_share FLOAT64 NOT NULL,
  top_asin_1 STRING,
  top_asin_2 STRING,
  top_asin_3 STRING,
  unique_products INT64 NOT NULL
)
PARTITION BY week_start_date
CLUSTER BY search_term;

-- Trending terms table
CREATE TABLE `project.dataset.trending_search_terms`
(
  search_term STRING NOT NULL,
  current_week_rank INT64,
  previous_week_rank INT64,
  rank_change INT64,
  growth_rate FLOAT64,
  weeks_on_chart INT64,
  first_seen_date DATE,
  last_seen_date DATE
)
CLUSTER BY search_term;
```

## Implementation Plan

### Phase 1: BigQuery Setup
```typescript
// src/lib/bigquery-client.ts
import { BigQuery } from '@google-cloud/bigquery'

export class BigQueryService {
  private client: BigQuery
  
  constructor() {
    this.client = new BigQuery({
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    })
  }

  async loadSearchTermsReport(reportPath: string, reportMetadata: any) {
    const dataset = this.client.dataset('amazon_analytics')
    const table = dataset.table('search_terms')
    
    // Stream JSON data directly to BigQuery
    const [job] = await table.load(reportPath, {
      sourceFormat: 'NEWLINE_DELIMITED_JSON',
      autodetect: false,
      schema: SEARCH_TERMS_SCHEMA,
      writeDisposition: 'WRITE_APPEND'
    })
    
    return job
  }
}
```

### Phase 2: Data Pipeline
```typescript
// src/lib/report-pipeline.ts
export class ReportPipeline {
  async processCompletedReport(report: AmazonReport) {
    // 1. Download report from Amazon
    const localPath = await this.downloadReport(report)
    
    // 2. Transform to newline-delimited JSON
    const transformedPath = await this.transformToNDJSON(localPath)
    
    // 3. Load to BigQuery
    await this.bigquery.loadSearchTermsReport(transformedPath, report)
    
    // 4. Update aggregations
    await this.updateAggregations(report.weekStartDate)
    
    // 5. Cache hot data in SQLite
    await this.cacheRecentData(report)
  }
}
```

### Phase 3: Query API
```typescript
// src/app/api/analytics/search-terms/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const timeRange = searchParams.get('timeRange') || '30d'
  
  if (timeRange === '30d' || timeRange === '7d') {
    // Use SQLite for recent data (fast)
    return getFromSQLite(timeRange)
  } else {
    // Use BigQuery for historical analysis
    return getFromBigQuery(timeRange)
  }
}
```

## Cost Optimization

### BigQuery Costs
- **Storage**: $0.02/GB/month (after 90 days: $0.01/GB)
- **Queries**: $5/TB scanned
- **Streaming**: $0.01/200 MB

### Cost Saving Strategies
1. **Partitioning**: By week_start_date
2. **Clustering**: By search_term, asin
3. **Materialized Views**: For common queries
4. **Query Caching**: 24-hour cache
5. **Smart Aggregations**: Pre-compute summaries

### Estimated Monthly Costs
- Storage (150 GB): ~$3/month
- Queries (1 TB/month): ~$5/month
- **Total**: ~$8-10/month

## Query Examples

### 1. Top Search Terms This Week
```sql
SELECT 
  search_term,
  search_frequency_rank,
  SUM(click_share) as total_click_share,
  COUNT(DISTINCT clicked_asin) as product_count
FROM `project.dataset.search_terms`
WHERE week_start_date = CURRENT_DATE() - INTERVAL 7 DAY
GROUP BY search_term, search_frequency_rank
ORDER BY search_frequency_rank
LIMIT 100
```

### 2. Trending Search Terms
```sql
WITH current_week AS (
  SELECT search_term, search_frequency_rank
  FROM `project.dataset.search_terms_weekly_summary`
  WHERE week_start_date = CURRENT_DATE() - INTERVAL 7 DAY
),
previous_week AS (
  SELECT search_term, search_frequency_rank
  FROM `project.dataset.search_terms_weekly_summary`
  WHERE week_start_date = CURRENT_DATE() - INTERVAL 14 DAY
)
SELECT 
  c.search_term,
  c.search_frequency_rank as current_rank,
  p.search_frequency_rank as previous_rank,
  p.search_frequency_rank - c.search_frequency_rank as rank_improvement
FROM current_week c
LEFT JOIN previous_week p ON c.search_term = p.search_term
WHERE p.search_frequency_rank - c.search_frequency_rank > 100
ORDER BY rank_improvement DESC
LIMIT 50
```

### 3. Product Performance by Search Term
```sql
SELECT 
  clicked_asin,
  clicked_item_name,
  COUNT(DISTINCT search_term) as ranking_keywords,
  AVG(click_share) as avg_click_share,
  SUM(click_share * search_frequency_rank) as weighted_visibility
FROM `project.dataset.search_terms`
WHERE week_start_date >= CURRENT_DATE() - INTERVAL 30 DAY
GROUP BY clicked_asin, clicked_item_name
ORDER BY weighted_visibility DESC
LIMIT 100
```

## Benefits of This Approach

1. **Scalability**: Handle TB of data without performance issues
2. **Cost Effective**: Only ~$10/month for massive analytics
3. **Fast UI**: Recent data in SQLite for instant responses
4. **Advanced Analytics**: ML capabilities, SQL analytics
5. **Real-time + Historical**: Best of both worlds
6. **No Infrastructure**: Fully managed by Google

## Next Steps

1. Set up Google Cloud Project
2. Create BigQuery dataset
3. Implement data pipeline
4. Build query API
5. Create analytics dashboard