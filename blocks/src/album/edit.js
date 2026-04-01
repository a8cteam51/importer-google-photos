import {
	useState,
	useEffect,
	createInterpolateElement,
} from '@wordpress/element';
import {
	Placeholder,
	TextControl,
	Button,
	Notice,
	ProgressBar,
	Flex,
	FlexItem,
	ExternalLink,
	ToolbarButton,
} from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import {
	store as blockEditorStore,
	InnerBlocks,
	useBlockProps,
	BlockControls,
} from '@wordpress/block-editor';
import { store as noticesStore } from '@wordpress/notices';
import apiFetch from '@wordpress/api-fetch';
import { __, _n, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import AlbumInspectorControls from './inspector-controls';

import './editor.scss';

export default function Edit( { clientId, attributes, setAttributes } ) {
	const { replaceInnerBlocks } = useDispatch( blockEditorStore );
	const { createNotice } = useDispatch( noticesStore );

	const blockProps = useBlockProps();
	const { albumUrl, importedImages, allImages, importCompleted } = attributes;

	const [ error, setError ] = useState( null );
	const [ loading, setLoading ] = useState( false );
	const [ importing, setImporting ] = useState( false );
	const [ importProgress, setImportProgress ] = useState( 0 );

	const currentPostId = useSelect(
		( select ) => select( 'core/editor' ).getCurrentPostId(),
		[]
	);

	/**
	 * Import a single image from the album
	 * @param {string} imageUrl - The Google Photos image URL
	 * @param {string} albumId  - The album ID
	 * @return {Promise} Promise that resolves to the import result
	 */
	const importSingleImage = async ( imageUrl, albumId ) => {
		return apiFetch( {
			path: '/aigp/v1/album/import',
			method: 'POST',
			data: {
				image_url: imageUrl,
				post_id: currentPostId,
				album_id: albumId,
			},
		} );
	};

	/**
	 * Import all images that haven't been imported yet
	 * @param {Array}  allImagesInAlbum      - All images from the album
	 * @param {Array}  alreadyImportedImages - Already imported images
	 * @param {string} albumId               - The album ID
	 */
	const importImages = async (
		allImagesInAlbum,
		alreadyImportedImages,
		albumId
	) => {
		const importedUrls = new Set(
			alreadyImportedImages.map( ( img ) => img.download_url )
		);
		const imagesToImport = allImagesInAlbum.filter(
			( img ) => ! importedUrls.has( img.download_url )
		);

		if ( imagesToImport.length === 0 ) {
			setAttributes( { importCompleted: true } );
			createGalleryBlock( alreadyImportedImages );
			return;
		}

		setImporting( true );
		setImportProgress( 0 );

		const newImportedImages = [ ...alreadyImportedImages ];
		const totalImages = imagesToImport.length;

		try {
			for ( let i = 0; i < imagesToImport.length; i++ ) {
				const image = imagesToImport[ i ];

				try {
					const result = await importSingleImage(
						image.download_url,
						albumId
					);

					if ( result.success ) {
						newImportedImages.push( {
							attachment_id: result.attachment_id,
							attachment_url: result.attachment_url,
							album_img_url: result.album_img_url,
						} );

						setAttributes( { importedImages: newImportedImages } );
						setImportProgress( ( ( i + 1 ) / totalImages ) * 100 );
					}
				} catch ( imageError ) {
					// eslint-disable-next-line no-console
					console.error(
						`Failed to import image ${ image.url }:`,
						imageError
					);
					// Continue with the next image even if one fails
				}
			}

			// Import completed
			setAttributes( { importCompleted: true } );
			createGalleryBlock( newImportedImages );

			createNotice(
				'success',
				sprintf(
					// translators: %d: number of imported images
					_n(
						'Successfully imported %d image from Google Photos album.',
						'Successfully imported %d images from Google Photos album.',
						newImportedImages.length,
						'album-importer-for-google-photos'
					),
					newImportedImages.length
				),
				{
					type: 'snackbar',
					isDismissible: true,
				}
			);
		} catch ( apiFetchError ) {
			setError( apiFetchError.message );

			createNotice(
				'error',
				__(
					'Failed to import images from Google Photos album.',
					'album-importer-for-google-photos'
				),
				{
					type: 'snackbar',
					isDismissible: true,
				}
			);
		} finally {
			setImporting( false );
			setImportProgress( 0 );
		}
	};

	const verifyAlbum = () => {
		setLoading( true );
		setError( null );

		apiFetch( {
			path: addQueryArgs( '/aigp/v1/album/verify', {
				url: albumUrl,
			} ),
		} )
			.then( ( response ) => {
				// eslint-disable-next-line no-console
				console.log( response );

				if ( response.valid ) {
					setAttributes( {
						allImages: response.images,
						importedImages: response.imported,
						albumId: response.album_id,
					} );

					// Check if all images are already imported
					if ( response.imported.length === response.images.length ) {
						setAttributes( { importCompleted: true } );
						createGalleryBlock( response.imported );
					} else {
						// Start importing the remaining images
						importImages(
							response.images,
							response.imported,
							response.album_id
						);
					}
				} else {
					setError(
						__(
							'Invalid album URL or the album is not publicly accessible.',
							'album-importer-for-google-photos'
						)
					);
				}
			} )
			.catch( ( apiFetchError ) => {
				setError( apiFetchError.message );
			} )
			.finally( () => {
				setLoading( false );
			} );
	};

	/**
	 * Create a gallery block with the imported images
	 * @param {Array} images - The imported images
	 */
	const createGalleryBlock = ( images ) => {
		const galleryBlock = createBlock(
			'core/gallery',
			{
				ids: images.map( ( img ) => img.attachment_id ),
			},
			images.map( ( img ) =>
				createBlock( 'core/image', {
					id: img.attachment_id,
					url: img.attachment_url,
				} )
			)
		);

		replaceInnerBlocks( clientId, [ galleryBlock ], true );
	};

	useEffect( () => {
		if ( importCompleted ) {
			createGalleryBlock( importedImages );
		}
	}, [ importCompleted, createGalleryBlock, importedImages ] );

	return (
		<div { ...blockProps }>
			{ importCompleted && (
				<>
					<BlockControls group="other">
						<ToolbarButton
							icon="update"
							label={ __(
								'Re-sync',
								'album-importer-for-google-photos'
							) }
							onClick={ verifyAlbum }
							disabled={ loading || importing }
						/>
					</BlockControls>
					<AlbumInspectorControls albumUrl={ albumUrl } />
				</>
			) }

			{ ! importCompleted && (
				<Placeholder
					icon="format-gallery"
					label={ __(
						'Import Google Photos Album',
						'album-importer-for-google-photos'
					) }
					instructions={ __(
						'Paste a public album URL to begin importing images. This is the URL you get through Share > Copy link.',
						'album-importer-for-google-photos'
					) }
				>
					<Flex direction="column" gap={ 3 }>
						<FlexItem>
							<TextControl
								label={ __(
									'Google Photos Album URL',
									'album-importer-for-google-photos'
								) }
								value={ albumUrl }
								onChange={ ( value ) =>
									setAttributes( { albumUrl: value } )
								}
								placeholder={ __(
									'https://photos.app.goo.gl/…',
									'album-importer-for-google-photos'
								) }
								help={ createInterpolateElement(
									__(
										'See <link>Google Photos Help</link> for how to get your public link.',
										'album-importer-for-google-photos'
									),
									{
										link: (
											<ExternalLink href="https://support.google.com/photos/answer/6131416" />
										),
									}
								) }
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							/>
						</FlexItem>
						<FlexItem>
							<Button
								variant="primary"
								onClick={ verifyAlbum }
								isBusy={ loading || importing }
								disabled={ loading || importing }
							>
								{ loading &&
									__(
										'Verifying Album…',
										'album-importer-for-google-photos'
									) }
								{ importing &&
									__(
										'Importing Images…',
										'album-importer-for-google-photos'
									) }
								{ ! loading &&
									! importing &&
									__(
										'Start Import',
										'album-importer-for-google-photos'
									) }
							</Button>
						</FlexItem>

						{ importing && allImages && allImages.length > 0 && (
							<FlexItem>
								<div className="import-progress">
									<div className="import-progress-bar">
										<ProgressBar value={ importProgress } />
									</div>
									<div className="import-progress-text">
										{ sprintf(
											// translators: %1$d: number of images processed, %2$d: total number of images
											__(
												'Processing %1$d out of %2$d images…',
												'album-importer-for-google-photos'
											),
											Math.ceil(
												( importProgress / 100 ) *
													allImages.length
											),
											allImages.length
										) }
									</div>
								</div>
							</FlexItem>
						) }
					</Flex>
					{ error && (
						<Notice
							status="error"
							onRemove={ () => setError( null ) }
						>
							{ error }
						</Notice>
					) }
				</Placeholder>
			) }

			{ importCompleted && (
				<InnerBlocks
					renderAppender={ false }
					templateLock={ 'insert' }
				/>
			) }
		</div>
	);
}
