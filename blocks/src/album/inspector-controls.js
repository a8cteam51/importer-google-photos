import {
	PanelBody,
	PanelRow,
	BaseControl,
	ExternalLink,
} from '@wordpress/components';
import { InspectorControls } from '@wordpress/block-editor';
import { __, _n, sprintf } from '@wordpress/i18n';

export default function AlbumInspectorControls( {
	albumUrl,
	allImages,
	imported,
} ) {
	const hasImportedImages = imported.length > 0;
	const isImportInProgress = allImages.length > 0;
	const shouldShowAlbumUrl = hasImportedImages || albumUrl;

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Album Details', 'google-photos-album' ) }
				initialOpen={ true }
			>
				<PanelRow>
					<BaseControl
						label={ __( 'Album URL', 'google-photos-album' ) }
						help={
							shouldShowAlbumUrl && albumUrl ? (
								<ExternalLink href={ albumUrl }>
									{ albumUrl }
								</ExternalLink>
							) : (
								__( 'No album URL set', 'google-photos-album' )
							)
						}
					/>
				</PanelRow>

				{ hasImportedImages && (
					<PanelRow>
						<BaseControl
							label={ __(
								'Import Status',
								'google-photos-album'
							) }
						>
							<span>
								{ isImportInProgress
									? sprintf(
											/* translators: 1: number of imported images, 2: total number of images */
											_n(
												'Importing: %1$d out of %2$d image',
												'Importing: %1$d out of %2$d images',
												allImages.length,
												'google-photos-album'
											),
											imported.length,
											allImages.length
									  )
									: sprintf(
											/* translators: %d: number of imported images */
											_n(
												'Completed: %d image imported',
												'Completed: %d images imported',
												imported.length,
												'google-photos-album'
											),
											imported.length
									  ) }
							</span>
						</BaseControl>
					</PanelRow>
				) }
			</PanelBody>
		</InspectorControls>
	);
}
