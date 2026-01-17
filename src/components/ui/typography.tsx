'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// HEADING COMPONENT
// =============================================================================
// Semantic heading component with level-based styling

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
	/** Semantic heading level (h1-h6) */
	level?: HeadingLevel;
	/** Visual size (overrides default level-based size) */
	size?: HeadingSize;
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

const sizeClasses: Record<HeadingSize, string> = {
	xs: 'text-xs',
	sm: 'text-sm',
	md: 'text-base',
	lg: 'text-lg',
	xl: 'text-xl',
	'2xl': 'text-2xl',
	'3xl': 'text-3xl',
	'4xl': 'text-4xl',
};

const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
	({ className, level = 2, size, children, ...props }, ref) => {
		const Tag = levelToTag[level];
		const sizeClass = size ? sizeClasses[size] : levelDefaultSizeClasses[level];

		return (
			<Tag
				ref={ref}
				className={cn('font-semibold tracking-tight', sizeClass, className)}
				{...props}
			>
				{children}
			</Tag>
		);
	}
);
Heading.displayName = 'Heading';

// =============================================================================
// TEXT COMPONENT
// =============================================================================
// Flexible text component with variants and colors

type TextVariant = 'default' | 'muted' | 'lead' | 'small' | 'mono';
type TextColor = 'default' | 'muted' | 'primary' | 'success' | 'danger';

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
	/** Text style variant */
	variant?: TextVariant;
	/** Text color */
	color?: TextColor;
	/** Render as span instead of p */
	asSpan?: boolean;
}

const variantClasses: Record<TextVariant, string> = {
	default: 'text-base',
	muted: 'text-sm text-muted-foreground',
	lead: 'text-lg text-muted-foreground',
	small: 'text-sm',
	mono: 'font-mono text-sm',
};

const colorClasses: Record<TextColor, string> = {
	default: '',
	muted: 'text-muted-foreground',
	primary: 'text-primary',
	success: 'text-[oklch(0.55_0.18_145)]',
	danger: 'text-destructive',
};

const Text = forwardRef<HTMLParagraphElement, TextProps>(
	({ className, variant = 'default', color = 'default', asSpan = false, children, ...props }, ref) => {
		const Component = asSpan ? 'span' : 'p';

		return (
			<Component
				ref={ref as React.Ref<HTMLParagraphElement>}
				className={cn(
					variantClasses[variant],
					color !== 'default' && colorClasses[color],
					className
				)}
				{...props}
			>
				{children}
			</Component>
		);
	}
);
Text.displayName = 'Text';

export { Heading, Text };
export type { HeadingProps, HeadingLevel, HeadingSize, TextProps, TextVariant, TextColor };
