interface PropertyRentBoxProps {
	rentAmount: number;
	rentCharges?: number | null;
	formatCurrency: (amount: number) => string;
}

/**
 * Rental info display box
 */
export function PropertyRentBox({ rentAmount, rentCharges, formatCurrency }: PropertyRentBoxProps) {
	return (
		<div className="rounded-xl bg-emerald-500/10 p-3">
			<div className="flex justify-between">
				<div className="flex flex-col gap-1">
					<span className="text-xs text-emerald-600 dark:text-emerald-400">Loyer mensuel</span>
					<span className="text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
						{formatCurrency(rentAmount)}
					</span>
				</div>
				{rentCharges && (
					<div className="flex flex-col gap-1 items-end">
						<span className="text-xs text-muted-foreground">Net de charges</span>
						<span className="font-medium tabular-nums">
							{formatCurrency(rentAmount - rentCharges)}
						</span>
					</div>
				)}
			</div>
		</div>
	);
}
