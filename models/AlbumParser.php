<?php declare( strict_types=1 );

namespace A8C\SpecialProjects\GooglePhotosAlbum\Models;

defined( 'ABSPATH' ) || exit;

/**
 * Album parser class.
 *
 * @since   1.0.0
 * @version 1.0.0
 */
final class AlbumParser {

	/**
	 * The URL of the Google Photos album.
	 *
	 * @since   1.0.0
	 * @version 1.0.0
	 *
	 * @var string
	 */
	private string $url;

	/**
	 * The images in the album.
	 *
	 * @since   1.0.0
	 * @version 1.0.0
	 *
	 * @var string[]
	 */
	private array $images;

	/**
	 * The URL of the Google Photos album.
	 *
	 * @since   1.0.0
	 * @version 1.0.0
	 *
	 * @param   string $url The URL of the Google Photos album.
	 */
	public function __construct( string $url ) {
		$this->url    = \esc_url_raw( $url );
		$this->images = $this->extract_images();
	}

	/**
	 * Parses the album and returns the images.
	 *
	 * @since   1.0.0
	 * @version 1.0.0
	 *
	 * @return string[]
	 */
	private function extract_images(): array {
		$response = \wp_safe_remote_get( $this->url );

		if ( \is_wp_error( $response ) ) {
			return array();
		}

		$urls = \wp_extract_urls( \wp_remote_retrieve_body( $response ) );

		// Very naive assumption that all images are in the album are in the Google Photos URL format.
		$filtered = array_filter(
			$urls,
			static fn ( string $url ) => str_starts_with( $url, 'https://lh3.googleusercontent.com/pw/' ) && str_ends_with( $url, '-no' )
		);

		// Remove the "query params" after `=` from the URL, return empty string if no `=` is found.
		$normalized = array_map(
			static function ( string $url ): string {
				$result = strstr( $url, '=', true );
				return false !== $result ? $result : '';
			},
			$filtered
		);

		if ( count( $normalized ) === 0 ) {
			return array();
		}

		return array_values( array_unique( $normalized ) );
	}



	/**
	 * Get the images in the album.
	 *
	 * @since   1.0.0
	 * @version 1.0.0
	 *
	 * @return string[]
	 */
	public function get_images(): array {
		return $this->images;
	}
}
