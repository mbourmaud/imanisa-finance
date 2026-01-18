'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Flex, type FlexProps } from './Flex'

/**
 * @deprecated Use <Flex direction="row"> instead
 */
type RowGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
type RowAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
type RowJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
type RowWrap = 'nowrap' | 'wrap'

interface RowProps extends Omit<FlexProps, 'direction'> {
	gap?: RowGap
	align?: RowAlign
	justify?: RowJustify
	wrap?: RowWrap
	/** If true, becomes a column on mobile (< sm breakpoint) */
	responsive?: boolean
}

/**
 * @deprecated Use <Flex direction="row"> instead
 */
const Row = forwardRef<HTMLDivElement, RowProps>(({ align = 'center', responsive, className, ...props }, ref) => (
	<Flex
		ref={ref}
		direction="row"
		align={align}
		className={cn(responsive && 'flex-col sm:flex-row', className)}
		{...props}
	/>
))
Row.displayName = 'Row'

export { Row }
export type { RowProps, RowGap, RowAlign, RowJustify, RowWrap }
