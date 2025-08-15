import { useMemo, useState } from '@wordpress/element';
import { Modal, Button, TextControl, Composite } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

const GooglePhotosAlbumModal = ( { isOpen, onClose, onInsert } ) => {
	const [ albumUrl, setAlbumUrl ] = useState( '' );
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
					setSelected( {} );
				} else {
					setImages( [] );
					setError(
						__(
							'No valid images found in this album.',
							'google-photos-album'
						)
					);
				}
			} )
			.catch( ( err ) =>
				setError(
					err?.message || __( 'Unknown error', 'google-photos-album' )
				)
			)
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
			await onInsert( { albumUrl, urls } );
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
					? __( 'Inserting media', 'google-photos-album' )
					: __(
							'Select images from Google Photos album',
							'google-photos-album'
					  )
			}
			onRequestClose={ onClose }
		>
			<div className="gpa-modal__body">
				<div className="gpa-modal__header">
					<TextControl
						label={ __( 'Album URL', 'google-photos-album' ) }
						value={ albumUrl }
						onChange={ setAlbumUrl }
						placeholder="https://photos.app.goo.gl/…"
					/>
					<Button
						variant="secondary"
						onClick={ verify }
						disabled={ ! albumUrl || loading }
						isBusy={ loading }
					>
						{ __( 'Load album', 'google-photos-album' ) }
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
								'google-photos-album'
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
											'google-photos-album'
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
									? __( 'Inserting…', 'google-photos-album' )
									: __(
											'Insert selected images',
											'google-photos-album'
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
