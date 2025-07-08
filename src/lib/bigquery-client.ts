import { BigQuery } from '@google-cloud/bigquery';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

let bigqueryClient: BigQuery | null = null;

export function getBigQueryClient(): BigQuery {
  if (bigqueryClient) {
    return bigqueryClient;
  }

  // In production (Vercel), use JSON from environment variable
  if (process.env.NODE_ENV === 'production' && process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    try {
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
    } catch (error) {
      console.error('Error setting up BigQuery credentials:', error);
      // Fallback to default initialization
      bigqueryClient = new BigQuery({
        projectId: process.env.BIGQUERY_PROJECT_ID || 'commercecrafted'
      });
    }
  } else {
    // Development environment - use local file
    bigqueryClient = new BigQuery({
      projectId: process.env.BIGQUERY_PROJECT_ID || 'commercecrafted',
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || 'google-service-key.json'
    });
  }

  return bigqueryClient;
}