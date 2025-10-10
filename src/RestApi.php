<?php declare( strict_types=1 );

namespace A8C\SpecialProjects\GooglePhotosAlbum;

use A8C\SpecialProjects\GooglePhotosAlbum\Models\AlbumParser;
use A8C\SpecialProjects\GooglePhotosAlbum\Models\ImageImporter;

defined( 'ABSPATH' ) || exit;

/**
 * Handles the registration of blocks.
 *
 * @since   1.0.0
 * @version 1.0.0
 */
final class RestApi {
	// region METHODS

	/**
	 * The REST API namespace.
	 *
	 * @since   1.0.0
	 * @version 1.0.0
	 *
	 * @var     string
	 */
	public const REST_NAMESPACE = 'google-photos-album/v1';

	/**
	 * Initializes the blocks.
	 *
	 * @since   1.0.0
	 * @version 1.0.0
	 *
	 * @return  void
	 */
	public function initialize(): void {
		\add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );
	}

	// endregion

	// region HOOKS

	/**
	 * Registers the REST routes.
	 *
	 * @since   1.0.0
	 * @version 1.0.0
	 *
	 * @return  void
	 */
	public function register_rest_routes(): void {
		\register_rest_route(
			self::REST_NAMESPACE,
			'/album/import',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'import_album' ),
				'permission_callback' => fn () => \current_user_can( 'edit_posts' ) && \current_user_can( 'upload_files' ),
				'args'                => array(
					'image_url' => array(
						'required'          => true,
						'type'              => 'string',
						'validate_callback' => fn ( $value ) => \str_starts_with( $value, 'https://lh3.googleusercontent.com/pw/' ),
						'sanitize_callback' => 'esc_url_raw',
					),
					'post_id'   => array(
						'required'          => true,
						'type'              => 'integer',
						'validate_callback' => 'rest_validate_request_arg',
						'sanitize_callback' => 'absint',
						'default'           => 0,
					),
					'album_id' => array(
						'required'          => true,
						'type'              => 'string',
						'validate_callback' => array( $this, 'validate_album_id' ),
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			)
		);

		\register_rest_route(
			self::REST_NAMESPACE,
			'/album/verify',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'verify_album' ),
				'permission_callback' => fn () => \current_user_can( 'edit_posts' ) && \current_user_can( 'upload_files' ),
				'args'                => array(
					'url' => array(
						'required'          => true,
						'type'              => 'string',
						'validate_callback' => array( $this, 'validate_album_url' ),
						'sanitize_callback' => 'esc_url_raw',
					),
				),
			)
		);
	}

	/**
	 * This mostly checks if the album is valid.
	 *
	 * @since   1.0.0
	 * @version 1.0.0
	 *
	 * @param   \WP_REST_Request $request The request object.
	 * @phpstan-param \WP_REST_Request<array<string, mixed>> $request
	 *
	 * @return  \WP_REST_Response Array with image URLs if valid, otherwise an error.
	 */
	public function verify_album( \WP_REST_Request $request ): \WP_REST_Response {
		$url      = $request->get_param( 'url' );
		$parser   = new AlbumParser( $url );
		$images   = $parser->get_album()?->get_images() ?? array();
		$imported = \get_option( $this->get_option_key( $parser->get_album_id() ), array() );

		return new \WP_REST_Response(
			array(
				'valid'    => count( $images ) > 0,
				'images'   => $images,
				'count'    => count( $images ),
				'imported' => $imported,
				'album_id' => $parser->get_album_id(),
			)
		);
	}

	/**
	 * Imports an album image.
	 *
	 * @since   1.0.0
	 * @version 1.0.0
	 *
	 * @param   \WP_REST_Request $request The request object.
	 * @phpstan-param \WP_REST_Request<array<string, mixed>> $request
	 *
	 * @return  \WP_REST_Response
	 */
	public function import_album( \WP_REST_Request $request ): \WP_REST_Response {
		$image_url = $request->get_param( 'image_url' );
		$post_id   = (int) $request->get_param( 'post_id' );
		$album_id  = $request->get_param( 'album_id' );
		$existing  = \get_option( $this->get_option_key( $album_id ), array() );
		$key       = array_search( $image_url, array_column( $existing, 'album_img_url' ), true );

		if ( false !== $key ) {
			return new \WP_REST_Response(
				array_merge( $existing[ $key ], array( 'success' => true ) )
			);
		}

		$result = ImageImporter::import_single_image( $image_url, $post_id );

		if ( \is_wp_error( $result ) ) {
			return new \WP_REST_Response(
				array(
					'success' => false,
					'error'   => $result->get_error_message(),
				),
				400
			);
		}

		$data = array(
			'attachment_id'  => $result,
			'attachment_url' => wp_get_attachment_url( $result ),
			'album_img_url'  => $image_url,
		);

		$option_key = $this->get_option_key( $album_id );
		$existing   = \get_option( $option_key, array() );
		$existing[] = $data;
		\update_option( $option_key, $existing );

		return new \WP_REST_Response(
			array_merge( $data, array( 'success' => true ) )
		);
	}


	/**
	 * Validate the album URL.
	 *
	 * @since   1.0.0
	 * @version 1.0.0
	 *
	 * @param   string $value The value to validate.
	 *
	 * @return  bool
	 */
	public function validate_album_url( string $value ): bool {
		return \str_starts_with( $value, 'https://photos.app.goo.gl/' ) || \str_starts_with( $value, 'https://photos.google.com/share/' );
	}

	/**
	 * Validate the album ID.
	 *
	 * @since   1.0.0
	 * @version 1.0.0
	 *
	 * @param   string $value The value to validate.
	 *
	 * @return  bool
	 */
	public function validate_album_id( string $value ): bool {
		return (bool) \preg_match( '/\bAF1Qip[A-Za-z0-9_-]{20,}\b/', $value );
	}

	/**
	 * Get the option key for the imported album.
	 *
	 * @since   1.0.0
	 * @version 1.0.0
	 *
	 * @param   string $album_id The album ID.
	 *
	 * @return  string
	 */
	private function get_option_key( string $album_id ): string {
		return 'gpa_imported_' . $album_id;
	}

	// endregion
}
