'use client';

/**
 * MoneyDisplay Component
 *
 * A flexible component for displaying monetary values with various formatting options.
 * Uses Dinero.js for precise currency handling.
 */

import * as React from 'react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import {
	formatMoney,
	formatMoneyCompact,
	formatMoneyShort,
	formatMoneyWithSign,
	type CurrencyCode,
} from '@/shared/utils/currency';

// Types

export type MoneyDisplayVariant =
	| 'default'
	| 'positive'
	| 'negative'
	| 'neutral';
export type MoneyDisplaySize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type MoneyDisplayFormat = 'full' | 'compact' | 'short' | 'withSign';

const sizeClasses: Record<MoneyDisplaySize, string> = {
	xs: 'text-xs',
	sm: 'text-sm',
	md: 'text-base',
	lg: 'text-lg',
	xl: 'text-xl',
	'2xl': 'text-2xl',
};

const variantClasses: Record<MoneyDisplayVariant, string> = {
	default: '',
	positive: 'value-positive',
	negative: 'value-negative',
	neutral: 'text-muted-foreground',
};

// Helper to determine variant from amount
function getVariantFromAmount(
	amount: number,
	autoColor: boolean
): MoneyDisplayVariant {
	if (!autoColor) return 'default';
	if (amount > 0) return 'positive';
	if (amount < 0) return 'negative';
	return 'neutral';
}

// Format functions by type
const formatters: Record<
	MoneyDisplayFormat,
	(amount: number, currency: CurrencyCode, locale: string) => string
> = {
	full: formatMoney,
	compact: formatMoneyCompact,
	short: formatMoneyShort,
	withSign: formatMoneyWithSign,
};

// MoneyDisplay Component

export interface MoneyDisplayProps
	extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
	amount: number;
	currency?: CurrencyCode;
	locale?: string;
	format?: MoneyDisplayFormat;
	size?: MoneyDisplaySize;
	variant?: MoneyDisplayVariant;
	autoColor?: boolean;
	weight?: 'normal' | 'medium' | 'semibold' | 'bold';
	showCurrency?: boolean;
}

const weightClasses: Record<string, string> = {
	normal: 'font-normal',
	medium: 'font-medium',
	semibold: 'font-semibold',
	bold: 'font-bold',
};

export const MoneyDisplay = forwardRef<HTMLSpanElement, MoneyDisplayProps>(
	(
		{
			className,
			amount,
			currency = 'EUR',
			locale = 'fr-FR',
			format = 'full',
			size = 'md',
			variant,
			autoColor = false,
			weight = 'medium',
			...props
		},
		ref
	) => {
		const displayVariant = variant || getVariantFromAmount(amount, autoColor);
		const formatter = formatters[format];
		const formattedValue = formatter(amount, currency, locale);

		return (
			<span
				ref={ref}
				data-slot="money-display"
				className={cn(
					'number-display',
					sizeClasses[size],
					variantClasses[displayVariant],
					weightClasses[weight],
					className
				)}
				{...props}
			>
				{formattedValue}
			</span>
		);
	}
);
MoneyDisplay.displayName = 'MoneyDisplay';

// MoneyDifference Component (shows change with +/- prefix)

export interface MoneyDifferenceProps
	extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
	amount: number;
	currency?: CurrencyCode;
	locale?: string;
	size?: MoneyDisplaySize;
	showIcon?: boolean;
}

export const MoneyDifference = forwardRef<HTMLSpanElement, MoneyDifferenceProps>(
	(
		{
			className,
			amount,
			currency = 'EUR',
			locale = 'fr-FR',
			size = 'sm',
			showIcon = false,
			...props
		},
		ref
	) => {
		const variant = getVariantFromAmount(amount, true);
		const sign = amount > 0 ? '+' : amount < 0 ? '' : '';
		const formattedValue = formatMoney(amount, currency, locale);

		return (
			<span
				ref={ref}
				data-slot="money-difference"
				className={cn(
					'number-display inline-flex items-center gap-1',
					sizeClasses[size],
					variantClasses[variant],
					className
				)}
				{...props}
			>
				{showIcon && amount !== 0 && (
					<span className="text-xs">
						{amount > 0 ? '▲' : '▼'}
					</span>
				)}
				{sign}
				{formattedValue}
			</span>
		);
	}
);
MoneyDifference.displayName = 'MoneyDifference';

// MoneyPercentChange Component

