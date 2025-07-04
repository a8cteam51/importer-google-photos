<?php declare( strict_types=1 );

namespace A8C\SpecialProjects\GooglePhotosAlbum\Models;

defined( 'ABSPATH' ) || exit;

use A8C\SpecialProjects\GooglePhotosAlbum\Contracts\ImportStrategy;

/**
 * Direct import strategy.
 *
 * @since   1.0.0
 * @version 1.0.0
 */
final class DirectImportStrategy implements ImportStrategy {

	/**
	 * {@inheritDoc}
	 */
	public function import( string $url, int $post_id = 0 ): int|\WP_Error {
		return ImageImporter::import_single_image( $url, $post_id );
	}
}
