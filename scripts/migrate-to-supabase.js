#!/usr/bin/env node

/**
 * Migration script to transfer data from SQLite to Supabase PostgreSQL
 * 
 * This script:
 * 1. Connects to both SQLite and PostgreSQL databases
 * 2. Exports data from SQLite
 * 3. Imports data to PostgreSQL
 * 4. Handles data transformation for PostgreSQL compatibility
 */

const { PrismaClient } = require('../src/generated/prisma')
const fs = require('fs')
const path = require('path')

// SQLite client (current)
const sqliteClient = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
})

// PostgreSQL client (new)
const postgresClient = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function exportDataFromSQLite() {
  console.log('📦 Exporting data from SQLite...')
  
  try {
    // Check if SQLite database exists
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
    if (!fs.existsSync(dbPath)) {
      console.log('ℹ️  No SQLite database found - starting fresh')
      return null
    }

    // Export all data
    const data = {
      users: await sqliteClient.user.findMany(),
      products: await sqliteClient.product.findMany(),
      productAnalyses: await sqliteClient.productAnalysis.findMany(),
      keywords: await sqliteClient.keyword.findMany(),
      productKeywords: await sqliteClient.productKeyword.findMany(),
      dailyFeatures: await sqliteClient.dailyFeature.findMany(),
      savedProducts: await sqliteClient.savedProduct.findMany(),
      // Add other models as needed
    }

    console.log('✅ Data exported successfully:')
    console.log(`   Users: ${data.users.length}`)
    console.log(`   Products: ${data.products.length}`)
    console.log(`   Analyses: ${data.productAnalyses.length}`)
    
    return data
  } catch (error) {
    console.error('❌ Error exporting from SQLite:', error)
    return null
  }
}

async function importDataToPostgreSQL(data) {
  if (!data) {
    console.log('ℹ️  No data to import - starting with empty database')
    return
  }

  console.log('📥 Importing data to PostgreSQL...')
  
  try {
    // Import users first (they're referenced by other models)
    if (data.users.length > 0) {
      await postgresClient.user.createMany({
        data: data.users,
        skipDuplicates: true
      })
      console.log(`✅ Imported ${data.users.length} users`)
    }

    // Import products
    if (data.products.length > 0) {
      await postgresClient.product.createMany({
        data: data.products,
        skipDuplicates: true
      })
      console.log(`✅ Imported ${data.products.length} products`)
    }

    // Import product analyses
    if (data.productAnalyses.length > 0) {
      await postgresClient.productAnalysis.createMany({
        data: data.productAnalyses,
        skipDuplicates: true
      })
      console.log(`✅ Imported ${data.productAnalyses.length} product analyses`)
    }

    // Import keywords
    if (data.keywords.length > 0) {
      await postgresClient.keyword.createMany({
        data: data.keywords,
        skipDuplicates: true
      })
      console.log(`✅ Imported ${data.keywords.length} keywords`)
    }

    // Import product keywords (many-to-many)
    if (data.productKeywords.length > 0) {
      await postgresClient.productKeyword.createMany({
        data: data.productKeywords,
        skipDuplicates: true
      })
      console.log(`✅ Imported ${data.productKeywords.length} product keywords`)
    }

    // Import daily features
    if (data.dailyFeatures.length > 0) {
      await postgresClient.dailyFeature.createMany({
        data: data.dailyFeatures,
        skipDuplicates: true
      })
      console.log(`✅ Imported ${data.dailyFeatures.length} daily features`)
    }

    // Import saved products
    if (data.savedProducts.length > 0) {
      await postgresClient.savedProduct.createMany({
        data: data.savedProducts,
        skipDuplicates: true
      })
      console.log(`✅ Imported ${data.savedProducts.length} saved products`)
    }

    console.log('🎉 Data migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Error importing to PostgreSQL:', error)
    throw error
  }
}

async function createSampleData() {
  console.log('🌱 Creating sample data...')
  
  try {
    // Check if there's already an admin user
    const adminUser = await postgresClient.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!adminUser) {
      // Create admin user
      const admin = await postgresClient.user.create({
        data: {
          email: 'admin@commercecrafted.com',
          name: 'Admin User',
          role: 'ADMIN',
          subscriptionTier: 'enterprise',
          isActive: true
        }
      })
      console.log('✅ Created admin user:', admin.email)
    }

    // Create sample niche
    const existingNiche = await postgresClient.niche.findFirst()
    if (!existingNiche) {
      const niche = await postgresClient.niche.create({
        data: {
          nicheName: 'Bluetooth Sleep Masks',
          asins: 'B08MVBRNKV,B07SHBQY7Z,B07KC5DWCC',
          scheduledDate: new Date('2025-01-15'),
          totalProducts: 3,
          status: 'completed',
          category: 'Health & Personal Care',
          avgBsr: 2341,
          avgPrice: 29.99,
          avgRating: 4.3,
          totalReviews: 35678,
          totalMonthlyRevenue: 520000,
          opportunityScore: 87,
          competitionLevel: 'Medium',
          processTime: '2h 15min',
          analystAssigned: 'AI Agent',
          nicheKeywords: 'bluetooth sleep mask,sleep headphones,wireless sleep mask',
          marketSize: 15000000,
          createdBy: adminUser?.id || (await postgresClient.user.findFirst({ where: { role: 'ADMIN' } }))?.id
        }
      })
      console.log('✅ Created sample niche:', niche.nicheName)
    }

    console.log('🌱 Sample data created successfully!')
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error)
  }
}

async function main() {
  console.log('🚀 Starting Supabase migration...')
  
  try {
    // Step 1: Export data from SQLite
    const data = await exportDataFromSQLite()
    
    // Step 2: Import data to PostgreSQL
    await importDataToPostgreSQL(data)
    
    // Step 3: Create sample data
    await createSampleData()
    
    console.log('✅ Migration completed successfully!')
    console.log('🔗 You can now access your data in Supabase')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await sqliteClient.$disconnect()
    await postgresClient.$disconnect()
  }
}

// Run migration
if (require.main === module) {
  main()
}