export interface MoneyPercentChangeProps
	extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
	value: number;
	size?: MoneyDisplaySize;
	showIcon?: boolean;
	decimals?: number;
}

export const MoneyPercentChange = forwardRef<
	HTMLSpanElement,
	MoneyPercentChangeProps
>(
	(
		{
			className,
			value,
			size = 'sm',
			showIcon = false,
			decimals = 1,
			...props
		},
		ref
	) => {
		const variant = getVariantFromAmount(value, true);
		const sign = value > 0 ? '+' : '';
		const formattedValue = `${sign}${value.toFixed(decimals)}%`;

		return (
			<span
				ref={ref}
				data-slot="money-percent-change"
				className={cn(
					'number-display inline-flex items-center gap-1',
					sizeClasses[size],
					variantClasses[variant],
					className
				)}
				{...props}
			>
				{showIcon && value !== 0 && (
					<span className="text-xs">
						{value > 0 ? '▲' : '▼'}
					</span>
				)}
				{formattedValue}
			</span>
		);
	}
);
MoneyPercentChange.displayName = 'MoneyPercentChange';

// BalanceDisplay Component (larger, prominent balance display)

export interface BalanceDisplayProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
	amount: number;
	currency?: CurrencyCode;
	label?: string;
	previousAmount?: number;
	showChange?: boolean;
	size?: 'md' | 'lg' | 'xl';
}

const balanceSizeClasses: Record<'md' | 'lg' | 'xl', string> = {
	md: 'text-2xl',
	lg: 'text-3xl',
	xl: 'text-4xl',
};

export const BalanceDisplay = forwardRef<HTMLDivElement, BalanceDisplayProps>(
	(
		{
			className,
			amount,
			currency = 'EUR',
			label,
			previousAmount,
			showChange = false,
			size = 'lg',
			...props
		},
		ref
	) => {
		const variant = getVariantFromAmount(amount, true);
		const change =
			previousAmount !== undefined ? amount - previousAmount : null;
		const percentChange =
			previousAmount !== undefined && previousAmount !== 0
				? ((amount - previousAmount) / Math.abs(previousAmount)) * 100
				: null;

		return (
			<div
				ref={ref}
				data-slot="balance-display"
				className={cn('space-y-1', className)}
				{...props}
			>
				{label && (
					<p className="text-sm text-muted-foreground font-medium">{label}</p>
				)}
				<p
					className={cn(
						'number-display font-bold tracking-tight',
						balanceSizeClasses[size],
						variant !== 'default' && variantClasses[variant]
					)}
				>
					{formatMoney(amount, currency)}
				</p>
				{showChange && change !== null && percentChange !== null && (
					<div className="flex items-center gap-2 text-sm">
						<MoneyDifference amount={change} currency={currency} size="sm" />
						<span className="text-muted-foreground">·</span>
						<MoneyPercentChange value={percentChange} size="sm" />
					</div>
				)}
			</div>
		);
	}
);
BalanceDisplay.displayName = 'BalanceDisplay';

// MoneySplit Component (shows amount breakdown between members)

export interface MoneySplitMember {
	id: string;
	name: string;
	amount: number;
	percent: number;
}

export interface MoneySplitProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
	total: number;
	currency?: CurrencyCode;
	splits: MoneySplitMember[];
	showPercent?: boolean;
}

export const MoneySplit = forwardRef<HTMLDivElement, MoneySplitProps>(
	(
		{
			className,
			total,
			currency = 'EUR',
			splits,
			showPercent = true,
			...props
		},
		ref
	) => {
		return (
			<div
				ref={ref}
				data-slot="money-split"
				className={cn('space-y-2', className)}
				{...props}
			>
				{splits.map((split) => (
					<div
						key={split.id}
						className="flex items-center justify-between text-sm"
					>
						<span className="text-muted-foreground truncate">{split.name}</span>
						<div className="flex items-center gap-2">
							<MoneyDisplay
								amount={split.amount}
								currency={currency}
								size="sm"
								weight="medium"
							/>
							{showPercent && (
								<span className="text-xs text-muted-foreground">
									({split.percent}%)
								</span>
							)}
						</div>
					</div>
				))}
				<div className="flex items-center justify-between border-t pt-2">
					<span className="font-medium">Total</span>
					<MoneyDisplay
						amount={total}
						currency={currency}
						size="sm"
						weight="semibold"
					/>
				</div>
			</div>
		);
	}
);
MoneySplit.displayName = 'MoneySplit';
