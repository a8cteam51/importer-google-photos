<?php declare( strict_types=1 );

namespace A8C\SpecialProjects\GooglePhotosAlbum\Models;

defined( 'ABSPATH' ) || exit;

use A8C\SpecialProjects\GooglePhotosAlbum\Contracts\ImportStrategy;

/**
 * Async import strategy.
 *
 * @since   1.0.0
 * @version 1.0.0
 */
final class AsyncImportStrategy implements ImportStrategy {

	/**
	 * {@inheritDoc}
	 */
	public function import( string $url, int $post_id = 0 ): int|true|\WP_Error {
		\as_enqueue_async_action(
			'gpa/import_image',
			array(
				'url'     => $url,
				'post_id' => $post_id,
			)
		);

		return true;
	}
}

\add_action(
	'gpa/import_image',
	function ( $args ) {
		ImageImporter::import_single_image( $args['url'], (int) $args['post_id'] );
	},
	10,
	1
);
