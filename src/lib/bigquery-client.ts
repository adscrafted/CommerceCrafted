import { BigQuery } from '@google-cloud/bigquery';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

let bigqueryClient: BigQuery | null = null;

export function getBigQueryClient(): BigQuery {
  if (bigqueryClient) {
    return bigqueryClient;
  }

  // Check if BigQuery is configured
  const hasCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || 
                        process.env.GOOGLE_APPLICATION_CREDENTIALS ||
                        existsSync('google-service-key.json');
  
  if (!hasCredentials) {
    console.warn('BigQuery credentials not configured - using mock client');
    throw new Error('BigQuery not configured - missing credentials');
  }

  try {
    // In production (Vercel), use JSON from environment variable
    if (process.env.NODE_ENV === 'production' && process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      // Create temp directory if it doesn't exist
      const tmpDir = '/tmp';
      if (!existsSync(tmpDir)) {
        mkdirSync(tmpDir, { recursive: true });
      }

      // Write credentials to temp file
      const credentialsPath = join(tmpDir, 'google-credentials.json');
      writeFileSync(
        credentialsPath,
        process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
        'utf-8'
      );

      // Set the environment variable to point to the file
      process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;

      bigqueryClient = new BigQuery({
        projectId: process.env.BIGQUERY_PROJECT_ID || 'commercecrafted',
        keyFilename: credentialsPath
      });
    } else {
      // Development environment - use local file
      const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS || 'google-service-key.json';
      if (existsSync(keyFile)) {
        bigqueryClient = new BigQuery({
          projectId: process.env.BIGQUERY_PROJECT_ID || 'commercecrafted',
          keyFilename: keyFile
        });
      } else {
        throw new Error(`BigQuery key file not found: ${keyFile}`);
      }
    }
  } catch (error) {
    console.error('Error initializing BigQuery client:', error);
    throw new Error(`Failed to initialize BigQuery: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return bigqueryClient;
}