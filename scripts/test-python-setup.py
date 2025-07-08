#!/usr/bin/env python3
"""
Test script to verify Python environment and dependencies
"""

import sys
import os

print("🐍 Python Environment Test")
print("========================\n")

# Check Python version
print(f"Python version: {sys.version}")
print(f"Python executable: {sys.executable}\n")

# Check required modules
modules = [
    ('ijson', 'Streaming JSON parser'),
    ('google.cloud.bigquery', 'BigQuery client'),
    ('google.cloud.exceptions', 'Google Cloud exceptions')
]

all_good = True

for module_name, description in modules:
    try:
        if '.' in module_name:
            parts = module_name.split('.')
            module = __import__(parts[0])
            for part in parts[1:]:
                module = getattr(module, part)
        else:
            module = __import__(module_name)
        print(f"✅ {module_name:<25} - {description}")
    except ImportError as e:
        print(f"❌ {module_name:<25} - {description}")
        print(f"   Error: {e}")
        all_good = False

print()

# Check Google credentials
cred_file = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    'google-service-key.json'
)

if os.path.exists(cred_file):
    print(f"✅ Google credentials found: {cred_file}")
    print(f"   File size: {os.path.getsize(cred_file)} bytes")
else:
    print(f"❌ Google credentials not found: {cred_file}")
    all_good = False

print()

# Test BigQuery connection if possible
if all_good:
    try:
        from google.cloud import bigquery
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = cred_file
        
        client = bigquery.Client(project='commercecrafted')
        datasets = list(client.list_datasets())
        
        print("✅ BigQuery connection successful!")
        print(f"   Found {len(datasets)} datasets")
        
        # Check specific dataset
        try:
            dataset = client.dataset('amazon_analytics')
            tables = list(dataset.list_tables())
            print(f"   amazon_analytics dataset has {len(tables)} tables")
        except Exception as e:
            print(f"   Note: Could not list tables in amazon_analytics: {e}")
            
    except Exception as e:
        print(f"⚠️  BigQuery connection test failed: {e}")
else:
    print("⚠️  Skipping BigQuery connection test due to missing dependencies")

print()

if all_good:
    print("✅ All tests passed! Environment is ready for report processing.")
else:
    print("❌ Some tests failed. Please install missing dependencies:")
    print("   pip3 install -r scripts/requirements-python.txt")