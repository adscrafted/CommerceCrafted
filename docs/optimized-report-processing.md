# Optimized Amazon Report Processing

This document describes the optimized solution for processing large Amazon Search Terms reports (2.5GB+).

## Overview

The optimized solution addresses several key challenges:
- **Memory Management**: Streaming JSON parsing to handle files without loading them into memory
- **Performance**: Batch processing and efficient data transformation
- **Reliability**: Checkpoint/resume capability for long-running processes
- **Scalability**: Handles files of any size with consistent memory usage

## Architecture

### Components

1. **Python Processor** (`scripts/optimized-report-processor.py`)
   - Uses `ijson` for streaming JSON parsing
   - Implements batch uploads to BigQuery
   - Provides checkpoint/resume functionality
   - Handles 2.5GB+ files efficiently

2. **Node.js Wrapper** (`scripts/process-report-optimized.ts`)
   - Integrates with existing TypeScript codebase
   - Spawns Python subprocess
   - Monitors progress and handles errors

3. **Orchestrator** (`scripts/optimized-backfill-orchestrator.ts`)
   - Manages multiple report processing
   - Tracks state and handles failures
   - Provides comprehensive reporting

## Setup

### 1. Install Python Dependencies

```bash
# Option 1: Using virtual environment (recommended)
./scripts/setup-python-env.sh

# Option 2: Direct installation
pip3 install -r scripts/requirements-python.txt
```

### 2. Configure Environment

Ensure you have:
- Python 3.7 or later
- Google Cloud credentials in `google-service-key.json`
- BigQuery dataset and table created

## Usage

### Process a Single Report

```bash
# Using Node.js wrapper
npm run process-report-optimized <report-file.json> [report-id] [week-start-date]

# Direct Python execution
python3 scripts/optimized-report-processor.py <report-file.json> [report-id] [week-start-date]
```

### Automated Backfill

```bash
# Process all pending reports
npm run backfill-optimized
```

## Performance Characteristics

### Memory Usage
- Constant memory usage (~200-500MB) regardless of file size
- No string size limitations
- Efficient streaming processing

### Processing Speed
- Typical rate: 10,000-50,000 items/second
- 2.5GB file: ~10-20 minutes
- Depends on network speed for BigQuery uploads

### Batch Sizes
- Default: 10,000 records per batch
- Configurable based on available memory
- Automatic retry on batch failures

## Features

### 1. Streaming JSON Parser
- Processes files line by line
- No memory limitations
- Handles malformed records gracefully

### 2. Data Aggregation
- Groups products by search term
- Maintains top 3 products per term
- Calculates total click/conversion shares

### 3. Checkpoint/Resume
- Saves progress every 100,000 records
- Can resume from interruption
- Preserves processed data

### 4. Error Handling
- Continues on individual record errors
- Saves failed batches for recovery
- Comprehensive logging

### 5. Progress Tracking
- Real-time progress updates
- Processing rate calculation
- ETA estimation for large files

## Configuration Options

### Python Processor Parameters

```python
processor = OptimizedReportProcessor(
    project_id='commercecrafted',
    dataset_id='amazon_analytics', 
    table_id='search_terms',
    batch_size=10000,              # Records per BigQuery batch
    checkpoint_interval=100000      # Records between checkpoints
)
```

### Adjusting for Performance

1. **Increase batch_size** for faster uploads (uses more memory)
2. **Decrease batch_size** for lower memory usage
3. **Adjust checkpoint_interval** based on reliability needs

## Troubleshooting

### Common Issues

1. **"ijson not installed" error**
   ```bash
   pip3 install ijson
   ```

2. **Memory errors with large batches**
   - Reduce `batch_size` in processor initialization
   - Default 10,000 is conservative

3. **BigQuery authentication errors**
   - Ensure `google-service-key.json` exists
   - Check file permissions

4. **Slow processing**
   - Check network connection to BigQuery
   - Consider increasing batch_size
   - Verify no other processes competing for resources

### Resume from Failure

If processing is interrupted:

1. The checkpoint file (`<input-file>.checkpoint`) is automatically created
2. Simply run the same command again
3. Processing will resume from the last checkpoint

### Manual Checkpoint Management

```bash
# View checkpoint
ls -la *.checkpoint

# Remove checkpoint to start fresh
rm <report-file>.json.checkpoint
```

## Monitoring

### Check Processing Status

```bash
# View real-time logs
tail -f backfill.log

# Check BigQuery for uploaded data
npm run show-sample-data
```

### Verify Data Quality

The processor automatically verifies uploads and reports:
- Total records processed
- Records successfully uploaded
- Any failed batches

## Best Practices

1. **Run in screen/tmux** for long-running processes
2. **Monitor disk space** - checkpoints can be large
3. **Test with smaller files** first
4. **Keep Python dependencies updated**
5. **Use virtual environment** to avoid conflicts

## Performance Optimization Tips

1. **SSD Storage**: Place files on SSD for faster reading
2. **Network**: Ensure stable connection to Google Cloud
3. **Concurrent Processing**: Run multiple reports in parallel
4. **Resource Allocation**: Dedicate CPU/memory for processing

## Future Enhancements

Potential improvements:
- Parallel processing within single file
- Direct streaming from S3/GCS
- Real-time data validation
- Automatic retry with exponential backoff
- Integration with Apache Beam for distributed processing