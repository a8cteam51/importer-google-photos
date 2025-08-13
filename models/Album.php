<?php

namespace A8C\SpecialProjects\GooglePhotosAlbum\Models;

/**
 * Represents an album.
 *
 * @since   1.0.0
 * @version 1.0.0
 */
readonly class Album {

	/**
	 * Represents a Google Photos album and its photos.
	 *
	 * @since   1.0.0
	 * @version 1.0.0
	 *
	 * @param string      $album_id The ID of the album.
	 * @param string      $title The title of the album.
	 * @param AlbumItem[] $items The items in the album.
	 */
	public function __construct(
		public string $album_id,
		public string $title,
		public array $items,
	) {}

	/**
	 * Get the download URLs for the album items.
	 *
	 * @since   1.0.0
	 * @version 1.0.0
	 *
	 * @return string[]
	 */
	public function get_media_download_urls(): array {
		return array_map(
			fn ( AlbumItem $item ) => $item->download_url,
			$this->items
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
	public function get_image_urls(): array {
		return array_map(
			fn ( AlbumItem $item ) => $item->url,
			$this->items
		);
	}

	/**
	 * Get the images in the album.
	 *
	 * @since   1.0.0
	 * @version 1.0.0
	 *
	 * @return AlbumItem[]
	 */
	public function get_images(): array {
		return $this->items;
	}
}
