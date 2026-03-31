import {
	PanelBody,
	PanelRow,
	BaseControl,
	ExternalLink,
} from '@wordpress/components';
import { InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

export default function AlbumInspectorControls( { albumUrl } ) {
	return (
		<InspectorControls>
			<PanelBody
				title={ __(
					'Album Details',
					'album-importer-for-google-photos'
				) }
				initialOpen={ true }
			>
				<PanelRow>
					<BaseControl
						label={ __(
							'Album URL',
							'album-importer-for-google-photos'
						) }
						id="album-url"
						help={
							<ExternalLink
								className="album-url"
								href={ albumUrl }
							>
								{ albumUrl }
							</ExternalLink>
						}
					/>
				</PanelRow>
			</PanelBody>
		</InspectorControls>
	);
}
