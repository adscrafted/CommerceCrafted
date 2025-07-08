#!/usr/bin/env python3
"""
Upload the checkpoint data with very small batch sizes to handle BigQuery limits
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

try:
    from google.cloud import bigquery
    from google.cloud.exceptions import GoogleCloudError
except ImportError:
    print("Error: google-cloud-bigquery not installed. Please run: pip install google-cloud-bigquery")
    sys.exit(1)

def upload_with_small_batches(checkpoint_file, report_metadata, batch_size=100):
    """Upload checkpoint data with small batch sizes"""
    
    if not os.path.exists(checkpoint_file):
        logger.error(f"Checkpoint file not found: {checkpoint_file}")
        return False
    
    logger.info(f"🔄 Loading checkpoint: {checkpoint_file}")
    
    # Load checkpoint
    with open(checkpoint_file, 'rb') as f:
        checkpoint_data = pickle.load(f)
    
    search_terms_data = checkpoint_data.get('search_terms_data', {})
    logger.info(f"📊 Found {len(search_terms_data):,} search terms to upload")
    
    if not search_terms_data:
        logger.warning("No search terms data found in checkpoint")
        return False
    
    # Initialize BigQuery
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        'google-service-key.json'
    )
    
    client = bigquery.Client(project='commercecrafted')
    dataset = client.dataset('amazon_analytics')
    table = dataset.table('search_terms')
    
    # Convert to records and upload in small batches
    batch_records = []
    total_uploaded = 0
    failed_uploads = 0
    start_time = time.time()
    
    logger.info(f"🚀 Starting upload with batch size {batch_size}...")
    
    for i, (key, data) in enumerate(search_terms_data.items()):
        search_term = key.split('|')[1] if '|' in key else key
        
        # Create BigQuery record
        record = {
            'search_term': search_term,
            'search_frequency_rank': data.get('rank', 0),
            'department': data.get('department', ''),
            'report_id': report_metadata.get('reportId', ''),
            'marketplace_id': report_metadata.get('marketplaceId', 'ATVPDKIKX0DER'),
            'week_start_date': report_metadata.get('weekStartDate', ''),
            'week_end_date': report_metadata.get('weekEndDate', ''),
            'ingested_at': datetime.now().isoformat()
        }
        
        # Add product data
        products = data.get('products', [])
        for j in range(3):
            if j < len(products):
                product = products[j]
                record[f'clicked_asin_{j+1}'] = product.get('asin', '')
                record[f'product_title_{j+1}'] = product.get('title', '')[:500]  # Truncate
                record[f'click_share_{j+1}'] = product.get('clickShare', 0.0)
                record[f'conversion_share_{j+1}'] = product.get('conversionShare', 0.0)
            else:
                record[f'clicked_asin_{j+1}'] = ''
                record[f'product_title_{j+1}'] = ''
                record[f'click_share_{j+1}'] = 0.0
                record[f'conversion_share_{j+1}'] = 0.0
        
        # Calculate totals
        record['total_click_share'] = sum(
            p.get('clickShare', 0) for p in products[:3]
        )
        record['total_conversion_share'] = sum(
            p.get('conversionShare', 0) for p in products[:3]
        )
        
        batch_records.append(record)
        
        # Upload when batch is full
        if len(batch_records) >= batch_size:
            success = upload_batch(client, table, batch_records, total_uploaded)
            if success:
                total_uploaded += len(batch_records)
            else:
                failed_uploads += len(batch_records)
            
            batch_records = []
            
            # Progress update
            if total_uploaded % (batch_size * 100) == 0:
                elapsed = time.time() - start_time
                rate = total_uploaded / elapsed
                eta = (len(search_terms_data) - total_uploaded) / rate if rate > 0 else 0
                logger.info(f"   Progress: {total_uploaded:,}/{len(search_terms_data):,} "
                          f"({total_uploaded/len(search_terms_data)*100:.1f}%) "
                          f"Rate: {rate:.0f} records/sec "
                          f"ETA: {eta/60:.1f} min")
    
    # Upload remaining records
    if batch_records:
        success = upload_batch(client, table, batch_records, total_uploaded)
        if success:
            total_uploaded += len(batch_records)
        else:
            failed_uploads += len(batch_records)
    
    elapsed = time.time() - start_time
    logger.info(f"\n✅ Upload complete!")
    logger.info(f"   Total uploaded: {total_uploaded:,}")
    logger.info(f"   Failed uploads: {failed_uploads:,}")
    logger.info(f"   Time elapsed: {elapsed:.1f} seconds")
    logger.info(f"   Average rate: {total_uploaded/elapsed:.0f} records/sec")
    
    # Clean up checkpoint if successful
    if failed_uploads == 0:
        os.remove(checkpoint_file)
        logger.info("🗑️  Checkpoint file cleaned up")
    
    return failed_uploads == 0

def upload_batch(client, table, records, progress_count):
    """Upload a single batch with error handling"""
    try:
        errors = client.insert_rows_json(
            table, 
            records,
            ignore_unknown_values=True,
            skip_invalid_rows=False
        )
        
        if errors:
            logger.error(f"❌ Batch upload errors at {progress_count}: {errors[:2]}")
            return False
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Batch upload failed at {progress_count}: {str(e)[:100]}")
        return False

def main():
    checkpoint_file = "/Users/anthony/Documents/Projects/CommerceCrafted/tmp/report-1520976020277.json.checkpoint"
    
    report_metadata = {
        'reportId': '1520976020277',
        'marketplaceId': 'ATVPDKIKX0DER',
        'weekStartDate': '2025-04-06',
        'weekEndDate': '2025-04-12'
    }
    
    # Start with very small batches to avoid 413 errors
    success = upload_with_small_batches(checkpoint_file, report_metadata, batch_size=50)
    
    if success:
        # Verify the upload
        try:
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