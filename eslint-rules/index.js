/**
 * Custom ESLint rules for Imanisa Finance
 *
 * These rules enforce our UI architecture:
 * 1. No direct shadcn imports outside components/ - use wrapped components
 * 2. No inline className in pages/features - use component props
 */

const noDirectShadcnImport = require('./no-direct-shadcn-import');
const noInlineClassName = require('./no-inline-classname');

module.exports = {
	rules: {
		'no-direct-shadcn-import': noDirectShadcnImport,
		'no-inline-classname': noInlineClassName,
	},
};
