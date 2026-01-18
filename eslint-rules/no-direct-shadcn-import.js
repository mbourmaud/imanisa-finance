/**
 * ESLint rule: no-direct-shadcn-import
 *
 * Prevents importing from @/components/ui/* outside of src/components/
 * This ensures all shadcn components are wrapped in our own component library.
 */

module.exports = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow direct imports from @/components/ui outside of src/components/',
			category: 'Best Practices',
			recommended: true,
		},
		messages: {
			noDirectShadcnImport:
				'Direct import from "@/components/ui/{{ component }}" is not allowed outside of src/components/. ' +
				'Create or use a wrapper component in src/components/ui-kit/ instead.',
		},
		schema: [],
	},

	create(context) {
		const filename = context.getFilename();

		// Allow imports within src/components/ directory
		if (filename.includes('/src/components/')) {
			return {};
		}

		return {
			ImportDeclaration(node) {
				const importPath = node.source.value;

				// Check if importing from @/components/ui/*
				if (
					typeof importPath === 'string' &&
					(importPath.startsWith('@/components/ui/') ||
					 importPath.match(/^\.\.?\/.*components\/ui\//))
				) {
					const component = importPath.split('/').pop();
					context.report({
						node,
						messageId: 'noDirectShadcnImport',
						data: { component },
					});
				}
			},
		};
	},
};
