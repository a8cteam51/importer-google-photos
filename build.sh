#!/bin/bash
set -e

PLUGIN_SLUG="importer-google-photos"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Parse version from plugin header
VERSION=$(sed -n 's/^ \* Version:[[:space:]]*//p' "$SCRIPT_DIR/importer-google-photos.php" | head -n 1)

if [ -z "$VERSION" ]; then
  echo "Error: Could not determine plugin version from importer-google-photos.php" >&2
  exit 1
fi

BUILD_DIR=$(mktemp -d)
DIST_DIR="$BUILD_DIR/$PLUGIN_SLUG"

echo "Building $PLUGIN_SLUG v$VERSION..."

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
cp "$SCRIPT_DIR/composer.lock" "$DIST_DIR/"

# Directories
cp -r "$SCRIPT_DIR/src" "$DIST_DIR/"
cp -r "$SCRIPT_DIR/includes" "$DIST_DIR/"
cp -r "$SCRIPT_DIR/assets" "$DIST_DIR/"
cp -r "$SCRIPT_DIR/blocks" "$DIST_DIR/"
cp -r "$SCRIPT_DIR/languages" "$DIST_DIR/"
cp -r "$SCRIPT_DIR/models" "$DIST_DIR/"

# Remove source files that shouldn't be in the distribution
rm -rf "$DIST_DIR/blocks/src"
rm -rf "$DIST_DIR/assets/js/src"
rm -rf "$DIST_DIR/assets/css/src"

# Install production-only Composer dependencies in the dist dir
echo "Installing Composer dependencies (no dev)..."
composer install --no-dev --optimize-autoloader --working-dir="$DIST_DIR"

# Update version in plugin header
sed -i.bak "s/^ \* Version:.*/ * Version:                 $VERSION/" "$DIST_DIR/importer-google-photos.php"
rm -f "$DIST_DIR/importer-google-photos.php.bak"

# Update Stable tag in readme.txt
sed -i.bak "s/^Stable tag:.*/Stable tag: $VERSION/" "$DIST_DIR/readme.txt"
rm -f "$DIST_DIR/readme.txt.bak"

# Create zip
echo "Creating zip..."
cd "$BUILD_DIR"
zip -r "$SCRIPT_DIR/$PLUGIN_SLUG.zip" "$PLUGIN_SLUG"

# Clean up
rm -rf "$BUILD_DIR"

echo "Done! Created $PLUGIN_SLUG.zip"
