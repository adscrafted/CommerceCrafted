#!/usr/bin/env python3
"""
Google Trends data fetcher using pytrends
Fetches trend data for Amazon product keywords
"""

import json
import sys
from datetime import datetime, timedelta
from pytrends.request import TrendReq
import pandas as pd
import time
import random

class GoogleTrendsAnalyzer:
    def __init__(self):
        # Initialize pytrends with custom parameters to avoid rate limiting
        self.pytrends = TrendReq(
            hl='en-US', 
            tz=360,
            timeout=(10, 25),
            retries=2,
            backoff_factor=0.1
        )
        
    def fetch_trends(self, keywords, timeframe='today 12-m', geo='US'):
        """
        Fetch Google Trends data for given keywords
        
        Args:
            keywords: List of keywords (max 5)
            timeframe: Time period ('today 12-m', 'today 3-m', etc.)
            geo: Geographic location code
            
        Returns:
            Dict with trend data
        """
        try:
            # Ensure we don't exceed 5 keywords (Google Trends limit)
            keywords = keywords[:5]
            
            # Add random delay to avoid rate limiting
            time.sleep(random.uniform(0.5, 2.0))
            
            # Build payload
            self.pytrends.build_payload(
                keywords, 
                cat=0,  # All categories
                timeframe=timeframe, 
                geo=geo, 
                gprop=''  # Web search
            )
            
            # Get interest over time
            interest_over_time = self.pytrends.interest_over_time()
            
            # Get related queries
            related_queries = self.pytrends.related_queries()
            
            # Get interest by region (US states)
            interest_by_region = self.pytrends.interest_by_region(
                resolution='COUNTRY', 
                inc_low_vol=True, 
                inc_geo_code=False
            )
            
            # Process the data
            result = {
                'keywords': keywords,
                'timeframe': timeframe,
                'timestamp': datetime.now().isoformat(),
                'interest_over_time': self._process_interest_over_time(interest_over_time),
                'related_queries': self._process_related_queries(related_queries, keywords),
                'interest_by_region': self._process_interest_by_region(interest_by_region, keywords),
                'seasonality': self._analyze_seasonality(interest_over_time, keywords)
            }
            
            return result
            
        except Exception as e:
            return {
                'error': str(e),
                'keywords': keywords,
                'timestamp': datetime.now().isoformat()
            }
    
    def _process_interest_over_time(self, df):
        """Convert interest over time dataframe to JSON-friendly format"""
        if df.empty:
            return []
        
        # Remove 'isPartial' column if it exists
        if 'isPartial' in df.columns:
            df = df.drop('isPartial', axis=1)
        
        result = []
        for index, row in df.iterrows():
            data_point = {
                'date': index.strftime('%Y-%m-%d'),
                'month': index.strftime('%b'),
                'year': index.year
            }
            
            # Add value for each keyword
            for column in df.columns:
                data_point[column] = int(row[column])
            
            result.append(data_point)
        
        return result
    
    def _process_related_queries(self, related_dict, keywords):
        """Process related queries for each keyword"""
        result = {}
        
        for keyword in keywords:
            if keyword in related_dict:
                keyword_data = related_dict[keyword]
                result[keyword] = {
                    'top': [],
                    'rising': []
                }
                
                # Process top queries
                if 'top' in keyword_data and keyword_data['top'] is not None:
                    top_df = keyword_data['top']
                    if not top_df.empty:
                        result[keyword]['top'] = [
                            {
                                'query': row['query'],
                                'value': int(row['value'])
                            }
                            for _, row in top_df.head(10).iterrows()
                        ]
                
                # Process rising queries
                if 'rising' in keyword_data and keyword_data['rising'] is not None:
                    rising_df = keyword_data['rising']
                    if not rising_df.empty:
                        result[keyword]['rising'] = [
                            {
                                'query': row['query'],
                                'value': str(row['value'])  # Can be 'Breakout' or percentage
                            }
                            for _, row in rising_df.head(10).iterrows()
                        ]
        
        return result
    
    def _process_interest_by_region(self, df, keywords):
        """Process interest by region data"""
        if df.empty:
            return {}
        
        result = {}
        for keyword in keywords:
            if keyword in df.columns:
                # Get top 10 regions
                top_regions = df[keyword].nlargest(10)
                result[keyword] = [
                    {
                        'region': region,
                        'value': int(value)
                    }
                    for region, value in top_regions.items()
                ]
        
        return result
    
    def _analyze_seasonality(self, df, keywords):
        """Analyze seasonality patterns in the data"""
        if df.empty or len(df) < 12:
            return {}
        
        result = {}
        
        for keyword in keywords:
            if keyword not in df.columns:
                continue
                
            # Group by month and calculate average
            monthly_avg = {}
            for index, value in df[keyword].items():
                month = index.strftime('%B')
                if month not in monthly_avg:
                    monthly_avg[month] = []
                monthly_avg[month].append(value)
            
            # Calculate averages
            monthly_data = []
            for month in ['January', 'February', 'March', 'April', 'May', 'June', 
                         'July', 'August', 'September', 'October', 'November', 'December']:
                if month in monthly_avg:
                    avg_value = sum(monthly_avg[month]) / len(monthly_avg[month])
                    monthly_data.append({
                        'month': month[:3],
                        'value': round(avg_value, 1)
                    })
            
            # Find peak and low seasons
            if monthly_data:
                peak_month = max(monthly_data, key=lambda x: x['value'])
                low_month = min(monthly_data, key=lambda x: x['value'])
                
                result[keyword] = {
                    'monthly_averages': monthly_data,
                    'peak_season': peak_month['month'],
                    'peak_value': peak_month['value'],
                    'low_season': low_month['month'],
                    'low_value': low_month['value'],
                    'seasonality_score': round(
                        (peak_month['value'] - low_month['value']) / 
                        (peak_month['value'] + 0.1) * 100, 1
                    )
                }
        
        return result

def main():
    """Main function to handle command line execution"""
    if len(sys.argv) < 2:
        print(json.dumps({
            'error': 'Please provide keywords as arguments'
        }))
        sys.exit(1)
    
    # Get keywords from command line arguments
    keywords = sys.argv[1:]
    
    # Initialize analyzer
    analyzer = GoogleTrendsAnalyzer()
    
    # Fetch trends
    result = analyzer.fetch_trends(keywords)
    
    # Output as JSON
    print(json.dumps(result, indent=2))

if __name__ == '__main__':
    main()