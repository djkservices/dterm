#!/bin/bash

# dTerm Build Script
# Double-click this file to build dTerm.app

cd "$(dirname "$0")"

echo "================================"
echo "  Building dTerm for macOS"
echo "================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

# Rebuild native modules for Electron
echo "Rebuilding native modules..."
npx electron-rebuild
echo ""

# Build the app
echo "Building app..."
npm run build

echo ""
echo "================================"
echo "  Build complete!"
echo "================================"
echo ""
echo "Your app is in: dist/"
echo "  - dTerm.dmg (installer)"
echo "  - dTerm.app (in mac folder)"
echo ""
echo "Press any key to close..."
read -n 1
