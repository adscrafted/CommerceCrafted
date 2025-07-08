#!/usr/bin/env python3
"""
Optimized Amazon Report Processor for Large Files (2.5GB+)
Handles streaming JSON parsing and batch uploads to BigQuery
"""

import os
import sys
import json
import gzip
import time
import logging
from datetime import datetime
from collections import defaultdict
from typing import Dict, List, Optional, Generator
import tempfile
import pickle

# Try to import required libraries
try:
    import ijson
except ImportError:
    print("Error: ijson not installed. Please run: pip install ijson")
    sys.exit(1)

try:
    from google.cloud import bigquery
    from google.cloud.exceptions import GoogleCloudError
except ImportError:
    print("Error: google-cloud-bigquery not installed. Please run: pip install google-cloud-bigquery")
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class OptimizedReportProcessor:
    def __init__(self, 
                 project_id: str = 'commercecrafted',
                 dataset_id: str = 'amazon_analytics',
                 table_id: str = 'search_terms',
                 batch_size: int = 10000,
                 checkpoint_interval: int = 100000):
        """
        Initialize the processor with configurable parameters
        
        Args:
            project_id: GCP project ID
            dataset_id: BigQuery dataset ID
            table_id: BigQuery table ID
            batch_size: Number of records to batch before uploading
            checkpoint_interval: Number of records between checkpoint saves
        """
        self.project_id = project_id
        self.dataset_id = dataset_id
        self.table_id = table_id
        self.batch_size = batch_size
        self.checkpoint_interval = checkpoint_interval
        
        # Initialize BigQuery client
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            'google-service-key.json'
        )
        self.bq_client = bigquery.Client(project=project_id)
        self.table_ref = self.bq_client.dataset(dataset_id).table(table_id)
        
        # Processing state
        self.search_terms_data = defaultdict(lambda: {
            'products': [],
            'department': None,
            'rank': None
        })
        self.processed_count = 0
        self.batch_records = []
        self.checkpoint_file = None
        
    def process_file(self, input_file: str, report_metadata: Dict[str, str], 
                    resume_from_checkpoint: bool = True) -> int:
        """
        Process a large JSON file with streaming and checkpointing
        
        Args:
            input_file: Path to the JSON file
            report_metadata: Metadata about the report (reportId, weekStartDate, etc.)
            resume_from_checkpoint: Whether to resume from a previous checkpoint
            
        Returns:
            Number of records processed
        """
        start_time = time.time()
        self.checkpoint_file = f"{input_file}.checkpoint"
        
        # Resume from checkpoint if available
        if resume_from_checkpoint and os.path.exists(self.checkpoint_file):
            logger.info(f"Resuming from checkpoint: {self.checkpoint_file}")
            self._load_checkpoint()
        
        logger.info(f"Processing file: {input_file}")
        logger.info(f"File size: {os.path.getsize(input_file) / (1024**3):.2f} GB")
        
        try:
            # Determine if file is gzipped
            if input_file.endswith('.gz'):
                file_obj = gzip.open(input_file, 'rb')
            else:
                file_obj = open(input_file, 'rb')
            
            with file_obj:
                # Stream parse the JSON
                parser = ijson.parse(file_obj)
                
                current_item = {}
                in_data_array = False
                items_processed = 0
                
                for prefix, event, value in parser:
                    # Check if we're in the data array
                    if prefix == 'dataByDepartmentAndSearchTerm' and event == 'start_array':
                        in_data_array = True
                        logger.info("Found data array, starting processing...")
                    
                    elif in_data_array:
                        # Build item objects
                        if prefix.endswith('.departmentName'):
                            current_item['departmentName'] = value
                        elif prefix.endswith('.searchTerm'):
                            current_item['searchTerm'] = value
                        elif prefix.endswith('.searchFrequencyRank'):
                            current_item['searchFrequencyRank'] = value
                        elif prefix.endswith('.clickedAsin'):
                            current_item['clickedAsin'] = value
                        elif prefix.endswith('.clickedItemName'):
                            current_item['clickedItemName'] = value
                        elif prefix.endswith('.clickShareRank'):
                            current_item['clickShareRank'] = value
                        elif prefix.endswith('.clickShare'):
                            current_item['clickShare'] = float(value) if value else 0.0
                        elif prefix.endswith('.conversionShare'):
                            current_item['conversionShare'] = float(value) if value else 0.0
                        
                        # When we have a complete item
                        if event == 'end_map' and 'searchTerm' in current_item:
                            self._process_item(current_item, report_metadata)
                            items_processed += 1
                            
                            # Progress reporting
                            if items_processed % 10000 == 0:
                                elapsed = time.time() - start_time
                                rate = items_processed / elapsed
                                logger.info(f"Processed {items_processed:,} items "
                                          f"({rate:.0f} items/sec)")
                            
                            # Save checkpoint
                            if items_processed % self.checkpoint_interval == 0:
                                self._save_checkpoint()
                            
                            current_item = {}
                    
                    # End of data array
                    if prefix == 'dataByDepartmentAndSearchTerm' and event == 'end_array':
                        in_data_array = False
                        break
                
                # Process remaining data
                self._flush_search_terms(report_metadata)
                
                # Final batch upload
                if self.batch_records:
                    self._upload_batch()
                
                # Clean up checkpoint
                if os.path.exists(self.checkpoint_file):
                    os.remove(self.checkpoint_file)
                
                elapsed = time.time() - start_time
                logger.info(f"\nProcessing complete!")
                logger.info(f"Total items processed: {items_processed:,}")
                logger.info(f"Total search terms: {self.processed_count:,}")
                logger.info(f"Time elapsed: {elapsed:.1f} seconds")
                logger.info(f"Processing rate: {items_processed/elapsed:.0f} items/sec")
                
                return self.processed_count
                
        except Exception as e:
            logger.error(f"Error processing file: {e}")
            self._save_checkpoint()
            raise
    
    def _process_item(self, item: Dict, metadata: Dict[str, str]):
        """Process a single item and aggregate by search term"""
        key = f"{item.get('departmentName')}|{item.get('searchTerm')}|{item.get('searchFrequencyRank')}"
        
        data = self.search_terms_data[key]
        data['department'] = item.get('departmentName', '')
        data['rank'] = item.get('searchFrequencyRank', 0)
        
        # Add product to list
        data['products'].append({
            'asin': item.get('clickedAsin', ''),
            'title': item.get('clickedItemName', ''),
            'clickShare': item.get('clickShare', 0.0),
            'conversionShare': item.get('conversionShare', 0.0),
            'clickShareRank': item.get('clickShareRank', 999)
        })
        
        # Sort by click share rank
        data['products'].sort(key=lambda x: x['clickShareRank'])
        
        # Keep only top 3 products
        data['products'] = data['products'][:3]
    
    def _flush_search_terms(self, metadata: Dict[str, str]):
        """Convert aggregated search terms to BigQuery records"""
        logger.info(f"Flushing {len(self.search_terms_data)} search terms to BigQuery format...")
        
        for key, data in self.search_terms_data.items():
            search_term = key.split('|')[1]
            
            # Create BigQuery record
            record = {
                'search_term': search_term,
                'search_frequency_rank': data['rank'],
                'department': data['department'],
                'report_id': metadata.get('reportId', ''),
                'marketplace_id': metadata.get('marketplaceId', 'ATVPDKIKX0DER'),
                'week_start_date': metadata.get('weekStartDate', ''),
                'week_end_date': metadata.get('weekEndDate', ''),
                'ingested_at': datetime.utcnow().isoformat()
            }
            
            # Add product data
            for i in range(3):
                if i < len(data['products']):
                    product = data['products'][i]
                    record[f'clicked_asin_{i+1}'] = product['asin']
                    record[f'product_title_{i+1}'] = product['title'][:500]  # Truncate long titles
                    record[f'click_share_{i+1}'] = product['clickShare']
                    record[f'conversion_share_{i+1}'] = product['conversionShare']
                else:
                    record[f'clicked_asin_{i+1}'] = ''
                    record[f'product_title_{i+1}'] = ''
                    record[f'click_share_{i+1}'] = 0.0
                    record[f'conversion_share_{i+1}'] = 0.0
            
            # Calculate totals
            record['total_click_share'] = sum(
                p['clickShare'] for p in data['products'][:3]
            )
            record['total_conversion_share'] = sum(
                p['conversionShare'] for p in data['products'][:3]
            )
            
            self.batch_records.append(record)
            self.processed_count += 1
            
            # Upload batch if needed
            if len(self.batch_records) >= self.batch_size:
                self._upload_batch()
        
        # Clear search terms data
        self.search_terms_data.clear()
    
    def _upload_batch(self):
        """Upload a batch of records to BigQuery"""
        if not self.batch_records:
            return
        
        logger.info(f"Uploading batch of {len(self.batch_records)} records to BigQuery...")
        
        try:
            # Get table reference
            table = self.bq_client.get_table(self.table_ref)
            
            # Insert rows
            errors = self.bq_client.insert_rows_json(
                table, 
                self.batch_records,
                ignore_unknown_values=True,
                skip_invalid_rows=False
            )
            
            if errors:
                logger.error(f"BigQuery insert errors: {errors[:5]}")  # Show first 5 errors
                # Continue processing despite errors
            else:
                logger.info(f"Successfully uploaded {len(self.batch_records)} records")
            
            # Clear batch
            self.batch_records = []
            
        except GoogleCloudError as e:
            logger.error(f"BigQuery upload failed: {e}")
            # Save failed batch for recovery
            with open(f'failed_batch_{int(time.time())}.json', 'w') as f:
                json.dump(self.batch_records, f)
            self.batch_records = []
    
    def _save_checkpoint(self):
        """Save processing state for resume capability"""
        checkpoint_data = {
            'processed_count': self.processed_count,
            'search_terms_data': dict(self.search_terms_data),
            'batch_records': self.batch_records
        }
        
        with open(self.checkpoint_file, 'wb') as f:
            pickle.dump(checkpoint_data, f)
        
        logger.info(f"Checkpoint saved: {self.processed_count} records processed")
    
    def _load_checkpoint(self):
        """Load processing state from checkpoint"""
        with open(self.checkpoint_file, 'rb') as f:
            checkpoint_data = pickle.load(f)
        
        self.processed_count = checkpoint_data['processed_count']
        self.search_terms_data = defaultdict(lambda: {
            'products': [],
            'department': None,
            'rank': None
        }, checkpoint_data['search_terms_data'])
        self.batch_records = checkpoint_data['batch_records']
        
        logger.info(f"Checkpoint loaded: {self.processed_count} records already processed")

