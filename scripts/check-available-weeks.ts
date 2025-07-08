#!/usr/bin/env node
/**
 * Check what weeks we can request reports for and request more historical data
 */

import { config } from 'dotenv';
import { AmazonSearchTermsService } from '../src/lib/amazon-search-terms-service';
import { readFileSync, writeFileSync, existsSync } from 'fs';

config({ path: '.env.local' });

interface BackfillState {
  pendingReports: Array<{
    reportId: string;
    weekStartDate: string;
    requestedAt: string;
    status: string;
    attempts: number;
  }>;
  completedReports: Array<{
    reportId: string;
    weekStartDate: string;
    completedAt: string;
    recordsProcessed: number;
  }>;
  lastCheck: string;
}

function getWeekStartDates(weeksBack: number = 12): string[] {
  const dates = [];
  const now = new Date();
  
  for (let i = 1; i <= weeksBack; i++) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (i * 7));
    
    // Get to Sunday (week start)
    const dayOfWeek = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - dayOfWeek);
    
    dates.push(weekStart.toISOString().split('T')[0]);
  }
  
  return dates.reverse(); // Oldest first
}

async function checkAvailableWeeks() {
  console.log('📅 Checking Available Weeks for Backfill');
  console.log('========================================\n');
  
  const reportService = new AmazonSearchTermsService();
  const stateFile = '.backfill-state.json';
  
  // Load current state
  let state: BackfillState;
  if (existsSync(stateFile)) {
    state = JSON.parse(readFileSync(stateFile, 'utf-8'));
  } else {
    state = {
      pendingReports: [],
      completedReports: [],
      lastCheck: new Date().toISOString()
    };
  }
  
  // Get weeks we already have
  const completedWeeks = new Set(
    state.completedReports.map(r => r.weekStartDate)
  );
  const pendingWeeks = new Set(
    state.pendingReports.map(r => r.weekStartDate)
  );
  
  console.log('📊 Current Status:');
  console.log(`   Completed weeks: ${completedWeeks.size}`);
  console.log(`   Pending reports: ${pendingWeeks.size}`);
  console.log(`   Available weeks: ${[...completedWeeks].sort().join(', ')}\n`);
  
  // Get available week dates
  const availableWeeks = getWeekStartDates(16); // Check last 16 weeks
  console.log('🗓️  Checking weeks for data availability:');
  
  let requestCount = 0;
  const maxRequests = 5; // Limit to avoid API throttling
  
  for (const weekStart of availableWeeks) {
    if (completedWeeks.has(weekStart) || pendingWeeks.has(weekStart)) {
      console.log(`   ${weekStart}: ✅ Already processed/pending`);
      continue;
    }
    
    if (requestCount >= maxRequests) {
      console.log(`   ${weekStart}: ⏸️  Skipping (rate limit - max ${maxRequests} per run)`);
      continue;
    }
    
    console.log(`   ${weekStart}: 🔄 Requesting report...`);
    
    try {
      const weekStartDate = new Date(weekStart);
      const weekEndDate = new Date(weekStart);
      weekEndDate.setDate(weekStartDate.getDate() + 6);
      
      const result = await reportService.requestTopSearchTermsReport({
        startDate: weekStartDate,
        endDate: weekEndDate
      });
      
      console.log(`   ${weekStart}: ✅ Report requested - ID: ${result.reportId}`);
      
      // Add to pending
      state.pendingReports.push({
        reportId: result.reportId,
        weekStartDate: weekStart,
        requestedAt: new Date().toISOString(),
        status: 'pending',
        attempts: 0
      });
      
      requestCount++;
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`   ${weekStart}: ❌ Request failed - ${error.message}`);
      
      // Check if it's a rate limit or if data doesn't exist for this week
      if (error.message.includes('rate') || error.message.includes('throttle')) {
        console.log(`   Stopping due to rate limits. Resume later.`);
        break;
      }
    }
  }
  
  // Update state
  state.lastCheck = new Date().toISOString();
  writeFileSync(stateFile, JSON.stringify(state, null, 2));
  
  console.log(`\n📈 Summary:`);
  console.log(`   New reports requested: ${requestCount}`);
  console.log(`   Total pending: ${state.pendingReports.length}`);
  console.log(`   Total completed: ${state.completedReports.length}`);
  
  if (requestCount > 0) {
    console.log(`\n⏰ Reports are typically ready in 15-30 minutes.`);
    console.log(`   Run: npm run backfill-optimized`);
    console.log(`   Or check status: npm run check-report <report-id>`);
  }
}

// Main
async function main() {
  try {
    await checkAvailableWeeks();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}