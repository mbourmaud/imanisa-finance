'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Heading, Row, Text } from '@/components'

// =============================================================================
// LIST HEADER COMPONENT
// =============================================================================

interface ListHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Main title */
	title: string
	/** Optional count or subtitle */
	subtitle?: string
	/** Optional action element */
	action?: React.ReactNode
}

/**
 * Header for list sections with title, subtitle and optional action.
 */
const ListHeader = forwardRef<HTMLDivElement, ListHeaderProps>(
	({ title, subtitle, action, className, ...props }, ref) => {
		return (
			<div
				ref={ref}
				data-slot="list-header"
				className={cn(
					'flex items-center justify-between p-4 border-b border-border',
					className,
				)}
				{...props}
			>
				<Row gap="md" align="center">
					<Heading level={3} size="md" weight="semibold">
						{title}
					</Heading>
					{subtitle && (
						<Text size="sm" color="muted">
							{subtitle}
						</Text>
					)}
				</Row>
				{action}
			</div>
		)
	},
)
ListHeader.displayName = 'ListHeader'

// =============================================================================
// EXPORTS
// =============================================================================

export { ListHeader }
export type { ListHeaderProps }
