'use client'

import { forwardRef } from 'react'
import { Flex, type FlexProps } from './Flex'

/**
 * @deprecated Use <Flex direction="col"> instead
 */
type StackGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'

interface StackProps extends Omit<FlexProps, 'direction'> {
	gap?: StackGap
	align?: StackAlign
	justify?: StackJustify
}

/**
 * @deprecated Use <Flex direction="col"> instead
 */
const Stack = forwardRef<HTMLDivElement, StackProps>((props, ref) => (
	<Flex ref={ref} direction="col" {...props} />
))
Stack.displayName = 'Stack'

export { Stack }
export type { StackProps, StackGap, StackAlign, StackJustify }
