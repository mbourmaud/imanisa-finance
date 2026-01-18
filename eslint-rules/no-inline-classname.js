/**
 * ESLint rule: no-inline-classname
 *
 * Prevents using className prop in pages and features.
 * Styling should be done through component props, not inline Tailwind classes.
 */

module.exports = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow className prop outside of src/components/',
			category: 'Best Practices',
			recommended: true,
		},
		messages: {
			noInlineClassName:
				'Using "className" is not allowed in pages/features. ' +
				'Use component props (size, variant, gap, etc.) instead of inline Tailwind classes. ' +
				'If you need custom styling, create or extend a component in src/components/.',
		},
		schema: [],
	},

	create(context) {
		const filename = context.getFilename();

		// Allow className in src/components/ directory (where we define our UI kit)
		if (filename.includes('/src/components/')) {
			return {};
		}

		// Allow className in test files
		if (filename.includes('.test.') || filename.includes('.spec.') || filename.includes('__tests__')) {
			return {};
		}

		return {
			JSXAttribute(node) {
				if (node.name && node.name.name === 'className') {
					context.report({
						node,
						messageId: 'noInlineClassName',
					});
				}
			},
		};
	},
};
