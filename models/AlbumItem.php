<?php

namespace A8C\SpecialProjects\GooglePhotosAlbum\Models;

/**
 * Represents an item in an album.
 *
 * @since   1.0.0
 * @version 1.0.0
 */
readonly class AlbumItem {

	/**
	 * The download URL for the item.
	 *
	 * @since   1.0.0
	 * @version 1.0.0
	 *
	 * @var string
	 */
	public string $download_url;

	/**
	 * Represents an item in an album.
	 *
	 * @since   1.0.0
	 * @version 1.0.0
	 *
	 * @param string $url The URL of the item.
	 * @param int    $width The width of the item.
	 * @param int    $height The height of the item.
	 * @param ?int   $filesize The filesize of the item.
	 * @param ?int   $created_at_ms The created at timestamp of the item.
	 * @param ?int   $timezone_offset_ms The timezone offset of the item.
	 */
	public function __construct(
		public string $url,
		public ?int $width = null,
		public ?int $height = null,
		public ?int $filesize = null,
		public ?int $created_at_ms = null,
		public ?int $timezone_offset_ms = null,
	) {
		$this->download_url = $this->get_download_url();
	}

	/**
	 * Get the download URL for the item.
	 *
	 * @since   1.0.0
	 * @version 1.0.0
	 *
	 * @return string
	 */
	private function get_download_url(): string {
		return sprintf( '%s=w%d-h%d-d-no', $this->url, $this->width ?? 0, $this->height ?? 0 );
	}

	/**
	 * Get the filename for the item.
	 *
	 * @since   1.0.0
	 * @version 1.0.0
	 *
	 * @return string
	 */
	public function get_filename(): string {
		$file_name = '';
		$response  = \wp_safe_remote_head( $this->download_url );

		if ( ! \is_wp_error( $response ) ) {
			$file_name = \wp_remote_retrieve_header( $response, 'content-disposition' );
		}

		$prefix = 'attachment;filename="';
		$suffix = '"';

		// Ensure we have a string (wp_remote_retrieve_header can return array)
		if ( is_array( $file_name ) ) {
			$file_name = $file_name[0] ?? '';
		}

		if ( is_string( $file_name ) && str_starts_with( $file_name, $prefix ) && str_ends_with( $file_name, $suffix ) ) {
			$file_name = substr( $file_name, strlen( $prefix ), -strlen( $suffix ) );
			$file_name = \sanitize_file_name( $file_name );
		}

		if ( ! is_string( $file_name ) || '' === $file_name ) {
			$file_name = \wp_generate_password( 8, false ) . '.jpg';
		}

		return $file_name;
	}
}
