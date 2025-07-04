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
		$validation_result = self::validate_image_response( $url );
		if ( \is_wp_error( $validation_result ) ) {
			return $validation_result;
		}

		$content_type = $validation_result['content_type'];
		$response     = $validation_result['response'];

		$file_name = self::extract_filename( $response, $content_type );

		return self::download_and_import( $url, $file_name, $post_id );
	}

	/**
	 * Validate the image response and content type.
	 *
	 * @param string $url Image URL.
	 *
	 * @return array|\WP_Error Array with response and content_type, or WP_Error on failure.
	 */
	private static function validate_image_response( string $url ): array|\WP_Error {
		$response = \wp_safe_remote_head( $url . '=d' );

		if ( \is_wp_error( $response ) ) {
			return $response;
		}

		$content_type = \wp_remote_retrieve_header( $response, 'content-type' );

		if ( is_array( $content_type ) ) {
			$content_type = $content_type[0] ?? '';
		}

		if ( ! $content_type || ! \wp_image_editor_supports( array( 'mime_type' => $content_type ) ) ) {
			return new \WP_Error(
				'unsupported_format',
				sprintf( 'Unsupported image format: %s.', $content_type )
			);
		}

		return array(
			'response'     => $response,
			'content_type' => $content_type,
		);
	}

	/**
	 * Extract and sanitize filename from response headers.
	 *
	 * @param array  $response     HTTP response array.
	 * @param string $content_type Content type for fallback filename.
	 *
	 * @return string Sanitized filename.
	 */
	private static function extract_filename( array $response, string $content_type ): string {
		$file_name = \wp_remote_retrieve_header( $response, 'content-disposition' );
		$prefix    = 'attachment;filename="';
		$suffix    = '"';

		// Ensure we have a string (wp_remote_retrieve_header can return array)
		if ( is_array( $file_name ) ) {
			$file_name = $file_name[0] ?? '';
		}

		if ( is_string( $file_name ) && str_starts_with( $file_name, $prefix ) && str_ends_with( $file_name, $suffix ) ) {
			$file_name = substr( $file_name, strlen( $prefix ), -strlen( $suffix ) );
			$file_name = \sanitize_file_name( $file_name );
		}

		if ( ! $file_name ) {
			$file_name = \wp_generate_password( 8, false ) . '.' . \wp_get_default_extension_for_mime_type( $content_type );
		}

		return $file_name;
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

		$tmp_file = \download_url( $url . '=d' );

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
