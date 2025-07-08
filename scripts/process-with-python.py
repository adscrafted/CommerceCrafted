#!/usr/bin/env python3

"""
Process Amazon Report with Python
Uses ijson for streaming JSON parsing to handle the 3GB file efficiently
"""

import ijson
import json
import sys
from datetime import datetime

def process_amazon_report():
    print("🚀 Processing Amazon Report with Python ijson")
    print("=============================================\n")
    
    input_path = "/tmp/report-1520270020276.json"
    output_path = "/tmp/python-bigquery-data.ndjson"
    
    report_metadata = {
        "report_id": "cmct9mcfz00019a48mgzmp4e2",
        "marketplace_id": "ATVPDKIKX0DER", 
        "week_start_date": "2025-06-29",
        "week_end_date": "2025-07-05"
    }
    
    record_count = 0
    
    try:
        print("1️⃣  Opening files...")
        with open(input_path, 'rb') as input_file, open(output_path, 'w') as output_file:
            print("2️⃣  Streaming JSON data...")
            
            # Use ijson to stream parse the dataByDepartmentAndSearchTerm array
            parser = ijson.parse(input_file)
            
            current_record = {}
            in_data_array = False
            current_path = []
            
            for prefix, event, value in parser:
                # Track if we're in the data array
                if prefix == 'dataByDepartmentAndSearchTerm' and event == 'start_array':
                    in_data_array = True
                    print("   📊 Found data array, processing records...")
                    continue
                    
                if prefix == 'dataByDepartmentAndSearchTerm' and event == 'end_array':
                    break
                    
                if not in_data_array:
                    continue
                
                # Process records in the array
                if prefix.startswith('dataByDepartmentAndSearchTerm.item'):
                    if event == 'start_map':
                        current_record = {}
                    elif event == 'end_map':
                        # Process complete record
                        if 'searchTerm' in current_record and 'departmentName' in current_record:
                            bq_record = {
                                "report_id": report_metadata["report_id"],
                                "marketplace_id": report_metadata["marketplace_id"],
                                "week_start_date": report_metadata["week_start_date"],
                                "week_end_date": report_metadata["week_end_date"],
                                "department_name": current_record.get("departmentName"),
                                "search_term": current_record.get("searchTerm"),
                                "search_frequency_rank": current_record.get("searchFrequencyRank"),
                                "clicked_asin": current_record.get("clickedAsin"),
                                "clicked_item_name": current_record.get("clickedItemName"),
                                "click_share_rank": current_record.get("clickShareRank"),
                                "click_share": current_record.get("clickShare"),
                                "conversion_share": current_record.get("conversionShare"),
                                "ingested_at": datetime.now().isoformat()
                            }
                            
                            output_file.write(json.dumps(bq_record) + '\n')
                            record_count += 1
                            
                            if record_count % 100000 == 0:
                                print(f"   📈 Processed {record_count:,} records...")
                    
                    elif event in ('string', 'number'):
                        # Extract field name from prefix
                        field_name = prefix.split('.')[-1]
                        current_record[field_name] = value
        
        print(f"\n✅ Processing complete! Transformed {record_count:,} records")
        print(f"📄 Output file: {output_path}")
        
        return output_path, record_count
        
    except ImportError:
        print("❌ ijson library not installed. Run: pip install ijson")
        return None, 0
    except Exception as e:
        print(f"❌ Processing failed: {e}")
        return None, 0

if __name__ == "__main__":
    output_path, record_count = process_amazon_report()
    if output_path:
        print(f"\n🎯 Ready for BigQuery upload:")
        print(f"   File: {output_path}")
        print(f"   Records: {record_count:,}")