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
	 * The parsed Album.
	 *
	 * @since   1.0.0
	 * @version 1.0.0
	 *
	 * @var Album|null
	 */
	public ?Album $album;

	/**
	 * The URL of the Google Photos album.
	 *
	 * @since   1.0.0
	 * @version 1.0.0
	 *
	 * @param   string $url The URL of the Google Photos album.
	 */
	public function __construct( string $url ) {
		$this->url   = \esc_url_raw( $url );
		$this->album = $this->parse_album();
	}

	/**
	 * Enhanced extractor that returns album metadata and photo items with details.
	 *
	 * @return Album|null
	 */
	public function parse_album(): ?Album {
		$response = \wp_safe_remote_get( $this->url );

		if ( \is_wp_error( $response ) ) {
			return null;
		}

		$response_code = \wp_remote_retrieve_response_code( $response );
		if ( $response_code < 200 || $response_code >= 300 ) {
			return null;
		}

		$html = \wp_remote_retrieve_body( $response );
		if ( '' === $html ) {
			return null;
		}

		// The data we need is in an object that's used to initialize the AF_initDataCallback function.
		// Because the function expects an object, it's not valid JSON, but the `data` key which contains
		// each album image and metadata is valid JSON, so we try to extract it.
		$data_json = preg_match( '/data:(\[null.*,[,0\]]\])/mi', $html, $matches );

		if ( 1 !== $data_json ) {
			return null;
		}

		$data = json_decode( $matches[1], true );

		if ( is_null( $data ) ) {
			return null;
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
				$media[0] ?? '',
				$media[1] ?? 0,
				$media[2] ?? 0,
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
	 * @return Album|null
	 */
	public function get_album(): ?Album {
		return $this->album;
	}
}
