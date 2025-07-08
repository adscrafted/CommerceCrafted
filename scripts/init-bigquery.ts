#!/usr/bin/env node

/**
 * BigQuery Initialization Script
 * 
 * This script sets up the BigQuery dataset and tables for Amazon search terms data.
 * Run with: npm run bigquery:init
 */

import { getBigQueryService } from '../src/lib/bigquery-service'
import { config } from 'dotenv'
import { existsSync } from 'fs'
import path from 'path'

// Load environment variables
config({ path: '.env.local' })

async function main() {
  console.log('🚀 BigQuery Initialization Script')
  console.log('=================================\n')

  // Check environment variables
  const requiredEnvVars = [
    'GOOGLE_CLOUD_PROJECT',
    'GOOGLE_APPLICATION_CREDENTIALS'
  ]

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:')
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`)
    })
    console.error('\nPlease set these in your .env file')
    process.exit(1)
  }

  // Check if credentials file exists
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS!
  if (!existsSync(credentialsPath)) {
    console.error(`❌ Credentials file not found: ${credentialsPath}`)
    console.error('Please download your service account key and update the path')
    process.exit(1)
  }

  console.log('✅ Environment variables configured')
  console.log(`   Project ID: ${process.env.GOOGLE_CLOUD_PROJECT}`)
  console.log(`   Dataset: ${process.env.BIGQUERY_DATASET || 'amazon_analytics'}`)
  console.log(`   Credentials: ${path.basename(credentialsPath)}\n`)

  try {
    console.log('📊 Initializing BigQuery service...')
    const bigQueryService = getBigQueryService()
    
    console.log('🏗️  Creating dataset and tables...')
    await bigQueryService.initialize()
    
    console.log('\n✅ BigQuery setup complete!')
    console.log('\nCreated resources:')
    console.log('   - Dataset: amazon_analytics')
    console.log('   - Table: search_terms (partitioned by week, clustered by marketplace)')
    console.log('   - Marketplace column: tracks which Amazon marketplace (US, UK, etc.)')
    
    console.log('\n📝 Next steps:')
    console.log('   1. Run "npm run bigquery:test" to verify the setup')
    console.log('   2. Process your Amazon report with the data pipeline')
    console.log('   3. Query data using the API endpoints')
    
  } catch (error) {
    console.error('\n❌ Initialization failed:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Could not load the default credentials')) {
        console.error('\n💡 Authentication issue detected. Please ensure:')
        console.error('   1. Your service account key file is valid')
        console.error('   2. The GOOGLE_APPLICATION_CREDENTIALS path is correct')
        console.error('   3. The service account has BigQuery permissions')
      } else if (error.message.includes('Permission denied')) {
        console.error('\n💡 Permission issue detected. Please ensure:')
        console.error('   1. Your service account has BigQuery Data Editor role')
        console.error('   2. Your service account has BigQuery Job User role')
        console.error('   3. The project ID is correct')
      }
    }
    
    process.exit(1)
  }
}

// Run the script
main().catch(console.error)