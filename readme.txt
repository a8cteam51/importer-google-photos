=== Album Importer for Google Photos ===
Contributors: wpcomspecialprojects
Tags: google photos, album, gallery, importer, media library
Requires at least: 6.7
Tested up to: 6.9
Requires PHP: 8.2
Stable tag: 1.0.0-beta.5
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


== Changelog ==

= 1.0.0-beta.3 =
* Initial public beta release.

== Upgrade Notice ==

= 1.0.0-beta.3 =
Initial public beta.
