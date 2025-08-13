<?php declare( strict_types=1 );

namespace A8C\SpecialProjects\GooglePhotosAlbum\Models;

defined( 'ABSPATH' ) || exit;

/**
 * Image importer class.
 *
 * @since   1.0.0
 * @version 1.0.0
 */
final class ImageImporter {
	/**
	 * Import a single image URL into the media library.
	 *
	 * @param string $url     Image URL (base Google Photos image URL).
	 * @param int    $post_id Optional. Attach image to this post ID.
	 *
	 * @return int|\WP_Error Attachment ID or WP_Error on failure.
	 */
	public static function import_single_image( string $url, int $post_id = 0 ): int|\WP_Error {
		$item = new AlbumItem( $url );

		$file_name = $item->get_filename();

		return self::download_and_import( $url, $file_name, $post_id );
	}

	/**
	 * Download and import the image file.
	 *
	 * @param string $url       Image URL.
	 * @param string $file_name Filename for the imported image.
	 * @param int    $post_id   Post ID to attach image to.
	 *
	 * @return int|\WP_Error Attachment ID or WP_Error on failure.
	 */
	private static function download_and_import( string $url, string $file_name, int $post_id ): int|\WP_Error {
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';

		$tmp_file = \download_url( $url );

		if ( \is_wp_error( $tmp_file ) ) {
			return $tmp_file;
		}

		$file_array = array(
			'name'     => $file_name,
			'tmp_name' => $tmp_file,
		);

		$attachment_id = \media_handle_sideload( $file_array, $post_id );

		if ( \is_wp_error( $attachment_id ) ) {
			\wp_delete_file( $tmp_file );
		}

		return $attachment_id;
	}
}
