# Google Photos Album

Import your Google Photos album images into your WordPress site and display them in a beautiful gallery.

## Description

Google Photos Album is a WordPress plugin that allows you to easily import images from your Google Photos albums directly into your WordPress site. With a simple Gutenberg block, you can paste a Google Photos album URL and automatically import all images into your WordPress media library, creating a beautiful gallery.

## Installation

### From WordPress Admin

1. In your WordPress admin, go to **Plugins > Add New**
2. Search for "Google Photos Album"
3. Click **Install Now** and then **Activate**

### Manual Installation

1. Download the plugin ZIP file
2. Upload the `google-photos-album` folder to `/wp-content/plugins/`
3. Activate the plugin through the **Plugins** menu in WordPress

### Requirements

* WordPress 6.7 or higher
* PHP 8.2 or higher
* Write permissions for media uploads
* Internet connection for importing from Google Photos

## Usage

### Basic Usage

1. **Create or edit a post/page** where you want to add the gallery
2. **Add the Google Photos Album block** - Click the "+" button and search for "Google Photos Album"
3. **Get your album URL** - From Google Photos, share your album and copy the public link
4. **Paste the URL** - Enter the Google Photos album URL in the block
5. **Start Import** - Click "Start Import" to begin the process
6. **Wait for completion** - The block will show progress and automatically create a gallery

### Album URL Format

The plugin works with public Google Photos album URLs that look like:
```
https://photos.app.goo.gl/XXXXXXXXXXXXXXXXX
```

## Developer Information

### REST API Endpoints

* `POST /wp-json/google-photos-album/v1/album/import` - Import a single image
* `GET /wp-json/google-photos-album/v1/album/verify` - Verify album and get image list

### Requirements for Development

* Node.js 20+
* npm 10+
* Composer
* wp-env (optional, for local development)

### Build Commands

```bash
# Install dependencies
npm install
composer install

# Development build
npm run start

# Production build
npm run build

# Run tests
npm run tests:run

# Code linting
npm run lint
```
