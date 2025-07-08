#!/usr/bin/env node
import { config } from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';

config({ path: '.env.local' });

const stateFile = '.backfill-state.json';

// Read current state
const state = JSON.parse(readFileSync(stateFile, 'utf-8'));

const reportIdToComplete = process.argv[2] || '1520976020277';

// Remove the completed report from pending
state.pendingReports = state.pendingReports.filter(r => r.reportId !== reportIdToComplete);

// Add to completed reports
if (!state.completedReports) {
  state.completedReports = [];
}

// Check if already completed
const alreadyCompleted = state.completedReports.find(r => r.reportId === reportIdToComplete);
if (!alreadyCompleted) {
  state.completedReports.push({
    reportId: reportIdToComplete,
    weekStartDate: '2025-04-06',
    completedAt: new Date().toISOString(),
    recordsProcessed: 3 // Updated based on actual test
  });
}

// Update last check
state.lastCheck = new Date().toISOString();

// Write updated state
writeFileSync(stateFile, JSON.stringify(state, null, 2));

console.log('✅ Updated backfill state');
console.log(`Pending reports: ${state.pendingReports.length}`);
console.log(`Completed reports: ${state.completedReports.length}`);