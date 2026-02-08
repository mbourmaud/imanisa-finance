'use client'

import type * as React from 'react'
import { forwardRef } from 'react'
import {
	ArrowLeftRight,
	Banknote,
	BarChart3,
	BookOpen,
	Briefcase,
	Building,
	Car,
	Gamepad2,
	HeartPulse,
	Home,
	Key,
	Landmark,
	Lightbulb,
	Package,
	PiggyBank,
	Plane,
	Shield,
	ShoppingBag,
	ShoppingCart,
	Tag,
	TrendingUp,
	Tv,
	Undo2,
	Utensils,
	Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TransactionCategory } from './transaction-types'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
	'arrow-left-right': ArrowLeftRight,
	banknote: Banknote,
	'bar-chart-3': BarChart3,
	'book-open': BookOpen,
	briefcase: Briefcase,
	building: Building,
	car: Car,
	'gamepad-2': Gamepad2,
	'heart-pulse': HeartPulse,
	home: Home,
	key: Key,
	landmark: Landmark,
	lightbulb: Lightbulb,
	package: Package,
	'piggy-bank': PiggyBank,
	plane: Plane,
	shield: Shield,
	'shopping-bag': ShoppingBag,
	'shopping-cart': ShoppingCart,
	'trending-up': TrendingUp,
	tv: Tv,
	'undo-2': Undo2,
	utensils: Utensils,
	wallet: Wallet,
}

export interface CategoryBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
	category: TransactionCategory
	size?: 'sm' | 'md'
}

export const CategoryBadge = forwardRef<HTMLSpanElement, CategoryBadgeProps>(
	({ className, category, size = 'sm', ...props }, ref) => {
		const colorStyle = category.color
			? ({ '--category-color': category.color } as React.CSSProperties)
			: undefined

		const IconComponent = category.icon ? iconMap[category.icon] : undefined
		const iconSize =
			size === 'sm' ? 'h-3.5 w-3.5 stroke-[2.5]' : 'h-4 w-4 stroke-[2.5]'

		return (
			<span
				ref={ref}
				data-slot="category-badge"
				className={cn(
					'inline-flex w-fit items-center gap-1.5 rounded-full',
					size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
					category.color
						? 'bg-[var(--category-color)]/15'
						: 'bg-muted text-muted-foreground',
					className,
				)}
				style={colorStyle}
				{...props}
			>
				{IconComponent ? (
					<IconComponent className={cn(iconSize, category.color && 'text-[color:var(--category-color)]')} />
				) : category.icon ? (
					<Tag className={cn(iconSize, category.color && 'text-[color:var(--category-color)]')} />
				) : null}
				<span className={cn('font-medium', category.color && 'text-[color:var(--category-color)]')}>
					{category.name}
				</span>
			</span>
		)
	},
)
CategoryBadge.displayName = 'CategoryBadge'
