'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { useHeaderStore } from '@/shared/stores';

// =============================================================================
// DASHBOARD HEADER COMPONENT
// =============================================================================

interface DashboardHeaderProps extends React.HTMLAttributes<HTMLElement> {
	children: React.ReactNode;
}

/**
 * Sticky header for the dashboard layout.
 * Displays page title/actions from the header store alongside the sidebar trigger.
 */
const DashboardHeader = forwardRef<HTMLElement, DashboardHeaderProps>(
	({ children, className, ...props }, ref) => {
		const title = useHeaderStore((s) => s.title);
		const actions = useHeaderStore((s) => s.actions);

		return (
			<header
				ref={ref}
				data-slot="dashboard-header"
				className={cn(
					'sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-sm',
					className,
				)}
				{...props}
			>
				{children}

				{title && (
					<div className="flex flex-1 items-center justify-between gap-4">
						<h1 className="text-base font-semibold truncate">{title}</h1>
						{actions && (
							<div className="flex items-center gap-2 shrink-0">{actions}</div>
						)}
					</div>
				)}
			</header>
		);
	},
);
DashboardHeader.displayName = 'DashboardHeader';

// =============================================================================
// DASHBOARD HEADER CONTENT (mobile only)
// =============================================================================

interface DashboardHeaderMobileProps {
	children: React.ReactNode;
}

/**
 * Content wrapper that's only visible on mobile (hidden on lg screens).
 * Contains the sidebar trigger and branding.
 */
function DashboardHeaderMobile({ children }: DashboardHeaderMobileProps) {
	return <div className="flex items-center gap-4 lg:hidden">{children}</div>;
}

// =============================================================================
// DASHBOARD MAIN CONTENT WRAPPER
// =============================================================================

interface DashboardMainProps extends React.HTMLAttributes<HTMLElement> {
	children: React.ReactNode;
}

/**
 * Main content area of the dashboard with proper padding and max-width.
 */
const DashboardMain = forwardRef<HTMLElement, DashboardMainProps>(
	({ children, className, ...props }, ref) => {
		return (
			<main ref={ref} data-slot="dashboard-main" className={cn('flex-1 p-4 md:p-6', className)} {...props}>
				<div className="mx-auto flex max-w-7xl flex-col gap-8">{children}</div>
			</main>
		);
	},
);
DashboardMain.displayName = 'DashboardMain';

// =============================================================================
// EXPORTS
// =============================================================================

export { DashboardHeader, DashboardHeaderMobile, DashboardMain };
export type { DashboardHeaderProps, DashboardMainProps };
