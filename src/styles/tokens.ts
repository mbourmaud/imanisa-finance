/**
 * 🎨 IMANISA DESIGN SYSTEM - Design Tokens
 *
 * This file defines the core design tokens used throughout the application.
 * These tokens ensure consistency across all components and pages.
 *
 * Usage:
 * - Import these values when you need to reference them in TypeScript/React
 * - The corresponding CSS custom properties are defined in globals.css
 * - Tailwind classes use these tokens via @theme configuration
 *
 * Token Categories:
 * 1. Spacing - Consistent spacing scale for margins, paddings, gaps
 * 2. Container - Max-width constraints for different breakpoints
 * 3. Border Radius - Rounded corner scale
 * 4. Layout - Page gutters, section gaps, card paddings
 */

// =============================================================================
// SPACING SCALE
// =============================================================================
// Based on 4px base unit, following a geometric progression
// Use these for margins, paddings, and gaps

export const spacing = {
	xs: '0.25rem',    // 4px
	sm: '0.5rem',     // 8px
	md: '1rem',       // 16px
	lg: '1.5rem',     // 24px
	xl: '2rem',       // 32px
	'2xl': '3rem',    // 48px
	'3xl': '4rem',    // 64px
} as const

// Numeric values (in pixels) for calculations
export const spacingPx = {
	xs: 4,
	sm: 8,
	md: 16,
	lg: 24,
	xl: 32,
	'2xl': 48,
	'3xl': 64,
} as const

// =============================================================================
// CONTAINER MAX-WIDTHS
// =============================================================================
// Standard container widths for responsive layouts

export const containerMaxWidth = {
	sm: '640px',
	md: '768px',
	lg: '1024px',
	xl: '1280px',
	'2xl': '1536px',
} as const

// =============================================================================
// BORDER RADIUS SCALE
// =============================================================================
// Consistent rounded corners across the design system

export const borderRadius = {
	none: '0',
	sm: '0.25rem',    // 4px
	md: '0.5rem',     // 8px
	lg: '0.75rem',    // 12px
	xl: '1rem',       // 16px
	'2xl': '1.5rem',  // 24px
	full: '9999px',
} as const

// =============================================================================
// LAYOUT TOKENS
// =============================================================================
// Standard layout measurements for pages and sections

export const layout = {
	// Page gutter (horizontal padding)
	pageGutter: {
		mobile: '1rem',    // 16px
		desktop: '1.5rem', // 24px
	},
	// Vertical spacing between sections
	sectionGap: '2rem',    // 32px
	// Card internal padding
	cardPadding: {
		sm: '1rem',        // 16px
		md: '1.5rem',      // 24px
	},
} as const

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type SpacingKey = keyof typeof spacing
export type ContainerKey = keyof typeof containerMaxWidth
export type RadiusKey = keyof typeof borderRadius
