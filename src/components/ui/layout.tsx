'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// CONTAINER COMPONENT
// =============================================================================
// Constrains content width and provides horizontal padding

type ContainerMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Maximum width constraint */
	maxWidth?: ContainerMaxWidth;
	/** Center the container horizontally */
	centered?: boolean;
	/** Apply horizontal padding (gutter) */
	padded?: boolean;
}

const containerMaxWidthClasses: Record<ContainerMaxWidth, string> = {
	sm: 'max-w-screen-sm',
	md: 'max-w-screen-md',
	lg: 'max-w-screen-lg',
	xl: 'max-w-screen-xl',
	'2xl': 'max-w-screen-2xl',
	full: 'max-w-full',
};

const Container = forwardRef<HTMLDivElement, ContainerProps>(
	({ className, maxWidth = 'xl', centered = true, padded = true, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn(
					containerMaxWidthClasses[maxWidth],
					centered && 'mx-auto',
					padded && 'px-4 sm:px-6',
					className
				)}
				{...props}
			/>
		);
	}
);
Container.displayName = 'Container';

// =============================================================================
// SECTION COMPONENT
// =============================================================================
// Provides consistent vertical spacing for page sections

type SectionSpacing = 'none' | 'sm' | 'md' | 'lg' | 'xl';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
	/** Vertical spacing size */
	spacing?: SectionSpacing;
	/** Optional section title */
	title?: string;
	/** Optional section description */
	description?: string;
	/** Render as a different HTML element */
	as?: 'section' | 'div' | 'article';
}

const sectionSpacingClasses: Record<SectionSpacing, string> = {
	none: '',
	sm: 'py-4',
	md: 'py-6',
	lg: 'py-8',
	xl: 'py-12',
};

function Section({
	className,
	spacing = 'md',
	title,
	description,
	as: Component = 'section',
	children,
	...props
}: SectionProps) {
	return (
		<Component
			className={cn(sectionSpacingClasses[spacing], className)}
			{...props}
		>
			{(title || description) && (
				<div className="mb-4">
					{title && <h2 className="text-lg font-semibold tracking-tight">{title}</h2>}
					{description && (
						<p className="mt-1 text-sm text-muted-foreground">{description}</p>
					)}
				</div>
			)}
			{children}
		</Component>
	);
}

// =============================================================================
// PAGE COMPONENT
// =============================================================================
// Wrapper for dashboard pages with consistent padding and scroll

interface PageProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Page title for accessibility */
	title?: string;
	/** Enable scrolling */
	scrollable?: boolean;
	/** Apply vertical padding */
	padded?: boolean;
}

const Page = forwardRef<HTMLDivElement, PageProps>(
	({ className, title, scrollable = true, padded = true, children, ...props }, ref) => {
		return (
			<main
				ref={ref as React.Ref<HTMLElement>}
				className={cn(
					'flex-1',
					scrollable && 'overflow-y-auto scrollbar-thin',
					padded && 'py-6',
					className
				)}
				aria-label={title}
				{...props}
			>
				{children}
			</main>
		);
	}
);
Page.displayName = 'Page';

// =============================================================================
// EXPORTS
// =============================================================================

export { Container, Section, Page };
export type { ContainerProps, ContainerMaxWidth, SectionProps, SectionSpacing, PageProps };
