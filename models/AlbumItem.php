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
	 * Represents an item in an album.
	 *
	 * @since   1.0.0
	 * @version 1.0.0
	 *
	 * @param string $media_id The ID of the item.
	 * @param string $url The URL of the item.
	 * @param ?int   $width The width of the item.
	 * @param ?int   $height The height of the item.
	 * @param ?int   $filesize The filesize of the item.
	 * @param ?int   $created_at_ms The created at timestamp of the item.
	 * @param ?int   $timezone_offset_ms The timezone offset of the item.
	 */
	public function __construct(
		public string $media_id,
		public string $url,
		public ?int $width,
		public ?int $height,
		public ?int $filesize,
		public ?int $created_at_ms,
		public ?int $timezone_offset_ms,
	) {}

	/**
	 * Get the download URL for the item.
	 *
	 * @since   1.0.0
	 * @version 1.0.0
	 *
	 * @return string
	 */
	public function get_download_url(): string {
		return sprintf( '%s=w%d-h%d-d-no', $this->url, $this->width, $this->height );
	}
}
