#!/bin/bash

# Build script for deployment
echo "Building African Nations League application..."

# Install backend dependencies
cd backend
pip install -r ../requirements.txt
cd ..

# Install frontend dependencies
npm install

# Build React app
npm run build

echo "Build completed successfully!"
