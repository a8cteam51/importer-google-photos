import { useState, useEffect } from '@wordpress/element';
import {
	Placeholder,
	TextControl,
	Button,
	Notice,
	ProgressBar,
	Flex,
	FlexItem,
} from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import {
	store as blockEditorStore,
	InnerBlocks,
	useBlockProps,
} from '@wordpress/block-editor';
import { store as noticesStore } from '@wordpress/notices';
import apiFetch from '@wordpress/api-fetch';
import { __, _n, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import AlbumInspectorControls from './inspector-controls';

import './editor.scss';

export default function Edit( { clientId, attributes, setAttributes } ) {
	const [ error, setError ] = useState( '' );
	const [ loading, setLoading ] = useState( false );
	const [ done, setDone ] = useState( false );
	const [ isImporting, setIsImporting ] = useState( false );
	const [ failedImports, setFailedImports ] = useState( [] );

	const { albumUrl, allImages = [], imported = [] } = attributes;
	const postId = useSelect(
		( select ) => select( 'core/editor' ).getCurrentPostId(),
		[]
	);
	const { replaceInnerBlocks } = useDispatch( blockEditorStore );
	const { createErrorNotice } = useDispatch( noticesStore );
	const blockProps = useBlockProps();

	const progress =
		allImages.length > 0
			? Math.round(
					( ( imported.length + failedImports.length ) /
						allImages.length ) *
						100
			  )
			: 0;

	/**
	 * Creates and inserts a gallery block with the imported images.
	 *
	 * @param {Array}  importedImages       - Array of successfully imported image objects.
	 * @param {number} importedImages[].id  - WordPress media ID.
	 * @param {string} importedImages[].url - Image URL.
	 */
	const insertGalleryBlock = ( importedImages ) => {
		const galleryBlock = createBlock(
			'core/gallery',
			{
				ids: importedImages.map( ( img ) => img.id ),
				images: importedImages.map( ( img ) => ( {
					id: img.id,
					url: img.url,
				} ) ),
			},
			importedImages.map( ( img ) =>
				createBlock( 'core/image', {
					id: img.id,
					url: img.url,
					alt: '',
				} )
			)
		);
		replaceInnerBlocks( clientId, [ galleryBlock ] );
	};

	/**
	 * Resets the block to its initial state.
	 * Used when all images fail to import, allowing users to try again.
	 */
	const resetToInitialState = () => {
		setAttributes( {
			allImages: [],
			imported: [],
		} );
		setFailedImports( [] );
		setDone( false );
	};

	/**
	 * Clears temporary import state after successful completion.
	 * Keeps the imported images but removes the import progress tracking.
	 */
	const clearTemporaryImportState = () => {
		setAttributes( { allImages: [] } );
		setFailedImports( [] );
	};

	/**
	 * Shows a snackbar notice when all images fail to import.
	 * Provides guidance to the user about trying a different album.
	 */
	const showAllImportsFailedNotice = () => {
		createErrorNotice(
			__(
				'All images failed to import. Please try a different album or check the album URL.',
				'google-photos-album'
			),
			{
				type: 'snackbar',
				isDismissible: true,
			}
		);
	};

	/**
	 * Shows a snackbar notice for partial import completion.
	 * Informs the user about both successful and failed imports.
	 *
	 * @param {number} successCount - Number of successfully imported images.
	 * @param {number} failedCount  - Number of images that failed to import.
	 */
	const showPartialImportNotice = ( successCount, failedCount ) => {
		createErrorNotice(
			sprintf(
				/* translators: 1: number of successful imports, 2: number of failed imports */
				__(
					'Import completed. %1$d images imported successfully, %2$d images failed to import.',
					'google-photos-album'
				),
				successCount,
				failedCount
			),
			{
				type: 'snackbar',
				isDismissible: true,
			}
		);
	};

	/**
	 * Handles the completion of the import process.
	 * Determines the appropriate action based on success/failure rates.
	 *
	 * @param {number} importedCount - Number of successfully imported images.
	 * @param {number} failedCount   - Number of images that failed to import.
	 */
	const handleImportCompletion = ( importedCount, failedCount ) => {
		setDone( true );
		setIsImporting( false );

		if ( importedCount === 0 ) {
			// All imports failed
			showAllImportsFailedNotice();
			resetToInitialState();
		} else {
			// Some or all imports succeeded
			insertGalleryBlock( imported );

			if ( failedCount > 0 ) {
				showPartialImportNotice( importedCount, failedCount );
			}

			clearTemporaryImportState();
		}
	};

	/**
	 * Handles the failure of a single image import.
	 * Updates the failed imports list and checks if all processing is complete.
	 *
	 * @param {string} imageUrl             - The URL of the image that failed to import.
	 * @param {Error}  importError          - The error object from the failed import.
	 * @param {Array}  updatedFailedImports - Updated array of failed import objects.
	 */
	const handleSingleImageFailure = (
		imageUrl,
		importError,
		updatedFailedImports
	) => {
		console.error( 'Import failed for image:', imageUrl, importError ); // eslint-disable-line no-console -- Enabling during MVP
		setFailedImports( updatedFailedImports );

		// Check if we're done processing all images
		if (
			imported.length + updatedFailedImports.length ===
			allImages.length
		) {
			handleImportCompletion(
				imported.length,
				updatedFailedImports.length
			);
		}
	};

	/**
	 * Verifies the album URL and initiates the import process.
	 * Validates the album and starts importing images if valid.
	 */
	const verifyAlbum = () => {
		setError( '' );
		setLoading( true );

		apiFetch( {
			path: addQueryArgs( '/google-photos-album/v1/album/verify', {
				url: albumUrl,
			} ),
		} )
			.then( ( response ) => {
				if ( response.valid && response.images.length > 0 ) {
					setAttributes( {
						albumUrl,
						allImages: response.images,
						imported: response.imported || [],
					} );
					if (
						( response.imported || [] ).length ===
						response.images.length
					) {
						setDone( true );
						insertGalleryBlock( response.imported );
					} else {
						// Start importing immediately after verify
						setIsImporting( true );
					}
				} else {
					setError(
						__(
							'No valid images found in this album.',
							'google-photos-album'
						)
					);
				}
			} )
			.catch( ( err ) => {
				setError(
					sprintf(
						/* translators: %s: error message */
						__( 'Verification failed: %s', 'google-photos-album' ),
						err.message ||
							__( 'Unknown error', 'google-photos-album' )
					)
				);
			} )
			.finally( () => {
				setLoading( false );
			} );
	};

	useEffect( () => {
		if ( ! isImporting || ! allImages.length || done ) {
			return;
		}

		// Find the next image that hasn't been imported yet or failed
		// Compare using original_url field from imported items and failed imports
		const nextImage = allImages.find(
			( img ) =>
				! imported.some(
					( importedItem ) => importedItem.original_url === img
				) &&
				! failedImports.some(
					( failedItem ) => failedItem.original_url === img
				)
		);

		if ( ! nextImage ) {
			// All images have been processed (either imported or failed)
			handleImportCompletion( imported.length, failedImports.length );
			return;
		}

		const importImage = () => {
			apiFetch( {
				path: '/google-photos-album/v1/album/import',
				method: 'POST',
				data: {
					url: nextImage,
					post_id: postId,
					album_url: albumUrl,
				},
			} )
				.then( ( result ) => {
					if ( result.success && ! result.queued ) {
						const newImportedItem = {
							id: result.id,
							url: result.url,
							original_url: result.original_url || nextImage,
						};
						const updated = [ ...imported, newImportedItem ];
						setAttributes( { imported: updated } );

						if (
							updated.length + failedImports.length ===
							allImages.length
						) {
							handleImportCompletion(
								updated.length,
								failedImports.length
							);
						}
					} else if ( result.queued ) {
						// Handle async import - for now, just continue
						console.log( 'Image queued for async import' ); // eslint-disable-line no-console -- Enabling during MVP
					}
				} )
				.catch( ( err ) => {
					const failedItem = {
						original_url: nextImage,
						error:
							err.message ||
							__( 'Unknown error', 'google-photos-album' ),
					};
					const updatedFailed = [ ...failedImports, failedItem ];
					handleSingleImageFailure( nextImage, err, updatedFailed );
				} );
		};

		importImage();
	}, [
		isImporting,
		imported.length,
		failedImports.length,
		allImages.length,
		done,
		postId,
		albumUrl,
	] ); // Updated dependencies

	// Show placeholder only when no images are imported or import is in progress
	const isImportComplete = imported.length > 0 && allImages.length === 0;

	return (
		<div { ...blockProps }>
			<AlbumInspectorControls
				albumUrl={ albumUrl }
				allImages={ allImages }
				imported={ imported }
			/>

			{ ! isImportComplete && (
				<Placeholder
					icon="format-gallery"
					label={ __(
						'Import Google Photos Album',
						'google-photos-album'
					) }
					instructions={ __(
						'Paste a public album URL to begin importing images.',
						'google-photos-album'
					) }
				>
					<Flex direction="column" gap={ 3 }>
						<FlexItem>
							<TextControl
								label={ __(
									'Google Photos Album URL',
									'google-photos-album'
								) }
								value={ albumUrl }
								onChange={ ( value ) =>
									setAttributes( { albumUrl: value } )
								}
								placeholder={ __(
									'https://photos.app.goo.gl/…',
									'google-photos-album'
								) }
								disabled={ isImporting || loading }
							/>
						</FlexItem>
						<FlexItem>
							<Button
								variant="primary"
								onClick={ verifyAlbum }
								disabled={
									! albumUrl || isImporting || loading
								}
								isBusy={ loading || isImporting }
							>
								{ loading &&
									__( 'Verifying…', 'google-photos-album' ) }
								{ ! loading &&
									isImporting &&
									__( 'Importing…', 'google-photos-album' ) }
								{ ! loading &&
									! isImporting &&
									__(
										'Start Import',
										'google-photos-album'
									) }
							</Button>
						</FlexItem>
						{ allImages.length > 0 && isImporting && (
							<div className="import-progress">
								<div className="import-progress-bar">
									<ProgressBar value={ progress } />
								</div>
								{ sprintf(
									/* translators: 1: number of processed images, 2: total number of images */
									_n(
										'Processing %1$d out of %2$d image…',
										'Processing %1$d out of %2$d images…',
										allImages.length,
										'google-photos-album'
									),
									imported.length + failedImports.length,
									allImages.length
								) }
								{ failedImports.length > 0 && (
									<div className="import-errors">
										{ sprintf(
											/* translators: %d: number of failed imports */
											_n(
												'%d image failed to import',
												'%d images failed to import',
												failedImports.length,
												'google-photos-album'
											),
											failedImports.length
										) }
									</div>
								) }
							</div>
						) }
					</Flex>
					{ error && (
						<Notice status="error" isDismissible={ false }>
							{ error }
						</Notice>
					) }
				</Placeholder>
			) }

			<InnerBlocks
				allowedBlocks={ [ 'core/gallery' ] }
				renderAppender={ false }
			/>
		</div>
	);
}
