#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testFrontendData() {
  const nicheId = 'timeless_1753731633499';
  
  console.log('=== FRONTEND DATA TEST ===\n');
  
  // Test each API endpoint that the frontend would call
  const endpoints = [
    {
      name: 'Overview',
      url: `/api/niches/${nicheId}/overview`,
      tab: 'overview'
    },
    {
      name: 'Competition',
      url: `/api/niches/${nicheId}/competition`,
      tab: 'competition'
    },
    {
      name: 'Demand',
      url: `/api/niches/${nicheId}/demand-analysis`,
      tab: 'demand'
    },
    {
      name: 'Financial',
      url: `/api/niches/${nicheId}/financial`,
      tab: 'financial'
    },
    {
      name: 'Keywords', 
      url: `/api/niches/${nicheId}/keywords`,
      tab: 'keywords'
    },
    {
      name: 'Launch',
      url: `/api/niches/${nicheId}/launch`,
      tab: 'launch'
    },
    {
      name: 'Listing',
      url: `/api/niches/${nicheId}/listing`,
      tab: 'listing'
    },
    {
      name: 'Data',
      url: `/api/niches/${nicheId}/data`,
      tab: 'data'
    }
  ];
  
  const baseUrl = 'http://localhost:3005';
  
  for (const endpoint of endpoints) {
    console.log(`Testing ${endpoint.name} endpoint...`);
    try {
      const response = await fetch(`${baseUrl}${endpoint.url}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint.name}: ${JSON.stringify(data).length} chars of data`);
        
        // Show key data points
        if (data.success && data.data) {
          const keys = Object.keys(data.data).slice(0, 3);
          console.log(`   Key data: ${keys.join(', ')}`);
        }
      } else {
        console.log(`❌ ${endpoint.name}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: Error - ${error.message}`);
    }
    console.log('');
  }
  
  console.log('Frontend URLs to test:');
  endpoints.forEach(endpoint => {
    console.log(`${endpoint.name}: ${baseUrl}/niches/timeless/${endpoint.tab}`);
  });
  
  console.log(`\nMain page: ${baseUrl}/niches/timeless`);
}

testFrontendData().catch(console.error);