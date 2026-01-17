'use client';

import * as SelectPrimitive from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

// =============================================================================
// SELECT SIZE & VARIANT TYPES
// =============================================================================

type SelectSize = 'sm' | 'md' | 'lg';
type SelectVariant = 'default' | 'glass';

const selectTriggerSizeClasses: Record<SelectSize, string> = {
	sm: 'h-8 px-2.5 text-xs',
	md: 'h-9 px-3 text-sm',
	lg: 'h-11 px-4 text-base',
};

const selectTriggerVariantClasses: Record<SelectVariant, string> = {
	default: 'border-input bg-transparent dark:bg-input/30 dark:hover:bg-input/50',
	glass: 'border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background/70',
};

// =============================================================================
// SELECT COMPONENTS
// =============================================================================

function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
	return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({ ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
	return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
	return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

interface SelectTriggerProps extends React.ComponentProps<typeof SelectPrimitive.Trigger> {
	size?: SelectSize;
	variant?: SelectVariant;
}

const SelectTrigger = forwardRef<
	React.ElementRef<typeof SelectPrimitive.Trigger>,
	SelectTriggerProps
>(({ className, size = 'md', variant = 'default', children, ...props }, ref) => (
	<SelectPrimitive.Trigger
		ref={ref}
		data-slot="select-trigger"
		className={cn(
			// Base styles
			'flex w-fit items-center justify-between gap-2 rounded-md border whitespace-nowrap shadow-xs',
			// Transition
			'transition-[color,box-shadow] outline-none',
			// Icon styles
			"[&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
			// Placeholder
			'data-[placeholder]:text-muted-foreground',
			// Focus styles
			'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
			// Error/invalid styles
			'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
			// Disabled styles
			'disabled:cursor-not-allowed disabled:opacity-50',
			// Value alignment
			'*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2',
			// Size variant
			selectTriggerSizeClasses[size],
			// Visual variant
			selectTriggerVariantClasses[variant],
			className,
		)}
		{...props}
	>
		{children}
		<SelectPrimitive.Icon asChild>
			<ChevronDownIcon className="size-4 opacity-50" />
		</SelectPrimitive.Icon>
	</SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = forwardRef<
	React.ElementRef<typeof SelectPrimitive.Content>,
	React.ComponentProps<typeof SelectPrimitive.Content>
>(({ className, children, position = 'item-aligned', align = 'center', ...props }, ref) => (
	<SelectPrimitive.Portal>
		<SelectPrimitive.Content
			ref={ref}
			data-slot="select-content"
			className={cn(
				// Base styles - glassmorphism
				'bg-popover/95 backdrop-blur-xl text-popover-foreground',
				// Layout
				'relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border shadow-lg',
				// Animation
				'data-[state=open]:animate-in data-[state=closed]:animate-out',
				'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
				'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
				'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
				'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
				// Origin
				'origin-(--radix-select-content-transform-origin)',
				// Position variant
				position === 'popper' &&
					'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
				className,
			)}
			position={position}
			align={align}
			{...props}
		>
			<SelectScrollUpButton />
			<SelectPrimitive.Viewport
				className={cn(
					'p-1',
					position === 'popper' &&
						'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1',
				)}
			>
				{children}
			</SelectPrimitive.Viewport>
			<SelectScrollDownButton />
		</SelectPrimitive.Content>
	</SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
	return (
		<SelectPrimitive.Label
			data-slot="select-label"
			className={cn('text-muted-foreground px-2 py-1.5 text-xs font-medium', className)}
			{...props}
		/>
	);
}

const SelectItem = forwardRef<
	React.ElementRef<typeof SelectPrimitive.Item>,
	React.ComponentProps<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
	<SelectPrimitive.Item
		ref={ref}
		data-slot="select-item"
		className={cn(
			// Base styles
			'relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none',
			// Focus/hover styles
			'focus:bg-accent focus:text-accent-foreground',
			// Icon styles
			"[&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
			// Disabled styles
			'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
			// Inner alignment
			'*:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2',
			className,
		)}
		{...props}
	>
		<span
			data-slot="select-item-indicator"
			className="absolute right-2 flex size-3.5 items-center justify-center"
		>
			<SelectPrimitive.ItemIndicator>
				<CheckIcon className="size-4" />
			</SelectPrimitive.ItemIndicator>
		</span>
		<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
	</SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

function SelectSeparator({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
	return (
		<SelectPrimitive.Separator
			data-slot="select-separator"
			className={cn('bg-border pointer-events-none -mx-1 my-1 h-px', className)}
			{...props}
		/>
	);
}

function SelectScrollUpButton({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
	return (
		<SelectPrimitive.ScrollUpButton
			data-slot="select-scroll-up-button"
			className={cn('flex cursor-default items-center justify-center py-1', className)}
			{...props}
		>
			<ChevronUpIcon className="size-4" />
		</SelectPrimitive.ScrollUpButton>
	);
}

function SelectScrollDownButton({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
	return (
		<SelectPrimitive.ScrollDownButton
			data-slot="select-scroll-down-button"
			className={cn('flex cursor-default items-center justify-center py-1', className)}
			{...props}
		>
			<ChevronDownIcon className="size-4" />
		</SelectPrimitive.ScrollDownButton>
	);
}

export {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectScrollDownButton,
	SelectScrollUpButton,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
};
export type { SelectSize, SelectVariant, SelectTriggerProps };
