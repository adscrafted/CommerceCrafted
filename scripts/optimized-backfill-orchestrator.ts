#!/usr/bin/env node
/**
 * Optimized backfill orchestrator for processing large Amazon reports
 */

import { config } from 'dotenv';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { processReportOptimized } from './process-report-optimized';
import { AmazonSearchTermsService } from '../src/lib/amazon-search-terms-service';
import { getBigQueryService } from '../src/lib/bigquery-service';

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
  failedReports?: Array<{
    reportId: string;
    weekStartDate: string;
    failedAt: string;
    error: string;
    attempts: number;
  }>;
  lastCheck: string;
}

class OptimizedBackfillOrchestrator {
  private stateFile = '.backfill-state.json';
  private state: BackfillState;
  private reportService: AmazonSearchTermsService;
  private bigQueryService: any;
  
  constructor() {
    this.reportService = new AmazonSearchTermsService();
    this.bigQueryService = getBigQueryService();
    this.loadState();
  }
  
  private loadState() {
    if (existsSync(this.stateFile)) {
      this.state = JSON.parse(readFileSync(this.stateFile, 'utf-8'));
    } else {
      this.state = {
        pendingReports: [],
        completedReports: [],
        failedReports: [],
        lastCheck: new Date().toISOString()
      };
    }
  }
  
  private saveState() {
    writeFileSync(this.stateFile, JSON.stringify(this.state, null, 2));
  }
  
  async run() {
    console.log('🚀 Optimized Backfill Orchestrator');
    console.log('=================================\n');
    
    console.log(`📊 Current Status:`);
    console.log(`   Pending: ${this.state.pendingReports.length}`);
    console.log(`   Completed: ${this.state.completedReports.length}`);
    console.log(`   Failed: ${this.state.failedReports?.length || 0}\n`);
    
    // Process pending reports
    for (const report of [...this.state.pendingReports]) {
      try {
        console.log(`\n📋 Processing report ${report.reportId}...`);
        
        // Check report status
        const status = await this.reportService.getReportStatus(report.reportId);
        
        if (status.processingStatus === 'DONE') {
          console.log('✅ Report is ready for download');
          
          // Download report
          console.log('⬇️  Downloading report...');
          const data = await this.reportService.downloadReport(status.reportDocumentId!);
          
          // Save to file
          const localPath = `/tmp/report-${report.reportId}.json`;
          require('fs').writeFileSync(localPath, data);
          
          console.log(`📁 Downloaded to: ${localPath}`);
          
          // Process with optimized processor
          console.log('\n🔧 Processing with optimized processor...');
          const success = await processReportOptimized({
            reportId: report.reportId,
            weekStartDate: report.weekStartDate,
            jsonPath: localPath
          });
          
          if (success) {
            // Get record count from BigQuery
            const [rows] = await this.bigQueryService.client.query({
              query: `
                SELECT COUNT(*) as count 
                FROM \`commercecrafted.amazon_analytics.search_terms\`
                WHERE report_id = '${report.reportId}'
              `
            });
            const recordCount = parseInt(rows[0].count) || 0;
            
            // Mark as completed
            this.state.pendingReports = this.state.pendingReports.filter(
              r => r.reportId !== report.reportId
            );
            this.state.completedReports.push({
              reportId: report.reportId,
              weekStartDate: report.weekStartDate,
              completedAt: new Date().toISOString(),
              recordsProcessed: recordCount
            });
            
            console.log(`✅ Report completed with ${recordCount.toLocaleString()} records`);
          } else {
            // Mark as failed
            report.attempts++;
            
            if (report.attempts >= 3) {
              // Move to failed after 3 attempts
              this.state.pendingReports = this.state.pendingReports.filter(
                r => r.reportId !== report.reportId
              );
              
              if (!this.state.failedReports) this.state.failedReports = [];
              this.state.failedReports.push({
                reportId: report.reportId,
                weekStartDate: report.weekStartDate,
                failedAt: new Date().toISOString(),
                error: 'Processing failed after 3 attempts',
                attempts: report.attempts
              });
              
              console.error(`❌ Report failed after ${report.attempts} attempts`);
            }
          }
          
        } else if (status.processingStatus === 'FAILED' || 
                   status.processingStatus === 'CANCELLED') {
          // Move to failed
          this.state.pendingReports = this.state.pendingReports.filter(
            r => r.reportId !== report.reportId
          );
          
          if (!this.state.failedReports) this.state.failedReports = [];
          this.state.failedReports.push({
            reportId: report.reportId,
            weekStartDate: report.weekStartDate,
            failedAt: new Date().toISOString(),
            error: `Report status: ${status.processingStatus}`,
            attempts: report.attempts
          });
          
          console.error(`❌ Report failed with status: ${status.processingStatus}`);
          
        } else {
          console.log(`⏳ Report still processing: ${status.processingStatus}`);
        }
        
        // Save state after each report
        this.saveState();
        
      } catch (error) {
        console.error(`❌ Error processing report ${report.reportId}:`, error);
        
        report.attempts++;
        if (report.attempts >= 3) {
          // Move to failed
          this.state.pendingReports = this.state.pendingReports.filter(
            r => r.reportId !== report.reportId
          );
          
          if (!this.state.failedReports) this.state.failedReports = [];
          this.state.failedReports.push({
            reportId: report.reportId,
            weekStartDate: report.weekStartDate,
            failedAt: new Date().toISOString(),
            error: String(error),
            attempts: report.attempts
          });
        }
        
        this.saveState();
      }
    }
    
    // Update last check
    this.state.lastCheck = new Date().toISOString();
    this.saveState();
    
    console.log('\n📊 Final Status:');
    console.log(`   Pending: ${this.state.pendingReports.length}`);
    console.log(`   Completed: ${this.state.completedReports.length}`);
    console.log(`   Failed: ${this.state.failedReports?.length || 0}`);
    
    if (this.state.completedReports.length > 0) {
      const totalRecords = this.state.completedReports.reduce(
        (sum, r) => sum + r.recordsProcessed, 0
      );
      console.log(`   Total records: ${totalRecords.toLocaleString()}`);
    }
    
    // Show summary in BigQuery
    try {
      const [summary] = await this.bigQueryService.client.query({
        query: `
          SELECT 
            COUNT(DISTINCT report_id) as reports,
            COUNT(*) as total_records,
            COUNT(DISTINCT search_term) as unique_terms,
            MIN(week_start_date) as earliest_week,
            MAX(week_start_date) as latest_week
          FROM \`commercecrafted.amazon_analytics.search_terms\`
        `
      });
      
      console.log('\n📊 BigQuery Summary:');
      console.log(`   Reports: ${summary[0].reports}`);
      console.log(`   Total records: ${parseInt(summary[0].total_records).toLocaleString()}`);
      console.log(`   Unique search terms: ${parseInt(summary[0].unique_terms).toLocaleString()}`);
      console.log(`   Date range: ${summary[0].earliest_week} to ${summary[0].latest_week}`);
    } catch (error) {
      // Ignore errors in summary
    }
  }
}

// Main
async function main() {
  try {
    const orchestrator = new OptimizedBackfillOrchestrator();
    await orchestrator.run();
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}