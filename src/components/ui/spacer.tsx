'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// SPACER COMPONENT
// =============================================================================
// Flexible spacer that grows to fill available space in flex containers

interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Flex grow value (default: 1) */
	grow?: number;
}

const Spacer = forwardRef<HTMLDivElement, SpacerProps>(
	({ className, grow = 1, style, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn('flex-shrink-0', className)}
				style={{ flexGrow: grow, ...style }}
				aria-hidden="true"
				{...props}
			/>
		);
	},
);
Spacer.displayName = 'Spacer';

export { Spacer };
export type { SpacerProps };
