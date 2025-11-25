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
import { __ } from '@wordpress/i18n';
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
			path: `/google-photos-album/v1/album/verify?url=${ encodeURIComponent(
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
							'importer-google-photos'
						)
					);
				}
			} )
			.catch( ( err ) => {
				setError(
					err?.message ||
						__( 'Unknown error', 'importer-google-photos' )
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
			className="gpa-modal"
			title={
				importing
					? __( 'Inserting media', 'importer-google-photos' )
					: __(
							'Select images from Google Photos album',
							'importer-google-photos'
					  )
			}
			onRequestClose={ onClose }
		>
			<div className="gpa-modal__body">
				<div className="gpa-modal__header">
					<p className="gpa-modal__instructions">
						{ __(
							'Paste a public album URL to begin importing images. This is the URL you get through Share > Copy link.',
							'importer-google-photos'
						) }
					</p>
					<TextControl
						label={ __( 'Album URL', 'importer-google-photos' ) }
						value={ albumUrl }
						onChange={ setAlbumUrl }
						placeholder="https://photos.app.goo.gl/…"
						help={ createInterpolateElement(
							__(
								'See <link>Google Photos Help</link> for how to get your public link.',
								'importer-google-photos'
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
						{ __( 'Load album', 'importer-google-photos' ) }
					</Button>
					{ error && <p className="gpa-modal__error">{ error }</p> }
				</div>
				<div
					className={ `gpa-modal__content${
						importing ? ' is-busy' : ''
					}` }
				>
					{ images.length > 0 && (
						<Composite
							role="listbox"
							className="gpa-modal__grid"
							aria-label={ __(
								'Media list',
								'importer-google-photos'
							) }
							render={ <ul /> }
							aria-multiselectable={ true }
						>
							{ images.map( ( img ) => {
								const previewUrl = img?.url;
								const checked = !! selected[ previewUrl ];

								return (
									<Composite.Item
										key={ previewUrl }
										className="gpa-modal__item"
										aria-selected={ checked }
										aria-label={ __(
											'Select image',
											'importer-google-photos'
										) }
										render={ <li role="option" /> }
										onClick={ () =>
											toggleSelect( previewUrl )
										}
									>
										<button
											type="button"
											className={ `gpa-modal__item-button${
												checked ? ' is-selected' : ''
											}` }
										>
											<span className="gpa-modal__checkbox-badge">
												✓
											</span>
											{ checked && (
												<span className="gpa-modal__selection-overlay" />
											) }
										</button>
										<img
											src={ previewUrl }
											alt=""
											className="gpa-modal__thumb"
										/>
									</Composite.Item>
								);
							} ) }
						</Composite>
					) }
					{ images.length > 0 && (
						<div className="gpa-modal__footer">
							<Button
								variant="primary"
								onClick={ insert }
								disabled={ ! hasSelection || importing }
								isBusy={ importing }
							>
								{ importing
									? __(
											'Inserting…',
											'importer-google-photos'
									  )
									: __(
											'Insert selected images',
											'importer-google-photos'
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
