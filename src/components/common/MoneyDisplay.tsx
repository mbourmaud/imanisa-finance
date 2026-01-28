'use client';

/**
 * MoneyDisplay Component
 *
 * A flexible component for displaying monetary values with various formatting options.
 * Uses Dinero.js for precise currency handling.
 */

import type * as React from 'react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import {
	type CurrencyCode,
	formatMoney,
	formatMoneyCompact,
	formatMoneyShort,
	formatMoneyWithSign,
} from '@/shared/utils/currency';

// =============================================================================
// TYPES
// =============================================================================

export type MoneyDisplayFormat = 'full' | 'compact' | 'short' | 'withSign';

// =============================================================================
// FORMATTERS
// =============================================================================

const formatters: Record<
	MoneyDisplayFormat,
	(amount: number, currency: CurrencyCode, locale: string) => string
> = {
	full: formatMoney,
	compact: formatMoneyCompact,
	short: formatMoneyShort,
	withSign: formatMoneyWithSign,
};

// =============================================================================
// MONEY DISPLAY COMPONENT
// =============================================================================

export interface MoneyDisplayProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
	/** Amount to display */
	amount: number;
	/** Currency code (default: EUR) */
	currency?: CurrencyCode;
	/** Locale for formatting (default: fr-FR) */
	locale?: string;
	/** Format variant (default: full) */
	format?: MoneyDisplayFormat;
}

export const MoneyDisplay = forwardRef<HTMLSpanElement, MoneyDisplayProps>(
	({ className, amount, currency = 'EUR', locale = 'fr-FR', format = 'full', ...props }, ref) => {
		const formatter = formatters[format];
		const formattedValue = formatter(amount, currency, locale);

		return (
			<span
				ref={ref}
				data-slot="money-display"
				className={cn('number-display', className)}
				{...props}
			>
				{formattedValue}
			</span>
		);
	},
);
MoneyDisplay.displayName = 'MoneyDisplay';
