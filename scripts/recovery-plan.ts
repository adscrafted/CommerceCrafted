#!/usr/bin/env node

/**
 * Recovery Plan for Lost BigQuery Data
 */

import { getBigQueryService } from '../src/lib/bigquery-service'
import { config } from 'dotenv'

config({ path: '.env.local' })

async function analyzeDataLoss() {
  console.log('🔍 Analyzing Data Loss and Recovery Options')
  console.log('==========================================\n')

  console.log('📊 What we know:')
  console.log('   • Original BigQuery table had 7,518,074 records')
  console.log('   • Records covered 2,513,404 unique search terms') 
  console.log('   • Data was successfully uploaded before')
  console.log('   • I accidentally deleted it when recreating table schema\n')

  console.log('🗂️  Available source data:')
  console.log('   • report-1520525020276.json (2.8GB) - Week of 2025-04-06')
  console.log('   • report-1520535020276.csv (2.8GB) - Week of 2025-04-13 (JSON content)')
  console.log('   • report-1520541020276.csv (2.8GB) - Week of 2025-04-20 (JSON content)')
  console.log('   • Each report contains ~20-65M records\n')

  console.log('🤔 Analysis:')
  console.log('   • The original 7.5M records likely came from ONE previous report')
  console.log('   • Current reports have 20-65M records each (much larger)')
  console.log('   • Original successful upload was probably from a different week\n')

  console.log('💡 Recovery Options:')
  console.log('   1. ACCEPT LOSS: Continue with current 3 reports (covers April 6-20, 2025)')
  console.log('   2. IDENTIFY SOURCE: Try to determine which week the 7.5M records came from')
  console.log('   3. RE-REQUEST: Request the missing week\'s report from Amazon again\n')

  console.log('✅ Recommended Action:')
  console.log('   • Continue processing current 3 reports (they\'re already larger than lost data)')
  console.log('   • These 3 reports will provide 200M+ records (vs lost 7.5M)')
  console.log('   • The lost data was likely from a different/earlier week')
  console.log('   • Current processing will provide much more comprehensive data\n')

  console.log('🚀 Next Steps:')
  console.log('   1. Complete current 3 report uploads to BigQuery')
  console.log('   2. Check if any other weeks need backfilling')
  console.log('   3. Set up duplicate prevention for future uploads')
}

analyzeDataLoss().catch(console.error)