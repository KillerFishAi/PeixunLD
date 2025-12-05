#!/bin/bash
set -e

# Ensure we are using python3
PYTHON_CMD=python3
if ! command -v $PYTHON_CMD &> /dev/null; then
    PYTHON_CMD=python
fi

echo "Using Python: $PYTHON_CMD"

# Install Python Dependencies
echo "Installing Python dependencies..."
$PYTHON_CMD -m pip install -r requirements.txt

# Check for Frontend Build
if [ ! -f "backend/static/index.html" ]; then
    echo "Frontend build not found. Attempting to build..."
    
    if command -v npm &> /dev/null; then
        echo "Installing Node dependencies..."
        npm install --legacy-peer-deps
        
        echo "Building Angular app..."
        # Build to backend/static
        npx ng build --output-path=backend/static --configuration=production
        
        # Angular 17+ / Vite might output to backend/static/browser. Move it if so.
        if [ -d "backend/static/browser" ]; then
            echo "Adjusting build output structure..."
            mv backend/static/browser/* backend/static/
            rmdir backend/static/browser
        fi
        
        echo "Frontend built successfully."
    else
        echo "ERROR: 'npm' not found. Cannot build frontend."
        echo "Please install Node.js and npm, then run this script again."
        echo "Or manually upload the built frontend files to 'backend/static/'."
        exit 1
    fi
else
    echo "Frontend build found."
fi

# Start Backend
echo "Starting FastAPI Backend..."
# Use 0.0.0.0 to allow external access
$PYTHON_CMD -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
