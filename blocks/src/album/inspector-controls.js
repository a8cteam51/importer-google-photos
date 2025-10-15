import {
	PanelBody,
	PanelRow,
	BaseControl,
	ExternalLink,
} from '@wordpress/components';
import { InspectorControls } from '@wordpress/block-editor';
import { __, _n, sprintf } from '@wordpress/i18n';

export default function AlbumInspectorControls( { albumUrl } ) {
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
