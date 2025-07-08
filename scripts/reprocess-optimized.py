#!/usr/bin/env python3
"""
Reprocess the existing JSON files with optimized settings to get maximum data
"""

import os
import sys
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Add the current directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import from the optimized report processor
import importlib.util
spec = importlib.util.spec_from_file_location(
    "optimized_report_processor", 
    os.path.join(os.path.dirname(__file__), "optimized-report-processor.py")
)
processor_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(processor_module)
OptimizedReportProcessor = processor_module.OptimizedReportProcessor

def reprocess_existing_files():
    """Reprocess existing JSON files with optimized settings"""
    
    files_to_process = [
        {
            'path': '/Users/anthony/Documents/Projects/CommerceCrafted/tmp/report-1520525020276.json',
            'reportId': '1520525020276-v2',  # Add v2 to avoid conflicts
            'weekStartDate': '2025-04-06'
        },
        {
            'path': '/Users/anthony/Documents/Projects/CommerceCrafted/tmp/report-1520976020277.json',
            'reportId': '1520976020277-v2',  # Add v2 to avoid conflicts
            'weekStartDate': '2025-04-06'
        }
    ]
    
    logger.info("🔄 Reprocessing existing files with optimized settings")
    logger.info("=" * 60)
    
    total_processed = 0
    
    for file_info in files_to_process:
        if not os.path.exists(file_info['path']):
            logger.warning(f"File not found: {file_info['path']}")
            continue
        
        logger.info(f"\n📁 Processing: {file_info['path']}")
        logger.info(f"📋 Report ID: {file_info['reportId']}")
        
        # Metadata for the report
        metadata = {
            'reportId': file_info['reportId'],
            'marketplaceId': 'ATVPDKIKX0DER',
            'weekStartDate': file_info['weekStartDate'],
            'weekEndDate': file_info['weekStartDate']  # Will be calculated if needed
        }
        
        # Create processor with smaller batch size for reliability
        processor = OptimizedReportProcessor(
            batch_size=100,  # Much smaller batches
            checkpoint_interval=50000  # More frequent checkpoints
        )
        
        try:
            records_processed = processor.process_file(
                file_info['path'], 
                metadata,
                resume_from_checkpoint=True
            )
            
            total_processed += records_processed
            logger.info(f"✅ Completed: {records_processed:,} records")
            
        except Exception as e:
            logger.error(f"❌ Error processing {file_info['reportId']}: {e}")
            continue
    
    logger.info(f"\n🎉 Reprocessing complete!")
    logger.info(f"   Total records processed: {total_processed:,}")
    
    return total_processed

def verify_results():
    """Verify the results in BigQuery"""
    try:
        from google.cloud import bigquery
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            'google-service-key.json'
        )
        
        client = bigquery.Client(project='commercecrafted')
        
        # Get overall stats
        query = '''
        SELECT 
          COUNT(*) as total_records,
          COUNT(DISTINCT report_id) as unique_reports,
          COUNT(DISTINCT search_term) as unique_search_terms
        FROM `commercecrafted.amazon_analytics.search_terms`
        '''
        result = list(client.query(query).result())[0]
        
        logger.info(f"\n📊 Final BigQuery Status:")
        logger.info(f"   Total Records: {result.total_records:,}")
        logger.info(f"   Unique Reports: {result.unique_reports}")
        logger.info(f"   Unique Search Terms: {result.unique_search_terms:,}")
        
        # Get breakdown by report
        query2 = '''
        SELECT 
          report_id,
          COUNT(*) as records
        FROM `commercecrafted.amazon_analytics.search_terms`
        GROUP BY report_id
        ORDER BY records DESC
        '''
        reports = list(client.query(query2).result())
        
        logger.info(f"\n📋 By Report:")
        for report in reports:
            logger.info(f"   {report.report_id}: {report.records:,} records")
        
        return result.total_records
        
    except Exception as e:
        logger.error(f"Verification failed: {e}")
        return 0

def main():
    """Main entry point"""
    logger.info("🚀 Starting optimized reprocessing of existing files")
    
    try:
        # Reprocess files
        total_processed = reprocess_existing_files()
        
        if total_processed > 0:
            # Verify results
            total_in_db = verify_results()
            
            logger.info(f"\n✅ SUCCESS!")
            logger.info(f"   Processed: {total_processed:,} records")
            logger.info(f"   In BigQuery: {total_in_db:,} records")
            
        else:
            logger.warning("⚠️  No records were processed")
        
        sys.exit(0 if total_processed > 0 else 1)
        
    except Exception as e:
        logger.error(f"❌ Fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()