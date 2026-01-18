'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// BOX COMPONENT
// =============================================================================
// Generic container component that replaces all <div> with className
// Box accepts props for padding, margin, background, border, rounded, shadow
// This is the only place where low-level styling props are allowed
//
// Usage:
// ❌ <div className="p-4 bg-muted rounded-lg">
// ✅ <Box p="md" bg="muted" rounded="lg">

// =============================================================================
// TYPES
// =============================================================================

type SpacingSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type DisplayType = 'block' | 'flex' | 'inline' | 'inline-flex' | 'inline-block' | 'grid' | 'hidden';
type PositionType = 'relative' | 'absolute' | 'fixed' | 'sticky';
type OverflowType = 'hidden' | 'auto' | 'scroll' | 'visible';
type BackgroundColor = 'transparent' | 'muted' | 'card' | 'background' | 'primary' | 'secondary' | 'destructive' | 'accent';
type BorderStyle = 'none' | 'default' | 'muted' | 'strong' | 'dashed';
type RoundedSize = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
type ShadowSize = 'none' | 'sm' | 'md' | 'lg' | 'xl';
type ElementType = 'div' | 'section' | 'article' | 'aside' | 'main' | 'nav' | 'header' | 'footer' | 'span';

// =============================================================================
// STYLE MAPPINGS
// =============================================================================

const spacingClasses: Record<SpacingSize, string> = {
	none: '0',
	xs: '1',
	sm: '2',
	md: '4',
	lg: '6',
	xl: '8',
	'2xl': '12',
};

const displayClasses: Record<DisplayType, string> = {
	block: 'block',
	flex: 'flex',
	inline: 'inline',
	'inline-flex': 'inline-flex',
	'inline-block': 'inline-block',
	grid: 'grid',
	hidden: 'hidden',
};

const positionClasses: Record<PositionType, string> = {
	relative: 'relative',
	absolute: 'absolute',
	fixed: 'fixed',
	sticky: 'sticky',
};

const overflowClasses: Record<OverflowType, string> = {
	hidden: 'overflow-hidden',
	auto: 'overflow-auto',
	scroll: 'overflow-scroll',
	visible: 'overflow-visible',
};

const bgClasses: Record<BackgroundColor, string> = {
	transparent: 'bg-transparent',
	muted: 'bg-muted',
	card: 'bg-card',
	background: 'bg-background',
	primary: 'bg-primary',
	secondary: 'bg-secondary',
	destructive: 'bg-destructive',
	accent: 'bg-accent',
};

const borderClasses: Record<BorderStyle, string> = {
	none: 'border-0',
	default: 'border border-border',
	muted: 'border border-border/50',
	strong: 'border-2 border-border',
	dashed: 'border border-dashed border-border',
};

const roundedClasses: Record<RoundedSize, string> = {
	none: 'rounded-none',
	sm: 'rounded-sm',
	md: 'rounded-md',
	lg: 'rounded-lg',
	xl: 'rounded-xl',
	'2xl': 'rounded-2xl',
	full: 'rounded-full',
};

const shadowClasses: Record<ShadowSize, string> = {
	none: 'shadow-none',
	sm: 'shadow-sm',
	md: 'shadow-md',
	lg: 'shadow-lg',
	xl: 'shadow-xl',
};

// =============================================================================
// BOX PROPS
// =============================================================================

interface BoxProps extends Omit<React.HTMLAttributes<HTMLElement>, 'color'> {
	/** Render as different HTML element */
	as?: ElementType;

	// Display & Position
	/** Display type */
	display?: DisplayType;
	/** Position type */
	position?: PositionType;
	/** Overflow behavior */
	overflow?: OverflowType;
	/** Overflow-x behavior */
	overflowX?: OverflowType;
	/** Overflow-y behavior */
	overflowY?: OverflowType;

	// Padding (all sides)
	/** Padding all sides */
	p?: SpacingSize;
	/** Padding horizontal (left/right) */
	px?: SpacingSize;
	/** Padding vertical (top/bottom) */
	py?: SpacingSize;
	/** Padding top */
	pt?: SpacingSize;
	/** Padding right */
	pr?: SpacingSize;
	/** Padding bottom */
	pb?: SpacingSize;
	/** Padding left */
	pl?: SpacingSize;

	// Margin (all sides)
	/** Margin all sides */
	m?: SpacingSize;
	/** Margin horizontal (left/right) */
	mx?: SpacingSize;
	/** Margin vertical (top/bottom) */
	my?: SpacingSize;
	/** Margin top */
	mt?: SpacingSize;
	/** Margin right */
	mr?: SpacingSize;
	/** Margin bottom */
	mb?: SpacingSize;
	/** Margin left */
	ml?: SpacingSize;

