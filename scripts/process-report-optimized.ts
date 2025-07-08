#!/usr/bin/env node
/**
 * Optimized report processor that uses Python for streaming large JSON files
 */

import { config } from 'dotenv';
import { spawn } from 'child_process';
import { existsSync, statSync } from 'fs';
import { join } from 'path';

config({ path: '.env.local' });

interface ReportMetadata {
  reportId: string;
  weekStartDate: string;
  jsonPath: string;
}

async function processReportOptimized(report: ReportMetadata): Promise<boolean> {
  console.log('🚀 Optimized Report Processing');
  console.log('=============================\n');
  
  // Check if Python processor exists
  const pythonScript = join(__dirname, 'optimized-report-processor.py');
  if (!existsSync(pythonScript)) {
    console.error('❌ Error: Python processor not found');
    return false;
  }
  
  // Check if input file exists
  if (!existsSync(report.jsonPath)) {
    console.error(`❌ Error: Input file not found: ${report.jsonPath}`);
    return false;
  }
  
  const fileSize = statSync(report.jsonPath).size;
  console.log(`📊 Report: ${report.reportId}`);
  console.log(`📅 Week: ${report.weekStartDate}`);
  console.log(`📁 File: ${report.jsonPath}`);
  console.log(`📦 Size: ${(fileSize / 1024 / 1024 / 1024).toFixed(2)} GB\n`);
  
  return new Promise((resolve, reject) => {
    // Spawn Python process
    const pythonProcess = spawn('python3', [
      pythonScript,
      report.jsonPath,
      report.reportId,
      report.weekStartDate
    ], {
      stdio: 'pipe',
      env: { ...process.env }
    });
    
    let outputBuffer = '';
    let errorBuffer = '';
    
    // Handle stdout
    pythonProcess.stdout.on('data', (data) => {
      const output = data.toString();
      outputBuffer += output;
      
      // Parse and display progress lines
      const lines = output.split('\n').filter(line => line.trim());
      lines.forEach(line => {
        if (line.includes('Processed') || line.includes('Uploading') || line.includes('complete')) {
          console.log(`   ${line}`);
        }
      });
    });
    
    // Handle stderr
    pythonProcess.stderr.on('data', (data) => {
      const error = data.toString();
      errorBuffer += error;
      
      // Display Python logging output (INFO, WARNING, ERROR)
      const lines = error.split('\n').filter(line => line.trim());
      lines.forEach(line => {
        if (line.includes('INFO') || line.includes('WARNING') || line.includes('ERROR')) {
          console.log(line);
        }
      });
    });
    
    // Handle process exit
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ Processing completed successfully!');
        
        // Extract record count from output
        const countMatch = outputBuffer.match(/Total search terms: ([\d,]+)/);
        if (countMatch) {
          console.log(`📊 Records processed: ${countMatch[1]}`);
        }
        
        resolve(true);
      } else {
        console.error(`\n❌ Processing failed with code ${code}`);
        
        // Check for specific errors
        if (errorBuffer.includes('ijson not installed')) {
          console.error('\n📦 Missing Python dependencies. Please install:');
          console.error('   pip3 install -r scripts/requirements-python.txt');
        } else if (errorBuffer.includes('google-cloud-bigquery not installed')) {
          console.error('\n📦 Missing BigQuery library. Please install:');
          console.error('   pip3 install google-cloud-bigquery');
        }
        
        if (errorBuffer) {
          console.error('\nError details:', errorBuffer);
        }
        
        resolve(false);
      }
    });
    
    // Handle process errors
    pythonProcess.on('error', (error) => {
      console.error('❌ Failed to start Python process:', error);
      
      if (error.message.includes('python3')) {
        console.error('\n🐍 Python 3 not found. Please install Python 3.7 or later.');
      }
      
      resolve(false);
    });
  });
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: npm run process-report-optimized <json-file> [report-id] [week-start-date]');
    console.log('   or: npm run process-report-optimized <report-id>');
    process.exit(1);
  }
  
  let report: ReportMetadata;
  
  if (args[0].endsWith('.json')) {
    // Direct file path provided
    report = {
      jsonPath: args[0],
      reportId: args[1] || args[0].split('/').pop()!.split('.')[0],
      weekStartDate: args[2] || '2025-04-06'
    };
  } else {
    // Report ID provided, construct path
    const reportId = args[0];
    report = {
      reportId,
      jsonPath: join(process.cwd(), 'tmp', `report-${reportId}.json`),
      weekStartDate: args[1] || '2025-04-06'
    };
  }
  
  try {
    const success = await processReportOptimized(report);
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Export for use in other scripts
export { processReportOptimized };

// Run if called directly
if (require.main === module) {
  main();
}