/**
 * Registers a new block provided a unique name and an object defining its behavior.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
import { registerBlockType, createBlock } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import Edit from './edit';
import save from './save';
import metadata from './block.json';

/**
 * Every block starts by registering a new block type definition.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
registerBlockType( metadata.name, {
	/**
	 * @see ./edit.js
	 */
	edit: Edit,

	/**
	 * @see ./save.js
	 */
	save,

	/**
	 * Block transforms
	 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-transforms/
	 */
	transforms: {
		from: [
			{
				type: 'raw',
				// Match Google Photos album URLs when pasted
				isMatch: ( node ) =>
					node.nodeName === 'P' &&
					/^\s*(https?:\/\/photos\.app\.goo\.gl\/[a-z0-9]+)\s*$/i.test(
						node.textContent
					),
				transform: ( node ) => {
					return createBlock( metadata.name, {
						albumUrl: node.textContent.trim(),
					} );
				},
			},
		],
	},
} );
