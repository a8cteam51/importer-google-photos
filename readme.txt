=== Album Importer for Google Photos ===
Contributors: automattic, wpspecialprojects, cagrimmett, zoonini, kimclow, donnapep, drw158, vevas, fmfernandes, luisasacchetto, oh_hello, racheleliza
Tags: google photos, album, gallery, importer, media library
Requires at least: 6.7
Tested up to: 6.9
Requires PHP: 8.2
Stable tag: 1.0.0
License: GPLv3 or later
License URI: http://www.gnu.org/licenses/gpl-3.0.html

Import Google Photos albums into your WordPress media library and display them in a beautiful gallery block.

== Description ==

Album Importer for Google Photos lets you easily import images from a public Google Photos album into your WordPress site and display them as a gallery. Add the block to any post or page, paste a Google Photos album URL, and start the import. From there, the images are added to your site's Media Library and displayed automatically.

= Basic Usage =

1. Create or edit a post/page where you want the gallery.
2. Add the "Album Importer for Google Photos" block.
3. From Google Photos, share your album and copy the public link URL. The format of a public Google Photos album URL will be similar to: `https://photos.app.goo.gl/XXXXXXXXXXXXXXXXX`.
4. Paste the public link URL into the block.
5. Click Start Import.
6. The gallery is created automatically once complete.

== Installation ==

= From WordPress Admin =

1. Go to Plugins -> Add New.
2. Search for "Google Photos Album".
3. Click Install Now, then Activate.

= Manual Installation =

1. Download the plugin ZIP.
2. Upload the `importer-google-photos` folder to `/wp-content/plugins/`.
3. Activate the plugin through the Plugins menu in WordPress.

== Frequently Asked Questions ==

= What album URLs are supported? =

Publicly shared Google Photos album links (e.g., `https://photos.app.goo.gl/...`).

= Where are images stored? =

Imported images are saved in your WordPress Media Library as standard attachments.

= Do I need a Google API key? =

No. A publicly shared album link is sufficient for importing.

= Does it work with the block editor? =

Yes. The plugin provides a Gutenberg block for inserting and importing the album.

== Screenshots ==

1. Import a public Google Photos album and display it as a gallery block.

== External services ==

This plugin relies on Google Photos (a third-party service operated by Google LLC) to read and import publicly shared album content. No data is sent to any external service unless an authorized user explicitly provides a Google Photos album URL to the plugin. There are two triggers for requests to Google:

1. The "Album Importer for Google Photos" block in the post/page editor: pasting an album URL and clicking "Start Import".
2. The "Import from Google Photos" button that the plugin adds to the media-selection modal of core Image, Gallery, Cover, and Media & Text blocks: pasting an album URL into the modal and clicking "Load album".

= Google Photos =

Google Photos is Google's photo hosting and sharing service. The plugin uses it to fetch the contents of a publicly shared album so the images can be saved into the WordPress Media Library and rendered as a gallery.

What data is sent and when:

* **Verify the album (server -> Google).** When an authorized editor pastes an album URL and triggers verification (clicking "Start Import" in the block, or "Load album" in the media-library modal), the plugin makes a server-side HTTP GET request to the album URL on `photos.google.com` or `photos.app.goo.gl` to retrieve the album's public HTML page and parse the list of image URLs.
* **Render thumbnail previews (browser -> Google).** After verification returns the list of images, the plugin renders thumbnails directly in the editor by setting each image URL as the `src` of an `<img>` tag. This causes the editor user's browser to make HTTP GET requests to `lh3.googleusercontent.com` for each thumbnail.
* **Filename inference (server -> Google).** For each image to be imported, the plugin makes a server-side HTTP HEAD request to `lh3.googleusercontent.com` to read the `Content-Disposition` header (the import continues even if this request fails).
* **Image download (server -> Google).** For each image, the plugin issues a server-side HTTP GET request to `lh3.googleusercontent.com` to download the image bytes and store them as a WordPress media attachment.
* No user credentials, account information, or telemetry are collected or transmitted by the plugin. The only data the plugin sends is the album URL the editor pastes (and the derived image URLs from that album).

Use of Google's services is subject to Google's terms:

* [Google Terms of Service](https://policies.google.com/terms)
* [Google Privacy Policy](https://policies.google.com/privacy)

== Source Code ==

The full, unminified source code for this plugin is publicly available on [GitHub](https://github.com/a8cteam51/importer-google-photos).

== Changelog ==

= 1.0.0 =
* Initial public release.
