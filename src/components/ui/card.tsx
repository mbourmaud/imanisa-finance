import type * as React from 'react';

import { cn } from '@/lib/utils';

// =============================================================================
// CARD TYPES
// =============================================================================

type CardVariant = 'default' | 'elevated' | 'flat' | 'outlined';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

const variantClasses: Record<CardVariant, string> = {
	default: 'bg-card border shadow-sm',
	elevated: 'bg-card border shadow-md',
	flat: 'bg-card/50',
	outlined: 'bg-transparent border-2',
};

const paddingClasses: Record<CardPadding, string> = {
	none: 'py-0',
	sm: 'py-4',
	md: 'py-6',
	lg: 'py-8',
};

interface CardProps extends React.ComponentProps<'div'> {
	/** Visual style variant */
	variant?: CardVariant;
	/** Vertical padding */
	padding?: CardPadding;
}

function Card({ className, variant = 'default', padding = 'md', ...props }: CardProps) {
	return (
		<div
			data-slot="card"
			data-variant={variant}
			className={cn(
				'text-card-foreground flex flex-col gap-6 rounded-xl',
				variantClasses[variant],
				paddingClasses[padding],
				className,
			)}
			{...props}
		/>
	);
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="card-header"
			className={cn(
				'@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
				className,
			)}
			{...props}
		/>
	);
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="card-title"
			className={cn('leading-none font-semibold', className)}
			{...props}
		/>
	);
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="card-description"
			className={cn('text-muted-foreground text-sm', className)}
			{...props}
		/>
	);
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="card-action"
			className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
			{...props}
		/>
	);
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
	return <div data-slot="card-content" className={cn('px-6', className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="card-footer"
			className={cn('flex items-center px-6 [.border-t]:pt-6', className)}
			{...props}
		/>
	);
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
export type { CardProps, CardVariant, CardPadding };
