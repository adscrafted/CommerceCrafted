#!/bin/bash

echo "Extracting top search terms..."

# Extract lines containing search terms with rank 1-100
grep -A 8 '"searchFrequencyRank" : [1-9][0-9]\?,' /tmp/amazon-search-terms-full.csv | \
  grep -E '"searchTerm"|"searchFrequencyRank"|"clickShare"|"conversionShare"|"clickedAsin"|"clickedItemName"' | \
  head -500 > /tmp/top-terms-raw.txt

echo "Sample of extracted data:"
head -20 /tmp/top-terms-raw.txt

# Count unique search terms in top 100
echo -e "\nCounting unique search terms in top ranks..."
grep '"searchTerm"' /tmp/top-terms-raw.txt | sort -u | wc -l