#!/bin/bash
set -e

PLUGIN_SLUG="importer-google-photos"
VERSION="1.0.0"
BUILD_DIR=$(mktemp -d)
DIST_DIR="$BUILD_DIR/$PLUGIN_SLUG"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Building $PLUGIN_SLUG v$VERSION..."

# Install production dependencies
echo "Installing Composer dependencies (no dev)..."
composer install --no-dev --optimize-autoloader --working-dir="$SCRIPT_DIR"

echo "Installing npm dependencies and building assets..."
cd "$SCRIPT_DIR"
npm ci
npm run build

# Copy distribution files
echo "Copying distribution files..."
mkdir -p "$DIST_DIR"

# Top-level files
cp "$SCRIPT_DIR/importer-google-photos.php" "$DIST_DIR/"
cp "$SCRIPT_DIR/functions.php" "$DIST_DIR/"
cp "$SCRIPT_DIR/functions-bootstrap.php" "$DIST_DIR/"
cp "$SCRIPT_DIR/index.php" "$DIST_DIR/"
cp "$SCRIPT_DIR/LICENSE" "$DIST_DIR/"
cp "$SCRIPT_DIR/readme.txt" "$DIST_DIR/"
cp "$SCRIPT_DIR/composer.json" "$DIST_DIR/"

# Directories
cp -r "$SCRIPT_DIR/src" "$DIST_DIR/"
cp -r "$SCRIPT_DIR/includes" "$DIST_DIR/"
cp -r "$SCRIPT_DIR/assets" "$DIST_DIR/"
cp -r "$SCRIPT_DIR/blocks" "$DIST_DIR/"
cp -r "$SCRIPT_DIR/languages" "$DIST_DIR/"
cp -r "$SCRIPT_DIR/models" "$DIST_DIR/"
cp -r "$SCRIPT_DIR/vendor" "$DIST_DIR/"

# Remove source files that shouldn't be in the distribution
rm -rf "$DIST_DIR/blocks/src"
rm -rf "$DIST_DIR/assets/js/src"
rm -rf "$DIST_DIR/assets/css/src"

# Update version in plugin header
sed -i '' "s/^ \* Version:.*/ * Version:                 $VERSION/" "$DIST_DIR/importer-google-photos.php"

# Update Stable tag in readme.txt
sed -i '' "s/^Stable tag:.*/Stable tag: $VERSION/" "$DIST_DIR/readme.txt"

# Create zip
echo "Creating zip..."
cd "$BUILD_DIR"
zip -r "$SCRIPT_DIR/$PLUGIN_SLUG.zip" "$PLUGIN_SLUG"

# Clean up
rm -rf "$BUILD_DIR"

echo "Done! Created $PLUGIN_SLUG.zip"
