#!/usr/bin/env node
/**
 * Direct download and process large Amazon reports
 */

import { config } from 'dotenv';
import { spawn } from 'child_process';
import { AmazonSearchTermsService } from '../src/lib/amazon-search-terms-service';
import { existsSync, writeFileSync, createWriteStream } from 'fs';
import { join } from 'path';
import axios from 'axios';
import { createGunzip } from 'zlib';

config({ path: '.env.local' });

async function downloadAndProcessReport(reportId: string) {
  console.log('📥 Download and Process Report');
  console.log('=============================\n');
  
  const reportService = new AmazonSearchTermsService();
  
  try {
    // Check report status
    console.log(`📋 Checking status for report ${reportId}...`);
    const status = await reportService.getReportStatus(reportId);
    
    if (status.processingStatus !== 'DONE') {
      console.log(`⏳ Report not ready: ${status.processingStatus}`);
      return false;
    }
    
    console.log('✅ Report is ready for download');
    console.log(`   Document ID: ${status.reportDocumentId}`);
    
    // Get download URL
    console.log('\n🔗 Getting download URL...');
    const client = (reportService as any).client;
    
    const docResponse = await client.callAPI({
      operation: 'getReportDocument',
      endpoint: 'reports',
      path: {
        reportDocumentId: status.reportDocumentId
      }
    });
    
    console.log('📄 Document details:', {
      url: docResponse.url.substring(0, 50) + '...',
      compressionAlgorithm: docResponse.compressionAlgorithm
    });
    
    // Stream download to file
    const outputPath = join(process.cwd(), 'tmp', `report-${reportId}.json`);
    console.log(`\n⬇️  Streaming download to: ${outputPath}`);
    
    const response = await axios({
      method: 'GET',
      url: docResponse.url,
      responseType: 'stream'
    });
    
    let totalBytes = 0;
    const startTime = Date.now();
    
    const writeStream = createWriteStream(outputPath);
    
    // Handle compression
    if (docResponse.compressionAlgorithm === 'GZIP') {
      const gunzip = createGunzip();
      response.data.pipe(gunzip).pipe(writeStream);
      
      gunzip.on('data', (chunk) => {
        totalBytes += chunk.length;
        if (totalBytes % (10 * 1024 * 1024) === 0) { // Every 10MB
          const elapsed = (Date.now() - startTime) / 1000;
          const rate = totalBytes / elapsed / 1024 / 1024;
          console.log(`   Downloaded ${(totalBytes / 1024 / 1024).toFixed(1)} MB (${rate.toFixed(1)} MB/s)`);
        }
      });
    } else {
      response.data.pipe(writeStream);
      
      response.data.on('data', (chunk: Buffer) => {
        totalBytes += chunk.length;
        if (totalBytes % (10 * 1024 * 1024) === 0) { // Every 10MB
          const elapsed = (Date.now() - startTime) / 1000;
          const rate = totalBytes / elapsed / 1024 / 1024;
          console.log(`   Downloaded ${(totalBytes / 1024 / 1024).toFixed(1)} MB (${rate.toFixed(1)} MB/s)`);
        }
      });
    }
    
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
    
    const elapsed = (Date.now() - startTime) / 1000;
    console.log(`\n✅ Download complete!`);
    console.log(`   Size: ${(totalBytes / 1024 / 1024).toFixed(1)} MB`);
    console.log(`   Time: ${elapsed.toFixed(1)} seconds`);
    console.log(`   Rate: ${(totalBytes / elapsed / 1024 / 1024).toFixed(1)} MB/s`);
    
    // Process with Python
    console.log('\n🔧 Processing with optimized Python processor...');
    
    return new Promise<boolean>((resolve, reject) => {
      const pythonScript = join(__dirname, 'optimized-report-processor.py');
      
      const pythonProcess = spawn('python3', [
        pythonScript,
        outputPath,
        reportId,
        '2025-04-06'
      ], {
        stdio: 'pipe',
        env: { 
          ...process.env,
          VIRTUAL_ENV: join(__dirname, '.venv'),
          PATH: `${join(__dirname, '.venv', 'bin')}:${process.env.PATH}`
        }
      });
      
      let outputBuffer = '';
      
      pythonProcess.stdout.on('data', (data) => {
        const output = data.toString();
        outputBuffer += output;
        
        // Parse and display progress lines
        const lines = output.split('\n').filter(line => line.trim());
        lines.forEach(line => {
          if (line.includes('INFO') && (line.includes('Processed') || line.includes('Uploading') || line.includes('complete'))) {
            console.log(`   ${line.split(' - INFO - ')[1] || line}`);
          }
        });
      });
      
      pythonProcess.stderr.on('data', (data) => {
        const error = data.toString();
        const lines = error.split('\n').filter(line => line.trim());
        lines.forEach(line => {
          if (line.includes('INFO') || line.includes('WARNING') || line.includes('ERROR')) {
            console.log(line);
          }
        });
      });
      
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
          resolve(false);
        }
      });
      
      pythonProcess.on('error', (error) => {
        console.error('❌ Failed to start Python process:', error);
        resolve(false);
      });
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

// Main
async function main() {
  const reportId = process.argv[2];
  
  if (!reportId) {
    console.log('Usage: tsx scripts/download-and-process-report.ts <report-id>');
    process.exit(1);
  }
  
  try {
    const success = await downloadAndProcessReport(reportId);
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}