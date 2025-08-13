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
	 * The enhanced images in the album.
	 *
	 * @since   1.0.0
	 * @version 1.0.0
	 *
	 * @var array{}|Album
	 */
	private array|Album $enhanced;

	/**
	 * The URL of the Google Photos album.
	 *
	 * @since   1.0.0
	 * @version 1.0.0
	 *
	 * @param   string $url The URL of the Google Photos album.
	 */
	public function __construct( string $url ) {
		$this->url      = \esc_url_raw( $url );
		$this->images   = $this->extract_images();
		$this->enhanced = $this->extract_images_enhanced();
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
	 * Enhanced extractor that returns album metadata and photo items with details.
	 *
	 * @return array{}|Album
	 */
	public function extract_images_enhanced(): array|Album {
		$response = \wp_safe_remote_get( $this->url );

		if ( \is_wp_error( $response ) ) {
			return array();
		}

		$html = \wp_remote_retrieve_body( $response );

		if ( is_wp_error( $html ) ) {
			return array();
		}

		// The data we need is in an object that's used to initialize the AF_initDataCallback function.
		// Because the function expects an object, it's not valid JSON, but the `data` key which contains
		// each album image and metadata is valid JSON, so we try to extract it.
		$data_json = preg_match( '/data:(\[null.*,[,0\]]])/mi', $html, $matches );

		if ( 1 !== $data_json ) {
			return array();
		}

		$data = json_decode( $matches[1], true );

		if ( is_null( $data ) ) {
			return array();
		}

		$entries = $data[1] ?? array();
		$album   = array(
			'id'    => $data[3][0] ?? null,
			'title' => $data[3][1] ?? null,
		);

		$items = array();
		foreach ( $entries as $entry ) {
			$media   = $entry[1];
			$items[] = new AlbumItem(
				$entry[0],
				$media[0] ?? '',
				$media[1] ?? null,
				$media[2] ?? null,
				$media[9][0] ?? null,
				$entry[2] ?? null,
				$entry[4] ?? null
			);
		}

		return new Album(
			$album['id'],
			$album['title'],
			$items
		);
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

	/**
	 * Get the enhanced images in the album.
	 *
	 * @since   1.0.0
	 * @version 1.0.0
	 *
	 * @return array{}|Album
	 */
	public function get_enhanced(): array|Album {
		return $this->enhanced;
	}
}
