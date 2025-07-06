#!/bin/bash

# Setup script for Google Trends integration

echo "Setting up Google Trends integration..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is required but not installed."
    echo "Please install Python 3 and try again."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "scripts/venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv scripts/venv
fi

# Activate virtual environment
source scripts/venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r scripts/requirements.txt

echo "Setup complete!"
echo ""
echo "To test the Google Trends integration:"
echo "1. Start your Next.js development server: npm run dev"
echo "2. Visit a product page to see real Google Trends data"
echo ""
echo "Note: If pytrends is not installed, the app will use mock data automatically."