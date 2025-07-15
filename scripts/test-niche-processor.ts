#!/usr/bin/env node

// Test script for niche processor
// Run with: npx tsx scripts/test-niche-processor.ts

async function testNicheProcessor() {
  const baseUrl = 'http://localhost:3001'
  
  console.log('Testing Niche Processor...\n')

  // Test 1: Check if niches table exists
  console.log('1. Checking niches table...')
  try {
    const response = await fetch(`${baseUrl}/api/setup/niches-table`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    const data = await response.json()
    console.log('Response:', data)
    
    if (!data.success && data.instructions) {
      console.log('\n⚠️  Niches table needs to be created.')
      console.log('Please run the SQL from scripts/create-niches-table.sql in your Supabase SQL editor\n')
    }
  } catch (error) {
    console.error('Error checking niches table:', error)
  }

  // Test 2: Create a test niche
  console.log('\n2. Creating test niche...')
  const testNiche = {
    nicheId: `test_niche_${Date.now()}`,
    nicheName: 'Smart Sleep Products Test',
    asins: ['B08MVBRNKV', 'B07ZPKBL9V', 'B08N5WRWNW'],
    marketplace: 'US'
  }

  try {
    const response = await fetch(`${baseUrl}/api/niches/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testNiche)
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('Niche created successfully:', data)
      
      // Test 3: Check niche status
      console.log('\n3. Checking niche status...')
      const statusResponse = await fetch(`${baseUrl}/api/niches/process?nicheId=${testNiche.nicheId}`)
      const statusData = await statusResponse.json()
      console.log('Niche status:', statusData)
      
    } else {
      const error = await response.json()
      console.error('Failed to create niche:', error)
    }
  } catch (error) {
    console.error('Error creating niche:', error)
  }

  console.log('\n✅ Niche processor test complete!')
  console.log('\nNext steps:')
  console.log('1. Navigate to http://localhost:3001/admin?tab=niches')
  console.log('2. Create and manage niches through the UI')
  console.log('3. Monitor processing progress in real-time')
}

// Run the test
testNicheProcessor().catch(console.error)