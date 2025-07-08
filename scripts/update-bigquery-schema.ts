#!/usr/bin/env node

/**
 * Update BigQuery table schema to include department field
 */

import { BigQuery } from '@google-cloud/bigquery'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

async function updateBigQuerySchema() {
  console.log('🔧 Updating BigQuery Schema')
  console.log('==========================\n')

  const client = new BigQuery({
    projectId: process.env.GOOGLE_CLOUD_PROJECT,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
  })

  const dataset = client.dataset('amazon_analytics')
  const table = dataset.table('search_terms')

  try {
    // Get current schema
    console.log('📋 Getting current schema...')
    const [metadata] = await table.getMetadata()
    console.log(`   Current fields: ${metadata.schema.fields.length}`)

    // Add department field to schema
    const newFields = [
      {
        name: 'department',
        type: 'STRING',
        mode: 'NULLABLE'
      }
    ]

    // Update the schema
    console.log('🔄 Adding department field...')
    await table.setMetadata({
      schema: {
        fields: [...metadata.schema.fields, ...newFields]
      }
    })

    console.log('✅ Schema updated successfully!')
    
    // Verify the update
    const [newMetadata] = await table.getMetadata()
    console.log(`   New field count: ${newMetadata.schema.fields.length}`)
    
    const departmentField = newMetadata.schema.fields.find(f => f.name === 'department')
    if (departmentField) {
      console.log('   ✅ Department field added successfully')
    } else {
      console.log('   ❌ Department field not found')
    }

  } catch (error) {
    console.error('❌ Error updating schema:', error)
    throw error
  }
}

// Run the script
updateBigQuerySchema().catch(console.error)