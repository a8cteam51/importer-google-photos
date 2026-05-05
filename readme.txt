=== Album Importer for Google Photos ===
Contributors: wpspecialprojects, cagrimmett, zoonini, kimclow, donnapep, drw158, vevas, fmfernandes, luisasacchetto, oh_hello, racheleliza
Tags: google photos, album, gallery, importer, media library
Requires at least: 6.7
Tested up to: 6.9
Requires PHP: 8.2
Stable tag: 1.0.0
License: GPLv3 or later
License URI: http://www.gnu.org/licenses/gpl-3.0.html

Import Google Photos albums into your WordPress media library and display them in a beautiful gallery block.

== Description ==

Album Importer for Google Photos lets you quickly import images from a public Google Photos album into your WordPress site and show them as a gallery. Add the block to any post or page, paste a Google Photos album URL, and start the import — the images are added to your Media Library and displayed automatically.

== Installation ==

**From WordPress Admin**
1. Go to Plugins → Add New.
2. Search for "Google Photos Album".
3. Click Install Now, then Activate.

**Manual Installation**
1. Download the plugin ZIP.
2. Upload the `importer-google-photos` folder to `/wp-content/plugins/`.
3. Activate the plugin through the Plugins menu in WordPress.

== Instructions ==

Basic Usage

1. Create or edit a post/page where you want the gallery.
2. Add the "Google Photos Album" block.
3. From Google Photos, share your album and copy the public link.
4. Paste the album URL into the block.
5. Click Start Import.
6. Wait for completion — the gallery is created automatically.

Album URL Format

Use a publicly shared Google Photos album URL, for example:

`https://photos.app.goo.gl/XXXXXXXXXXXXXXXXX`


== Blocks ==

This plugin provides 1 block.

- Album Importer for Google Photos — Paste a Google Photos album URL to import images and display a gallery.


== Frequently Asked Questions ==

**What album URLs are supported?**

Publicly shared Google Photos album links (e.g., `https://photos.app.goo.gl/...`).

**Where are images stored?**

Imported images are saved in your WordPress Media Library as standard attachments.

**Do I need a Google API key?**

No. A publicly shared album link is sufficient for importing.

**Does it work with the block editor?**
Yes. The plugin provides a Gutenberg block for inserting and importing the album.


== External services ==

This plugin relies on Google Photos (a third-party service operated by Google LLC) to read and import publicly shared album content. No data is sent to any external service unless an authorized user explicitly pastes a Google Photos album URL into the block and clicks "Start Import".

= Google Photos =

What it is and what it is used for: Google Photos is Google's photo hosting and sharing service. The plugin uses it to fetch the contents of a publicly shared album so the images can be saved into the WordPress media library and rendered as a gallery.

What data is sent and when:

* When an authorized editor clicks "Start Import" in the block, the plugin makes an HTTP GET request to the album URL on `photos.google.com` or `photos.app.goo.gl` to retrieve the album's public HTML page and parse the list of image URLs.
* For each image found in the album, the plugin makes an HTTP HEAD request to `lh3.googleusercontent.com` to read the `Content-Disposition` header for filename inference (the import continues even if this request fails).
* For each image, the plugin then issues an HTTP GET request to `lh3.googleusercontent.com` to download the image bytes and store them as a WordPress media attachment.
* No user credentials, account information, site data, or telemetry are transmitted. The only data sent is the album URL the user pastes (and the derived image URLs from that album), plus the standard HTTP request headers added by WordPress's HTTP API (user agent, etc.).

Use of Google's services is subject to Google's terms:

* Google Terms of Service: https://policies.google.com/terms
* Google Privacy Policy: https://policies.google.com/privacy

== Source Code ==

The full, unminified source code for this plugin — including the JavaScript and CSS sources used to generate the compiled files in `assets/js/build/` and `blocks/build/` — is publicly available on GitHub:

https://github.com/a8cteam51/importer-google-photos

Build tools and instructions:

* JavaScript and CSS are built with `@wordpress/scripts` (webpack) via npm.
* PHP dependencies are managed with Composer.
* To build the plugin from source, clone the repository and run:
    1. `npm ci`
    2. `npm run build`
    3. `composer install --no-dev --optimize-autoloader`
* A `build.sh` script in the repository produces a distributable ZIP that mirrors the version published here.
* JavaScript sources are located in `assets/js/src/` and `blocks/src/`. CSS sources are located in `assets/css/src/`.

== Changelog ==

= 1.0.0-beta.3 =
* Initial public beta release.

== Upgrade Notice ==

= 1.0.0-beta.3 =
Initial public beta.
