import { addFilter } from '@wordpress/hooks';
import { Fragment, useState } from '@wordpress/element';
import { useBlockEditContext } from '@wordpress/block-editor';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';
import GooglePhotosAlbumModal from './components/GooglePhotosAlbumModal';

import './style.scss';

function ExtraGooglePhotosButton( { originalRender, mediaProps, button } ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const postId = useSelect(
		( select ) => select( 'core/editor' ).getCurrentPostId(),
		[]
	);

	const onInsert = async ( { albumId, urls } ) => {
		const imported = [];
		for ( const url of urls ) {
			try {
				// eslint-disable-next-line no-await-in-loop
				const result = await apiFetch( {
					path: '/aigp/v1/album/import',
					method: 'POST',
					data: {
						image_url: url,
						post_id: postId,
						album_id: albumId,
					},
				} );
				if ( result?.success ) {
					imported.push( {
						id: result.attachment_id,
						url: result.attachment_url,
					} );
				}
			} catch ( e ) {
				// eslint-disable-next-line no-console
				console.error( 'Import failed for', url, e );
			}
		}
		if ( imported.length ) {
			const mediaItems = imported.map( ( img ) => ( {
				id: img.id,
				url: img.url,
				type: 'image',
				alt: '',
				caption: '',
				sizes: {
					thumbnail: { url: img.attachment_url },
					large: { url: img.attachment_url },
				},
			} ) );
			if ( typeof mediaProps.onSelect === 'function' ) {
				const shouldPassArray = !! mediaProps.multiple;
				mediaProps.onSelect(
					shouldPassArray ? mediaItems : mediaItems[ 0 ]
				);
			}
			setIsOpen( false );
		}
	};

	const original = originalRender ? originalRender( button ) : null;

	return (
		<Fragment>
			{ original }
			<Button
				__next40pxDefaultSize={ true }
				variant="secondary"
				onClick={ () => setIsOpen( true ) }
			>
				{ __(
					'Import from Google Photos',
					'album-importer-for-google-photos'
				) }
			</Button>
			<GooglePhotosAlbumModal
				isOpen={ isOpen }
				onClose={ () => setIsOpen( false ) }
				onInsert={ onInsert }
			/>
		</Fragment>
	);
}

// Augment the MediaUpload render to append our button next to the default placeholder button(s).
addFilter(
	'editor.MediaUpload',
	'album-importer-for-google-photos/mediaupload-hook',
	( OriginalComponent ) => ( props ) => {
		const { name } = useBlockEditContext();
		const { render: originalRender } = props;
		const allowedTypes = props.allowedTypes || [];
		const gallery = !! props.gallery;
		const value = props.value || [];
		const isBrowse = props?.mode === 'browse';
		const isAllowedBlock = [
			'core/cover',
			'core/image',
			'core/gallery',
			'core/media-text',
		].includes( name );
		const shouldAugment =
			isBrowse &&
			isAllowedBlock &&
			allowedTypes.includes( 'image' ) &&
			! ( gallery && Array.isArray( value ) && value.length > 0 );
		if ( shouldAugment ) {
			const render = ( button ) => (
				<ExtraGooglePhotosButton
					originalRender={ originalRender }
					mediaProps={ props }
					button={ button }
				/>
			);
			return <OriginalComponent { ...props } render={ render } />;
		}
		return <OriginalComponent { ...props } />;
	},
	50
);
