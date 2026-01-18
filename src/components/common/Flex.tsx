'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

type FlexDirection = 'row' | 'col'
type FlexGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
type FlexJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
type FlexWrap = 'nowrap' | 'wrap'

const directionClasses: Record<FlexDirection, string> = {
	row: 'flex-row',
	col: 'flex-col',
}

const gapClasses: Record<FlexGap, string> = {
	none: 'gap-0',
	xs: 'gap-1',
	sm: 'gap-2',
	md: 'gap-4',
	lg: 'gap-6',
	xl: 'gap-8',
	'2xl': 'gap-12',
}

const alignClasses: Record<FlexAlign, string> = {
	start: 'items-start',
	center: 'items-center',
	end: 'items-end',
	stretch: 'items-stretch',
	baseline: 'items-baseline',
}

const justifyClasses: Record<FlexJustify, string> = {
	start: 'justify-start',
	center: 'justify-center',
	end: 'justify-end',
	between: 'justify-between',
	around: 'justify-around',
	evenly: 'justify-evenly',
}

const wrapClasses: Record<FlexWrap, string> = {
	nowrap: 'flex-nowrap',
	wrap: 'flex-wrap',
}

interface FlexProps extends React.ComponentPropsWithoutRef<'div'> {
	direction?: FlexDirection
	gap?: FlexGap
	align?: FlexAlign
	justify?: FlexJustify
	wrap?: FlexWrap
}

const Flex = forwardRef<HTMLDivElement, FlexProps>(
	(
		{
			direction = 'row',
			gap = 'md',
			align = 'stretch',
			justify = 'start',
			wrap = 'nowrap',
			className,
			children,
			...props
		},
		ref,
	) => {
		return (
			<div
				ref={ref}
				className={cn(
					'flex',
					directionClasses[direction],
					gapClasses[gap],
					alignClasses[align],
					justifyClasses[justify],
					wrapClasses[wrap],
					className,
				)}
				{...props}
			>
				{children}
			</div>
		)
	},
)
Flex.displayName = 'Flex'

type FlexItemGrow = 'none' | 'auto' | 'full'

interface FlexItemProps extends React.ComponentPropsWithoutRef<'div'> {
	grow?: FlexItemGrow
	shrink?: boolean
}

const growClasses: Record<FlexItemGrow, string> = {
	none: 'grow-0',
	auto: 'grow',
	full: 'flex-1',
}

const FlexItem = forwardRef<HTMLDivElement, FlexItemProps>(
	({ grow = 'none', shrink = true, className, children, ...props }, ref) => {
		return (
			<div ref={ref} className={cn(growClasses[grow], !shrink && 'shrink-0', className)} {...props}>
				{children}
			</div>
		)
	},
)
FlexItem.displayName = 'FlexItem'

export { Flex, FlexItem }
export type { FlexProps, FlexItemProps, FlexDirection, FlexGap, FlexAlign, FlexJustify, FlexWrap }
