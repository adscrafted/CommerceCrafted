#!/bin/bash

# Setup Python environment for optimized report processing

echo "🐍 Setting up Python environment for optimized report processing"
echo "=============================================================="

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed"
    echo "Please install Python 3.7 or later"
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"

# Create virtual environment
VENV_DIR="scripts/.venv"

if [ -d "$VENV_DIR" ]; then
    echo "⚠️  Virtual environment already exists at $VENV_DIR"
    read -p "Do you want to recreate it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$VENV_DIR"
        python3 -m venv "$VENV_DIR"
    fi
else
    echo "📦 Creating virtual environment..."
    python3 -m venv "$VENV_DIR"
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source "$VENV_DIR/bin/activate"

# Upgrade pip
echo "📦 Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo "📦 Installing Python dependencies..."
pip install -r scripts/requirements-python.txt

echo ""
echo "✅ Setup complete!"
echo ""
echo "To use the optimized processor, run:"
echo "  source scripts/.venv/bin/activate"
echo "  npm run process-report-optimized <report-file>"
echo ""
echo "Or use the automated backfill:"
echo "  source scripts/.venv/bin/activate"
echo "  npm run backfill-optimized"