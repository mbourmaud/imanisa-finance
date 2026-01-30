'use client'

import * as React from 'react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { TransactionCategory } from './transaction-types'

export interface CategoryBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
	category: TransactionCategory
	size?: 'sm' | 'md'
}

export const CategoryBadge = forwardRef<HTMLSpanElement, CategoryBadgeProps>(
	({ className, category, size = 'sm', ...props }, ref) => {
		const colorStyle = category.color
			? ({ '--category-color': category.color } as React.CSSProperties)
			: undefined

		return (
			<span
				ref={ref}
				data-slot="category-badge"
				className={cn(
					'inline-flex items-center rounded-full font-medium',
					size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
					category.color
						? 'bg-[var(--category-color)]/10 text-[var(--category-color)]'
						: 'bg-muted text-muted-foreground',
					className,
				)}
				style={colorStyle}
				{...props}
			>
				{category.name}
			</span>
		)
	},
)
CategoryBadge.displayName = 'CategoryBadge'
