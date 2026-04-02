<?php
/**
 * The importer-google-photos bootstrap file.
 *
 * @since       1.0.0
 * @version     1.0.0
 * @package     A8C\SpecialProjects\Plugins
 * @author      WordPress.com Special Projects
 * @license     GPL-3.0-or-later
 *
 * @noinspection    ALL
 *
 * @wordpress-plugin
 * Plugin Name:             Album Importer for Google Photos
 * Description:             Import your Google Photos album images into your WordPress site and display them in a beautiful gallery.
 * Version:                 1.0.0
 * Requires at least:       6.7
 * Tested up to:            6.9
 * Requires PHP:            8.2
 * Author:                  WordPress.com Special Projects
 * Author URI:              https://wpspecialprojects.wordpress.com
 * License:                 GPL v3 or later
 * License URI:             https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain:             album-importer-for-google-photos
 * Domain Path:             /languages
 **/

defined( 'ABSPATH' ) || exit;

// Define plugin constants.
define( 'AIGP_BASENAME', plugin_basename( __FILE__ ) );
define( 'AIGP_DIR_PATH', plugin_dir_path( __FILE__ ) );
define( 'AIGP_DIR_URL', plugin_dir_url( __FILE__ ) );

// Load the rest of the bootstrap functions.
require_once AIGP_DIR_PATH . '/functions-bootstrap.php';

// Load the autoloader.
if ( ! is_file( AIGP_DIR_PATH . '/vendor/autoload.php' ) ) {
	aigp_output_requirements_error( new WP_Error( 'missing_autoloader' ) );
	return;
}
require_once AIGP_DIR_PATH . '/vendor/autoload.php';

// Bootstrap the plugin (maybe)!
define( 'AIGP_REQUIREMENTS', aigp_validate_requirements() );
if ( is_wp_error( AIGP_REQUIREMENTS ) ) {
	aigp_output_requirements_error( AIGP_REQUIREMENTS );
} else {
	require_once AIGP_DIR_PATH . '/functions.php';
	add_action( 'plugins_loaded', array( aigp_get_plugin_instance(), 'initialize' ) );
}
