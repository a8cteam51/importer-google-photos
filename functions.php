<?php declare( strict_types=1 );

use A8C\SpecialProjects\GooglePhotosAlbum\Plugin;

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
function aigp_get_plugin_instance(): Plugin {
	return Plugin::get_instance();
}

// endregion

// region OTHERS

$aigp_files = glob( constant( 'AIGP_DIR_PATH' ) . 'includes/*.php' );
if ( false !== $aigp_files ) {
	foreach ( $aigp_files as $aigp_file ) {
		if ( 1 === preg_match( '#/includes/_#i', $aigp_file ) ) {
			continue; // Ignore files prefixed with an underscore.
		}

		require_once $aigp_file;
	}
}

// endregion
