#!/usr/bin/env python3
"""
Resume processing from checkpoint file
"""

import os
import sys
import pickle
import time
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

def resume_processing(checkpoint_file, report_metadata):
    """Resume processing from a checkpoint file"""
    
    if not os.path.exists(checkpoint_file):
        logger.error(f"Checkpoint file not found: {checkpoint_file}")
        return False
    
    logger.info(f"🔄 Resuming from checkpoint: {checkpoint_file}")
    
    # Load checkpoint
    with open(checkpoint_file, 'rb') as f:
        checkpoint_data = pickle.load(f)
    
    search_terms_data = checkpoint_data.get('search_terms_data', {})
    logger.info(f"📊 Found {len(search_terms_data):,} search terms to process")
    
    if not search_terms_data:
        logger.warning("No search terms data found in checkpoint")
        return False
    
    # Create processor
    processor = OptimizedReportProcessor()
    
    # Manually set the search terms data
    processor.search_terms_data = search_terms_data
    
    # Process and upload
    logger.info("🚀 Starting upload to BigQuery...")
    processor._flush_search_terms(report_metadata)
    
    # Final batch upload if any remaining
    if processor.batch_records:
        processor._upload_batch()
    
    # Clean up checkpoint
    os.remove(checkpoint_file)
    logger.info("✅ Checkpoint cleanup complete")
    
    logger.info(f"🎉 Processing complete! {processor.processed_count:,} records uploaded")
    
    return True

def main():
    checkpoint_file = "/Users/anthony/Documents/Projects/CommerceCrafted/tmp/report-1520976020277.json.checkpoint"
    
    report_metadata = {
        'reportId': '1520976020277',
        'marketplaceId': 'ATVPDKIKX0DER',
        'weekStartDate': '2025-04-06',
        'weekEndDate': '2025-04-12'
    }
    
    success = resume_processing(checkpoint_file, report_metadata)
    
    if success:
        # Verify the upload
        try:
            from google.cloud import bigquery
            os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = os.path.join(
                os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                'google-service-key.json'
            )
            
            client = bigquery.Client(project='commercecrafted')
            query = f"""
            SELECT COUNT(*) as count 
            FROM `commercecrafted.amazon_analytics.search_terms`
            WHERE report_id = '{report_metadata['reportId']}'
            """
            
            result = list(client.query(query).result())[0]
            logger.info(f"✅ Verification: {result.count:,} records in BigQuery for report {report_metadata['reportId']}")
            
        except Exception as e:
            logger.error(f"Verification failed: {e}")
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()