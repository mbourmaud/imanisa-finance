import { formatMoney } from '@/shared/utils';

export interface Position {
	id: string;
	ticker: string;
	name: string;
	source: string;
	quantity: number;
	avgPrice: number;
	currentPrice: number;
	value: number;
	gain: number;
	gainPercent: number;
}

interface PositionListItemProps {
	position: Position;
}

/**
 * Single position row in the positions list
 */
export function PositionListItem({ position }: PositionListItemProps) {
	const isPositive = position.gain >= 0;

	return (
		<div className="flex justify-between p-4 rounded-xl bg-background/50 hover:bg-background/70 transition-colors">
			<div className="flex gap-4">
				<div className="flex items-center justify-center h-10 w-10 rounded-lg font-mono text-sm font-semibold bg-background text-muted-foreground">
					{position.ticker.slice(0, 3)}
				</div>
				<div className="flex flex-col gap-1">
					<span className="font-medium">{position.name}</span>
					<span className="text-xs text-muted-foreground">
						{position.ticker} · {position.source}
					</span>
				</div>
			</div>
			<div className="flex gap-8">
				<div className="flex flex-col gap-1 items-end hidden sm:flex">
					<span className="text-xs text-muted-foreground">Quantité</span>
					<span className="font-medium tabular-nums">{position.quantity}</span>
				</div>
				<div className="flex flex-col gap-1 items-end hidden md:flex">
					<span className="text-xs text-muted-foreground">PRU</span>
					<span className="font-medium tabular-nums">{formatMoney(position.avgPrice)}</span>
				</div>
				<div className="flex flex-col gap-1 items-end">
					<span className="text-xs text-muted-foreground">Valeur</span>
					<span className="font-medium tabular-nums">{formatMoney(position.value)}</span>
				</div>
				<div className="flex flex-col gap-1 items-end min-w-[100px]">
					<span
						className={`font-medium tabular-nums ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
					>
						{isPositive ? '+' : ''}
						{formatMoney(position.gain)}
					</span>
					<span
						className={`text-xs ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
					>
						{isPositive ? '+' : ''}
						{position.gainPercent.toFixed(2)}%
					</span>
				</div>
			</div>
		</div>
	);
}
