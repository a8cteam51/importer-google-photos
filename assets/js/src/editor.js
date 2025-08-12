/* global wp */

import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { Fragment, useState, useMemo } from '@wordpress/element';
import {
	Modal,
	Button,
	TextControl,
	Spinner,
	CheckboxControl,
	Flex,
	FlexItem,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { createBlock } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';

const GooglePhotosAlbumModal = ( { isOpen, onClose, onInsert } ) => {
	const [ albumUrl, setAlbumUrl ] = useState( '' );
	const [ loading, setLoading ] = useState( false );
	const [ error, setError ] = useState( '' );
	const [ images, setImages ] = useState( [] );
	const [ selected, setSelected ] = useState( {} );

	const hasSelection = useMemo( () => {
		return Object.values( selected ).some( Boolean );
	}, [ selected ] );

	const toggleSelect = ( url ) => {
		setSelected( ( prev ) => ( {
			...prev,
			[ url ]: ! prev[ url ],
		} ) );
	};

	const verify = () => {
		setError( '' );
		setLoading( true );
		apiFetch( {
			path: `/google-photos-album/v1/album/verify?url=${ encodeURIComponent( albumUrl ) }`,
		} )
			.then( ( response ) => {
				if ( response?.valid && response?.images?.length ) {
					setImages( response.images );
					setSelected( {} );
				} else {
					setImages( [] );
					setError( __( 'No valid images found in this album.', 'google-photos-album' ) );
				}
			} )
			.catch( ( err ) => {
				setError( err?.message || __( 'Unknown error', 'google-photos-album' ) );
			} )
			.finally( () => setLoading( false ) );
	};

	const insert = () => {
		const urls = images.filter( ( u ) => selected[ u ] );
		if ( ! urls.length ) {
			return;
		}
		onInsert( { albumUrl, urls } );
	};

	if ( ! isOpen ) {
		return null;
	}

	return (
		<Modal
			title={ __( 'Select images from Google Photos album', 'google-photos-album' ) }
			onRequestClose={ onClose }
			size="large"
		>
			<Flex direction="column" gap={ 4 }>
				<FlexItem>
					<TextControl
						label={ __( 'Album URL', 'google-photos-album' ) }
						value={ albumUrl }
						onChange={ setAlbumUrl }
						placeholder={ 'https://photos.app.goo.gl/…' }
					/>
				</FlexItem>
				<FlexItem>
					<Button
						variant="secondary"
						onClick={ verify }
						disabled={ ! albumUrl || loading }
					>
						{ loading ? <Spinner /> : __( 'Load album', 'google-photos-album' ) }
					</Button>
				</FlexItem>
				{ error && (
					<FlexItem>
						<p style={ { color: 'var(--wp-components-color-foreground, #cc1818)' } }>
							{ error }
						</p>
					</FlexItem>
				) }
				{ images.length > 0 && (
					<Flex direction="column" gap={ 2 }>
						<FlexItem>
							<div
								style={ {
									display: 'grid',
									gap: 12,
									gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
								} }
							>
								{ images.map( ( url ) => (
									<div key={ url }>
										<label style={ { cursor: 'pointer' } }>
											<img
												src={ url }
												alt=""
												style={ {
													width: '100%',
													height: 100,
													objectFit: 'cover',
													borderRadius: 4,
													border: selected[ url ] ? '3px solid var(--wp-admin-theme-color)' : '1px solid rgba(0,0,0,.1)',
												} }
											/>
											<CheckboxControl
												__nextHasNoMarginBottom
												checked={ !! selected[ url ] }
												onChange={ () => toggleSelect( url ) }
												label={ __( 'Select', 'google-photos-album' ) }
											/>
										</label>
									</div>
								) ) }
							</div>
						</FlexItem>
						<FlexItem>
							<Button
								variant="primary"
								onClick={ insert }
								disabled={ ! hasSelection }
							>
								{ __( 'Insert selected images', 'google-photos-album' ) }
							</Button>
						</FlexItem>
					</Flex>
				) }
			</Flex>
		</Modal>
	);
};

const withGpaGallerySelect = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		if ( props.name !== 'core/gallery' ) {
			return <BlockEdit { ...props } />;
		}

		const [ isOpen, setIsOpen ] = useState( false );
		const postId = useSelect( ( select ) => select( 'core/editor' ).getCurrentPostId(), [] );

		const open = () => setIsOpen( true );
		const close = () => setIsOpen( false );

		const insertFromUrls = async ( { albumUrl, urls } ) => {
			const imported = [];
			for ( const url of urls ) {
				try {
					// Import into Media Library
					// eslint-disable-next-line no-await-in-loop
					const result = await apiFetch( {
						path: '/google-photos-album/v1/album/import',
						method: 'POST',
						data: {
							url,
							post_id: postId,
							album_url: albumUrl,
						},
					} );

					if ( result?.success && ! result?.queued ) {
						imported.push( { id: result.id, url: result.url } );
					}
				} catch ( e ) {
					// Skip failed import for MVP.
				}
			}

			if ( imported.length ) {
				const galleryBlock = createBlock(
					'core/gallery',
					{
						ids: imported.map( ( img ) => img.id ),
						images: imported.map( ( img ) => ( { id: img.id, url: img.url } ) ),
					},
					imported.map( ( img ) =>
						createBlock( 'core/image', { id: img.id, url: img.url, alt: '' } )
					)
				);
				wp.data
					.dispatch( 'core/block-editor' )
					.replaceBlocks( props.clientId, [ galleryBlock ] );
			}

			close();
		};

		const hasImages = Array.isArray( props.attributes?.images ) && props.attributes.images.length > 0;
		const hasIds = Array.isArray( props.attributes?.ids ) && props.attributes.ids.length > 0;

		return (
			<Fragment>
				<BlockEdit { ...props } />
				{ ! hasImages && ! hasIds && (
					<div style={ { marginTop: 8 } }>
						<Button variant="secondary" onClick={ open }>
							{ __( 'Select images from Google Photos album', 'google-photos-album' ) }
						</Button>
						<GooglePhotosAlbumModal
							isOpen={ isOpen }
							onClose={ close }
							onInsert={ insertFromUrls }
						/>
					</div>
				) }
			</Fragment>
		);
	};
}, 'withGpaGallerySelect' );

addFilter( 'editor.BlockEdit', 'google-photos-album/gallery-select', withGpaGallerySelect );
