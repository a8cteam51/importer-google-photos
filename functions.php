<?php declare( strict_types=1 );

use A8C\SpecialProjects\google-photos-album\Plugin;

defined( 'ABSPATH' ) || exit;

// region META

/**
 * Returns the plugin's main class instance.
 *
 * @since   1.0.0
 * @version 1.0.0
 *
 * @return  Plugin
 */
function google_photos_album_get_plugin_instance(): Plugin {
	return Plugin::get_instance();
}

// endregion

// region OTHERS

$google_photos_album_files = glob( constant( 'GOOGLE_PHOTOS_ALBUM_DIR_PATH' ) . 'includes/*.php' );
if ( false !== $google_photos_album_files ) {
	foreach ( $google_photos_album_files as $google_photos_album_file ) {
		if ( 1 === preg_match( '#/includes/_#i', $google_photos_album_file ) ) {
			continue; // Ignore files prefixed with an underscore.
		}

		require_once $google_photos_album_file;
	}
}

// endregion
