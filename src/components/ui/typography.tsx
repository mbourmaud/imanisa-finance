'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// SHARED TYPES
// =============================================================================

type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
type TextColor = 'default' | 'muted' | 'primary' | 'success' | 'danger' | 'warning' | 'inherit';
type FontWeight = 'normal' | 'medium' | 'semibold' | 'bold';
type TextAlign = 'left' | 'center' | 'right';
type TextTruncate = 'truncate' | 'line-clamp-1' | 'line-clamp-2' | 'line-clamp-3';

const sizeClasses: Record<TextSize, string> = {
	xs: 'text-xs',
	sm: 'text-sm',
	md: 'text-base',
	lg: 'text-lg',
	xl: 'text-xl',
	'2xl': 'text-2xl',
	'3xl': 'text-3xl',
	'4xl': 'text-4xl',
};

const colorClasses: Record<TextColor, string> = {
	default: 'text-foreground',
	muted: 'text-muted-foreground',
	primary: 'text-primary',
	success: 'text-[oklch(0.55_0.18_145)]',
	danger: 'text-destructive',
	warning: 'text-[oklch(0.65_0.15_85)]',
	inherit: '',
};

const weightClasses: Record<FontWeight, string> = {
	normal: 'font-normal',
	medium: 'font-medium',
	semibold: 'font-semibold',
	bold: 'font-bold',
};

const alignClasses: Record<TextAlign, string> = {
	left: 'text-left',
	center: 'text-center',
	right: 'text-right',
};

const truncateClasses: Record<TextTruncate, string> = {
	truncate: 'truncate',
	'line-clamp-1': 'line-clamp-1',
	'line-clamp-2': 'line-clamp-2',
	'line-clamp-3': 'line-clamp-3',
};

// =============================================================================
// HEADING COMPONENT
// =============================================================================
// Semantic heading component with level-based styling

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface HeadingProps extends Omit<React.HTMLAttributes<HTMLHeadingElement>, 'color'> {
	/** Semantic heading level (h1-h6) */
	level?: HeadingLevel;
	/** Visual size (overrides default level-based size) */
	size?: TextSize;
	/** Text color */
	color?: TextColor;
	/** Font weight (default: semibold) */
	weight?: FontWeight;
	/** Text alignment */
	align?: TextAlign;
	/** Truncation behavior */
	truncate?: TextTruncate;
}

const levelToTag: Record<HeadingLevel, 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'> = {
	1: 'h1',
	2: 'h2',
	3: 'h3',
	4: 'h4',
	5: 'h5',
	6: 'h6',
};

const levelDefaultSizeClasses: Record<HeadingLevel, string> = {
	1: 'text-3xl md:text-4xl',
	2: 'text-2xl md:text-3xl',
	3: 'text-xl md:text-2xl',
	4: 'text-lg md:text-xl',
	5: 'text-base md:text-lg',
	6: 'text-sm md:text-base',
};

const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
	(
		{
			className,
			level = 2,
			size,
			color = 'default',
			weight = 'semibold',
			align,
			truncate,
			children,
			...props
		},
		ref,
	) => {
		const Tag = levelToTag[level];
		const sizeClass = size ? sizeClasses[size] : levelDefaultSizeClasses[level];

		return (
			<Tag
				ref={ref}
				className={cn(
					'tracking-tight',
					sizeClass,
					colorClasses[color],
					weightClasses[weight],
					align && alignClasses[align],
					truncate && truncateClasses[truncate],
					className,
				)}
				{...props}
			>
				{children}
			</Tag>
		);
	},
);
Heading.displayName = 'Heading';

// =============================================================================
// TEXT COMPONENT
// =============================================================================
// Flexible text component with size, color, weight, and other styling props
// NOTE: variant is deprecated in favor of explicit size/color/weight props

type TextVariant = 'default' | 'muted' | 'lead' | 'small' | 'mono';
type ElementType = 'p' | 'span' | 'div' | 'label';

interface TextProps extends Omit<React.HTMLAttributes<HTMLElement>, 'color'> {
	/** @deprecated Use size, color, weight props instead. Text style variant */
	variant?: TextVariant;
	/** Text size (xs/sm/md/lg/xl/2xl/3xl/4xl) */
	size?: TextSize;
	/** Text color */
	color?: TextColor;
	/** Font weight */
	weight?: FontWeight;
	/** Text alignment */
	align?: TextAlign;
	/** Truncation behavior */
	truncate?: TextTruncate;
	/** Use monospace font */
	mono?: boolean;
	/** Italic text */
	italic?: boolean;
	/** Underline text */
	underline?: boolean;
	/** Uppercase text */
	uppercase?: boolean;
	/** Leading/line-height: none/tight/normal/relaxed/loose */
	leading?: 'none' | 'tight' | 'normal' | 'relaxed' | 'loose';
	/** Render as different element (p/span/div/label) */
	as?: ElementType;
	/** @deprecated Use as='span' instead. Render as span instead of p */
	asSpan?: boolean;
}

const variantClasses: Record<TextVariant, string> = {
	default: 'text-base',
	muted: 'text-sm text-muted-foreground',
	lead: 'text-lg text-muted-foreground',
	small: 'text-sm',
	mono: 'font-mono text-sm',
};

const leadingClasses = {
	none: 'leading-none',
	tight: 'leading-tight',
	normal: 'leading-normal',
	relaxed: 'leading-relaxed',
	loose: 'leading-loose',
};

function TextComponent(
	{
		className,
		variant,
		size,
		color,
		weight,
		align,
		truncate,
		mono,
		italic,
		underline,
		uppercase,
		leading,
		as,
		asSpan = false,
		children,
		...props
	}: TextProps,
	ref: React.ForwardedRef<HTMLElement>,
) {
	// Determine the element to render
	const Component = as || (asSpan ? 'span' : 'p');

	// If using new props, ignore variant
	const useNewProps = size !== undefined || color !== undefined || weight !== undefined;

	const classes = cn(
		// Use new props if any are specified, otherwise fall back to variant
		useNewProps
			? [sizeClasses[size || 'md'], color && colorClasses[color], weight && weightClasses[weight]]
			: variant && variantClasses[variant],
		// Additional styling props
		align && alignClasses[align],
		truncate && truncateClasses[truncate],
		mono && 'font-mono',
		italic && 'italic',
		underline && 'underline underline-offset-2',
		uppercase && 'uppercase tracking-wide',
		leading && leadingClasses[leading],
		className,
	);

	switch (Component) {
		case 'span':
			return (
				<span ref={ref as React.Ref<HTMLSpanElement>} className={classes} {...props}>
					{children}
				</span>
			);
		case 'div':
			return (
				<div ref={ref as React.Ref<HTMLDivElement>} className={classes} {...props}>
					{children}
				</div>
			);
		case 'label':
			return (
				<label ref={ref as React.Ref<HTMLLabelElement>} className={classes} {...props}>
					{children}
				</label>
			);
		default:
			return (
				<p ref={ref as React.Ref<HTMLParagraphElement>} className={classes} {...props}>
					{children}
				</p>
			);
	}
}

const Text = forwardRef(TextComponent);
Text.displayName = 'Text';

// =============================================================================
// EXPORTS
// =============================================================================

export { Heading, Text };
export type {
	HeadingProps,
	HeadingLevel,
	TextProps,
	TextVariant,
	TextSize,
	TextColor,
	FontWeight,
	TextAlign,
	TextTruncate,
};
