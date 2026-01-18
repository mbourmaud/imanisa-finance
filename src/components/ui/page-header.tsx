'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// PAGE HEADER TYPES
// =============================================================================

type PageHeaderSize = 'sm' | 'md' | 'lg';

interface BreadcrumbItem {
	label: string;
	href?: string;
}

// =============================================================================
// SIZE CLASSES
// =============================================================================

const titleSizeClasses: Record<PageHeaderSize, string> = {
	sm: 'text-xl sm:text-2xl',
	md: 'text-2xl sm:text-3xl',
	lg: 'text-3xl sm:text-4xl',
};

const descriptionSizeClasses: Record<PageHeaderSize, string> = {
	sm: 'text-xs sm:text-sm',
	md: 'text-sm',
	lg: 'text-sm sm:text-base',
};

const spacingClasses: Record<PageHeaderSize, string> = {
	sm: 'pb-4 sm:pb-6',
	md: 'pb-6 sm:pb-8',
	lg: 'pb-8 sm:pb-10',
};

// =============================================================================
// PAGE HEADER COMPONENT
// =============================================================================

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Page title */
	title: string;
	/** Optional description text */
	description?: string;
	/** Size variant */
	size?: PageHeaderSize;
	/** Breadcrumb navigation items */
	breadcrumbs?: BreadcrumbItem[];
	/** Action elements (buttons, etc.) */
	actions?: React.ReactNode;
	/** Optional icon to display before title */
	icon?: React.ReactNode;
}

const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(
	({ className, title, description, size = 'md', breadcrumbs, actions, icon, ...props }, ref) => {
		return (
			<div
				ref={ref}
				data-slot="page-header"
				className={cn(spacingClasses[size], className)}
				{...props}
			>
				{/* Breadcrumbs */}
				{breadcrumbs && breadcrumbs.length > 0 && (
					<nav aria-label="Breadcrumb" className="mb-2">
						<ol className="flex items-center gap-1 text-sm text-muted-foreground">
							{breadcrumbs.map((item, index) => (
								<li key={index} className="flex items-center">
									{index > 0 && <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/50" />}
									{item.href ? (
										<Link href={item.href} className="hover:text-foreground transition-colors">
											{item.label}
										</Link>
									) : (
										<span className="text-foreground font-medium">{item.label}</span>
									)}
								</li>
							))}
						</ol>
					</nav>
				)}

				{/* Header content */}
				<div className="flex items-start justify-between gap-4">
					<div className="space-y-1 min-w-0">
						<div className="flex items-center gap-3">
							{icon && <div className="flex-shrink-0">{icon}</div>}
							<h1 className={cn('font-bold tracking-tight', titleSizeClasses[size])}>{title}</h1>
						</div>
						{description && (
							<p className={cn('text-muted-foreground', descriptionSizeClasses[size])}>
								{description}
							</p>
						)}
					</div>
					{actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
				</div>
			</div>
		);
	},
);
PageHeader.displayName = 'PageHeader';

// =============================================================================
// SECTION HEADER COMPONENT
// =============================================================================

type SectionHeaderSize = 'sm' | 'md' | 'lg';

const sectionTitleSizeClasses: Record<SectionHeaderSize, string> = {
	sm: 'text-base sm:text-lg',
	md: 'text-lg sm:text-xl',
	lg: 'text-xl sm:text-2xl',
};

const sectionDescriptionSizeClasses: Record<SectionHeaderSize, string> = {
	sm: 'text-xs',
	md: 'text-xs sm:text-sm',
	lg: 'text-sm',
};

const sectionSpacingClasses: Record<SectionHeaderSize, string> = {
	sm: 'pb-3',
	md: 'pb-4',
	lg: 'pb-6',
};

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Section title */
	title: string;
	/** Optional description text */
	description?: string;
	/** Size variant */
	size?: SectionHeaderSize;
	/** Action elements (buttons, links, etc.) */
	action?: React.ReactNode;
	/** Whether to add a border bottom */
	bordered?: boolean;
	/** Optional icon element to display before title */
	icon?: React.ReactNode;
	/** Show a horizontal line after the title (extends to fill remaining space) */
	showLine?: boolean;
}

function SectionHeader({
	className,
	title,
	description,
	size = 'md',
	action,
	bordered = false,
	icon,
	showLine = false,
	...props
}: SectionHeaderProps) {
	return (
		<div
			data-slot="section-header"
			className={cn(
				sectionSpacingClasses[size],
				bordered && 'border-b border-border/60 mb-4',
				className,
			)}
			{...props}
		>
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-3 min-w-0 flex-1">
					{icon && <div className="flex-shrink-0">{icon}</div>}
					<h2 className={cn('font-semibold tracking-tight', sectionTitleSizeClasses[size])}>
						{title}
					</h2>
					{showLine && <div className="flex-1 h-px bg-border/50 ml-3" />}
					{description && !showLine && (
						<p className={cn('text-muted-foreground', sectionDescriptionSizeClasses[size])}>
							{description}
						</p>
					)}
				</div>
				{action && <div className="flex items-center gap-2 flex-shrink-0">{action}</div>}
			</div>
			{description && showLine && (
				<p className={cn('text-muted-foreground mt-1', sectionDescriptionSizeClasses[size])}>
					{description}
				</p>
			)}
		</div>
	);
}

// =============================================================================
// EXPORTS
// =============================================================================

export { PageHeader, SectionHeader };
export type {
	PageHeaderProps,
	SectionHeaderProps,
	PageHeaderSize,
	SectionHeaderSize,
	BreadcrumbItem,
};