	// Visual
	/** Background color */
	bg?: BackgroundColor;
	/** Border style */
	border?: BorderStyle;
	/** Border radius */
	rounded?: RoundedSize;
	/** Box shadow */
	shadow?: ShadowSize;

	// Sizing
	/** Full width (w-full) */
	fullWidth?: boolean;
	/** Full height (h-full) */
	fullHeight?: boolean;
	/** Minimum width 0 */
	minW0?: boolean;
	/** Minimum height 0 */
	minH0?: boolean;
	/** Flex grow */
	grow?: boolean;
	/** Flex shrink disabled */
	shrink?: boolean;

	// Animation
	/** Transition all properties */
	transition?: boolean;
	/** Cursor pointer */
	cursor?: 'pointer' | 'default' | 'not-allowed' | 'grab' | 'grabbing';

	// Z-Index
	/** Z-index level */
	zIndex?: 0 | 10 | 20 | 30 | 40 | 50;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getSpacingClass(prefix: string, value: SpacingSize | undefined): string | undefined {
	if (!value) return undefined;
	return `${prefix}-${spacingClasses[value]}`;
}

function getOverflowClass(axis: '' | 'x' | 'y', value: OverflowType | undefined): string | undefined {
	if (!value) return undefined;
	const prefix = axis ? `overflow-${axis}` : 'overflow';
	return `${prefix}-${value === 'hidden' ? 'hidden' : value === 'auto' ? 'auto' : value === 'scroll' ? 'scroll' : 'visible'}`;
}

// =============================================================================
// BOX COMPONENT
// =============================================================================

const Box = forwardRef<HTMLElement, BoxProps>(
	(
		{
			as: Component = 'div',
			className,
			display,
			position,
			overflow,
			overflowX,
			overflowY,
			p,
			px,
			py,
			pt,
			pr,
			pb,
			pl,
			m,
			mx,
			my,
			mt,
			mr,
			mb,
			ml,
			bg,
			border,
			rounded,
			shadow,
			fullWidth,
			fullHeight,
			minW0,
			minH0,
			grow,
			shrink,
			transition,
			cursor,
			zIndex,
			children,
			...props
		},
		ref
	) => {
		return (
			<Component
				ref={ref as React.Ref<HTMLDivElement>}
				className={cn(
					// Display & Position
					display && displayClasses[display],
					position && positionClasses[position],
					overflow && overflowClasses[overflow],
					overflowX && getOverflowClass('x', overflowX),
					overflowY && getOverflowClass('y', overflowY),

					// Padding
					getSpacingClass('p', p),
					getSpacingClass('px', px),
					getSpacingClass('py', py),
					getSpacingClass('pt', pt),
					getSpacingClass('pr', pr),
					getSpacingClass('pb', pb),
					getSpacingClass('pl', pl),

					// Margin
					getSpacingClass('m', m),
					getSpacingClass('mx', mx),
					getSpacingClass('my', my),
					getSpacingClass('mt', mt),
					getSpacingClass('mr', mr),
					getSpacingClass('mb', mb),
					getSpacingClass('ml', ml),

					// Visual
					bg && bgClasses[bg],
					border && borderClasses[border],
					rounded && roundedClasses[rounded],
					shadow && shadowClasses[shadow],

					// Sizing
					fullWidth && 'w-full',
					fullHeight && 'h-full',
					minW0 && 'min-w-0',
					minH0 && 'min-h-0',
					grow && 'flex-1',
					shrink === false && 'flex-shrink-0',

					// Animation & Cursor
					transition && 'transition-all',
					cursor === 'pointer' && 'cursor-pointer',
					cursor === 'not-allowed' && 'cursor-not-allowed',
					cursor === 'grab' && 'cursor-grab',
					cursor === 'grabbing' && 'cursor-grabbing',

					// Z-Index
					zIndex !== undefined && `z-${zIndex}`,

					className
				)}
				{...props}
			>
				{children}
			</Component>
		);
	}
);
Box.displayName = 'Box';

// =============================================================================
// EXPORTS
// =============================================================================

export { Box };
export type {
	BoxProps,
	SpacingSize,
	DisplayType,
	PositionType,
	OverflowType,
	BackgroundColor,
	BorderStyle,
	RoundedSize,
	ShadowSize,
	ElementType,
};
