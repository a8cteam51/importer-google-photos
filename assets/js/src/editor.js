import { addFilter } from '@wordpress/hooks';
import { Fragment, useState } from '@wordpress/element';
import { useBlockEditContext } from '@wordpress/block-editor';
import { Button } from '@wordpress/components';
import GooglePhotosIcon from './components/GooglePhotosIcon';
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

	const onInsert = async ( { albumUrl, urls } ) => {
		const imported = [];
		for ( const url of urls ) {
			try {
				// eslint-disable-next-line no-await-in-loop
				const result = await apiFetch( {
					path: '/google-photos-album/v1/album/import',
					method: 'POST',
					data: {
						image_url: url,
						post_id: postId,
						album_url: albumUrl,
					},
				} );
				if ( result?.success && ! result?.queued ) {
					imported.push( { id: result.id, url: result.url } );
				}
			} catch ( e ) {}
		}
		if ( imported.length ) {
			const mediaItems = imported.map( ( img ) => ( {
				id: img.id,
				url: img.url,
				type: 'image',
				alt: '',
				caption: '',
				sizes: {
					thumbnail: { url: img.url },
					large: { url: img.url },
				},
			} ) );
			if ( typeof mediaProps.onSelect === 'function' ) {
				const shouldPassArray = !! mediaProps.multiple;
				mediaProps.onSelect(
					shouldPassArray ? mediaItems : mediaItems[ 0 ]
				);
			}
		}
		setIsOpen( false );
	};

	const original = originalRender ? originalRender( button ) : null;

	return (
		<Fragment>
			{ original }
			<Button
				__next40pxDefaultSize={ true }
				variant="secondary"
				icon={
					<GooglePhotosIcon
						className="components-menu-items__item-icon"
						size={ 20 }
					/>
				}
				onClick={ () => setIsOpen( true ) }
			>
				{ __( 'Google Photos Album', 'google-photos-album' ) }
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
	'google-photos-album/mediaupload-hook',
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
