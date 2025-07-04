<?php declare( strict_types=1 );

namespace A8C\SpecialProjects\GooglePhotosAlbum\Contracts;

interface ImportStrategy {
	/**
	 * Import a single image URL into the media library or enqueue it for later.
	 *
	 * @param string $url     Direct image URL.
	 * @param int    $post_id Optional. Post ID to attach the image to.
	 *
	 * @return int|true|\WP_Error Attachment ID on success, true if async, or WP_Error on failure.
	 */
	public function import( string $url, int $post_id = 0 ): int|true|\WP_Error;
}