def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print("Usage: python optimized-report-processor.py <json-file> [report-id] [week-start-date]")
        sys.exit(1)
    
    input_file = sys.argv[1]
    report_id = sys.argv[2] if len(sys.argv) > 2 else os.path.basename(input_file).split('.')[0]
    week_start_date = sys.argv[3] if len(sys.argv) > 3 else '2025-04-06'
    
    # Metadata for the report
    metadata = {
        'reportId': report_id,
        'marketplaceId': 'ATVPDKIKX0DER',
        'weekStartDate': week_start_date,
        'weekEndDate': week_start_date  # Will be calculated if needed
    }
    
    # Create processor and run
    processor = OptimizedReportProcessor(
        batch_size=10000,  # Adjust based on memory availability
        checkpoint_interval=100000  # Save checkpoint every 100k records
    )
    
    try:
        processor.process_file(input_file, metadata)
        
        # Verify upload
        query = f"""
        SELECT COUNT(*) as count 
        FROM `commercecrafted.amazon_analytics.search_terms`
        WHERE report_id = '{report_id}'
        """
        
        result = processor.bq_client.query(query).result()
        for row in result:
            logger.info(f"\nVerification: {row.count:,} records in BigQuery for this report")
        
    except Exception as e:
        logger.error(f"Processing failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()