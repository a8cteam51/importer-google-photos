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
	const shouldShowAlbumUrl = hasImportedImages;

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Album Details', 'importer-google-photos' ) }
				initialOpen={ true }
			>
				<PanelRow>
					<BaseControl
						label={ __( 'Album URL', 'importer-google-photos' ) }
						id="album-url"
						help={
							shouldShowAlbumUrl && albumUrl ? (
								<ExternalLink
									className="album-url"
									href={ albumUrl }
								>
									{ albumUrl }
								</ExternalLink>
							) : (
								__(
									'No album URL set',
									'importer-google-photos'
								)
							)
						}
					/>
				</PanelRow>

				{ hasImportedImages && (
					<PanelRow>
						<BaseControl
							label={ __(
								'Import Status',
								'importer-google-photos'
							) }
							id="import-status"
						>
							<span>
								{ isImportInProgress
									? sprintf(
											/* translators: 1: number of imported images, 2: total number of images */
											_n(
												'Importing: %1$d out of %2$d image',
												'Importing: %1$d out of %2$d images',
												allImages.length,
												'importer-google-photos'
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
												'importer-google-photos'
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
