#!/usr/bin/env python3
"""
Check the status of checkpoint files
"""

import pickle
import os
import sys

def check_checkpoint(checkpoint_file):
    if not os.path.exists(checkpoint_file):
        print(f"❌ Checkpoint file not found: {checkpoint_file}")
        return
    
    size = os.path.getsize(checkpoint_file)
    print(f"📁 Checkpoint file: {checkpoint_file}")
    print(f"📦 Size: {size:,} bytes ({size/1024/1024:.1f} MB)")
    
    if size == 0:
        print("⚠️  Empty checkpoint file")
        return
    
    try:
        with open(checkpoint_file, 'rb') as f:
            data = pickle.load(f)
        
        print(f"✅ Checkpoint loaded successfully")
        print(f"📊 Processed count: {data.get('processed_count', 0):,}")
        print(f"🔍 Search terms data: {len(data.get('search_terms_data', {})):,} terms")
        print(f"📝 Batch records: {len(data.get('batch_records', [])):,} records")
        
        # Show sample search terms
        search_terms = data.get('search_terms_data', {})
        if search_terms:
            print(f"\n📋 Sample search terms (first 5):")
            for i, (key, term_data) in enumerate(list(search_terms.items())[:5]):
                search_term = key.split('|')[1] if '|' in key else key
                products = term_data.get('products', [])
                print(f"   {i+1}. '{search_term}' - {len(products)} products")
        
    except Exception as e:
        print(f"❌ Error reading checkpoint: {e}")

if __name__ == "__main__":
    checkpoint_files = [
        "/Users/anthony/Documents/Projects/CommerceCrafted/tmp/report-1520525020276.json.checkpoint",
        "/Users/anthony/Documents/Projects/CommerceCrafted/tmp/report-1520976020277.json.checkpoint"
    ]
    
    for checkpoint_file in checkpoint_files:
        check_checkpoint(checkpoint_file)
        print("-" * 50)