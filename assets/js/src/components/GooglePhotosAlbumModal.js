import {
	useMemo,
	useState,
	createInterpolateElement,
} from '@wordpress/element';
import {
	Modal,
	Button,
	TextControl,
	Composite,
	ExternalLink,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

const GooglePhotosAlbumModal = ( { isOpen, onClose, onInsert } ) => {
	const [ albumUrl, setAlbumUrl ] = useState( '' );
	const [ albumId, setAlbumId ] = useState( '' );
	const [ loading, setLoading ] = useState( false );
	const [ error, setError ] = useState( '' );
	const [ images, setImages ] = useState( [] );
	const [ selected, setSelected ] = useState( {} );
	const [ importing, setImporting ] = useState( false );

	const hasSelection = useMemo(
		() => Object.values( selected ).some( Boolean ),
		[ selected ]
	);
	const toggleSelect = ( url ) =>
		setSelected( ( prev ) => ( { ...prev, [ url ]: ! prev[ url ] } ) );

	const verify = () => {
		setError( '' );
		setLoading( true );
		apiFetch( {
			path: `/aigp/v1/album/verify?url=${ encodeURIComponent(
				albumUrl
			) }`,
		} )
			.then( ( response ) => {
				if (
					response?.valid &&
					Array.isArray( response.images ) &&
					response.images.length
				) {
					setImages( response.images );
					setAlbumId( response.album_id );
					setSelected( {} );
				} else {
					setImages( [] );
					setError(
						__(
							'No valid images found in this album.',
							'album-importer-for-google-photos'
						)
					);
				}
			} )
			.catch( ( err ) => {
				setError(
					err?.message ||
						__(
							'Unknown error',
							'album-importer-for-google-photos'
						)
				);
			} )
			.finally( () => setLoading( false ) );
	};

	const insert = async () => {
		const urls = images
			.filter( ( img ) => img && img.url && selected[ img.url ] )
			.map( ( img ) => img.download_url );

		if ( ! urls.length ) {
			return;
		}

		setImporting( true );
		try {
			await onInsert( { albumId, urls } );
		} finally {
			setImporting( false );
		}
	};

	if ( ! isOpen ) {
		return null;
	}

	return (
		<Modal
			isFullScreen={ true }
			className="aigp-modal"
			title={
				importing
					? __(
							'Inserting media',
							'album-importer-for-google-photos'
					  )
					: __(
							'Select images from Google Photos album',
							'album-importer-for-google-photos'
					  )
			}
			onRequestClose={ onClose }
		>
			<div className="aigp-modal__body">
				<div className="aigp-modal__header">
					<p className="aigp-modal__instructions">
						{ __(
							'Paste a public album URL to begin importing images. This is the URL you get through Share > Copy link.',
							'album-importer-for-google-photos'
						) }
					</p>
					<TextControl
						label={ __(
							'Album URL',
							'album-importer-for-google-photos'
						) }
						value={ albumUrl }
						onChange={ setAlbumUrl }
						placeholder="https://photos.app.goo.gl/…"
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
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
					<Button
						variant="secondary"
						onClick={ verify }
						disabled={ ! albumUrl || loading }
						isBusy={ loading }
					>
						{ __(
							'Load album',
							'album-importer-for-google-photos'
						) }
					</Button>
					{ error && <p className="aigp-modal__error">{ error }</p> }
				</div>
				<div
					className={ `aigp-modal__content${
						importing ? ' is-busy' : ''
					}` }
				>
					{ images.length > 0 && (
						<Composite
							role="listbox"
							className="aigp-modal__grid"
							aria-label={ __(
								'Media list',
								'album-importer-for-google-photos'
							) }
							render={ <ul /> }
							aria-multiselectable={ true }
						>
							{ images.map( ( img, index ) => {
								const previewUrl = img?.url;
								const checked = !! selected[ previewUrl ];

								return (
									<Composite.Item
										key={ previewUrl }
										className="aigp-modal__item"
										aria-selected={ checked }
										aria-label={ sprintf(
											/* translators: %d: image number in the album grid */
											__(
												'Image %d',
												'album-importer-for-google-photos'
											),
											index + 1
										) }
										render={ <li role="option" /> }
										onClick={ () =>
											toggleSelect( previewUrl )
										}
									>
										<button
											type="button"
											className={ `aigp-modal__item-button${
												checked ? ' is-selected' : ''
											}` }
										>
											<span className="aigp-modal__checkbox-badge">
												✓
											</span>
											{ checked && (
												<span className="aigp-modal__selection-overlay" />
											) }
										</button>
										<img
											src={ previewUrl }
											alt=""
											className="aigp-modal__thumb"
										/>
									</Composite.Item>
								);
							} ) }
						</Composite>
					) }
					{ images.length > 0 && (
						<div className="aigp-modal__footer">
							<Button
								variant="primary"
								onClick={ insert }
								disabled={ ! hasSelection || importing }
								isBusy={ importing }
							>
								{ importing
									? __(
											'Inserting…',
											'album-importer-for-google-photos'
									  )
									: __(
											'Insert selected images',
											'album-importer-for-google-photos'
									  ) }
							</Button>
						</div>
					) }
				</div>
			</div>
		</Modal>
	);
};

export default GooglePhotosAlbumModal;
