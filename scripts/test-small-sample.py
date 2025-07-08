#!/usr/bin/env python3
"""
Test the Python processor with a small sample to verify it's working
"""

import json
import os
import sys
from collections import defaultdict

# Add the current directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_small_sample():
    # Create a small test JSON file
    test_data = {
        "reportSpecification": {
            "reportType": "GET_BRAND_ANALYTICS_SEARCH_TERMS_REPORT",
            "dataStartTime": "2025-04-06",
            "dataEndTime": "2025-04-12"
        },
        "dataByDepartmentAndSearchTerm": [
            {
                "departmentName": "Amazon.com",
                "searchTerm": "test product",
                "searchFrequencyRank": 1,
                "clickedAsin": "B123456789",
                "clickedItemName": "Test Product 1",
                "clickShareRank": 1,
                "clickShare": 0.25,
                "conversionShare": 0.05
            },
            {
                "departmentName": "Amazon.com", 
                "searchTerm": "test product",
                "searchFrequencyRank": 1,
                "clickedAsin": "B987654321",
                "clickedItemName": "Test Product 2", 
                "clickShareRank": 2,
                "clickShare": 0.15,
                "conversionShare": 0.03
            },
            {
                "departmentName": "Amazon.com",
                "searchTerm": "another term",
                "searchFrequencyRank": 2,
                "clickedAsin": "B111111111",
                "clickedItemName": "Another Product",
                "clickShareRank": 1,
                "clickShare": 0.30,
                "conversionShare": 0.08
            }
        ]
    }
    
    test_file = '/tmp/test_report.json'
    with open(test_file, 'w') as f:
        json.dump(test_data, f, indent=2)
    
    print(f"Created test file: {test_file}")
    print(f"File size: {os.path.getsize(test_file)} bytes")
    
    # Process the test data
    search_terms_data = defaultdict(lambda: {
        'products': [],
        'department': None,
        'rank': None
    })
    
    for item in test_data['dataByDepartmentAndSearchTerm']:
        key = f"{item['departmentName']}|{item['searchTerm']}|{item['searchFrequencyRank']}"
        
        data = search_terms_data[key]
        data['department'] = item['departmentName']
        data['rank'] = item['searchFrequencyRank']
        
        data['products'].append({
            'asin': item['clickedAsin'],
            'title': item['clickedItemName'],
            'clickShare': item['clickShare'],
            'conversionShare': item['conversionShare'],
            'clickShareRank': item['clickShareRank']
        })
        
        # Sort by click share rank
        data['products'].sort(key=lambda x: x['clickShareRank'])
    
    print(f"\nProcessed {len(search_terms_data)} unique search terms:")
    for key, data in search_terms_data.items():
        search_term = key.split('|')[1]
        print(f"  {search_term}: {len(data['products'])} products")
        for i, product in enumerate(data['products']):
            print(f"    {i+1}. {product['asin']} - {product['title'][:30]}...")
    
    print(f"\nTest file created at: {test_file}")
    print("You can now test with: python3 scripts/optimized-report-processor.py /tmp/test_report.json test-report 2025-04-06")

if __name__ == "__main__":
    test_small_sample()