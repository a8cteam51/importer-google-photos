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
	 * The ID of the Google Photos album.
	 *
	 * @since   1.0.0
	 * @version 1.0.0
	 *
	 * @var string
	 */
	private string $album_id;

	/**
	 * The parsed Album.
	 *
	 * @since   1.0.0
	 * @version 1.0.0
	 *
	 * @var Album|null
	 */
	private ?Album $album;

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

		if ( \is_wp_error( $response ) || \WP_Http::OK !== \wp_remote_retrieve_response_code( $response ) ) {
			return null;
		}

		$this->album_id = $this->get_album_id_from_input( $response );

		// The data we need is in an object that's used to initialize the AF_initDataCallback function.
		// Because the function expects an object, it's not valid JSON, but the `data` key which contains
		// each album image and metadata is valid JSON, so we try to extract it.
		if ( 1 !== preg_match( '/data:(\[null.*,[,0\]]\])/mi', \wp_remote_retrieve_body( $response ), $matches ) ) {
			return null;
		}

		$data = json_decode( $matches[1], true );

		if ( is_null( $data ) ) {
			return null;
		}

		$entries = is_array( $data[1] ?? null ) ? $data[1] : array();

		$album = array(
			'id'    => $data[3][0] ?? '',
			'title' => $data[3][1] ?? '',
		);

		$items = array();

		foreach ( $entries as $entry ) {
			if ( ! is_array( $entry ) ) {
				continue;
			}

			$media = $entry[1] ?? null;
			if ( ! is_array( $media ) ) {
				continue;
			}

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

	/**
	 * Get the ID of the Google Photos album.
	 *
	 * @since   1.0.0
	 * @version 1.0.0
	 *
	 * @return string
	 */
	public function get_album_id(): string {
		return $this->album_id;
	}

	/**
	 * Determines the album ID from the provided URL if using a share link. Otherwise,
	 * gets the album ID from the initial album request.
	 *
	 * @since   1.0.0
	 * @version 1.0.0
	 *
	 * @param array<string, mixed> $response The response from the API.
	 *
	 * @return string
	 */
	private function get_album_id_from_input( $response ): string {
		if ( \str_starts_with( $this->url, 'https://photos.google.com/share/' ) ) {
			return (string) \strstr( $this->url, '?key', true );
		} else {
			return (string) \strstr( $response['http_response']->get_response_object()->url, '?key', true );
		}
	}
}
