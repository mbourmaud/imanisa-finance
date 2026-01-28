'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from '@/components';
import { IconBox } from '@/components/common/IconBox';

// =============================================================================
// TYPES
// =============================================================================

interface AccountTypeHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Icon for the account type */
	icon: LucideIcon;
	/** Title (e.g., "Comptes courants") */
	title: string;
	/** Count of accounts */
	count: number;
}

// =============================================================================
// ACCOUNT TYPE HEADER COMPONENT
// =============================================================================

/**
 * Header for a group of accounts of the same type.
 * Displays the icon, title, and count.
 */
const AccountTypeHeader = forwardRef<HTMLDivElement, AccountTypeHeaderProps>(
	({ icon, title, count, className, ...props }, ref) => {
		return (
			<div
				ref={ref}
				data-slot="account-type-header"
				className={cn('flex items-center gap-3 mb-4', className)}
				{...props}
			>
				<IconBox icon={icon} size="md" variant="primary" rounded="xl" />
				<div className="flex flex-col">
					<h3 className="text-lg font-semibold tracking-tight">{title}</h3>
					<p className="text-sm text-muted-foreground">
						{count} compte{count > 1 ? 's' : ''}
					</p>
				</div>
			</div>
		);
	},
);
AccountTypeHeader.displayName = 'AccountTypeHeader';

// =============================================================================
// EXPORTS
// =============================================================================

export { AccountTypeHeader };
export type { AccountTypeHeaderProps };
