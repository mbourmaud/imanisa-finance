import {
	Button,
	Card,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	IconBox,
	MoreHorizontal,
	type LucideIcon,
} from '@/components';
import { formatMoney } from '@/shared/utils';

export interface InvestmentSource {
	id: string;
	name: string;
	type: string;
	icon: LucideIcon;
	value: number;
	invested: number;
	performance: number;
	positions: number;
}

interface InvestmentSourceCardProps {
	source: InvestmentSource;
	onViewPositions?: () => void;
	onAddTransaction?: () => void;
	onDelete?: () => void;
}

/**
 * Card displaying an investment source with value and performance
 */
export function InvestmentSourceCard({
	source,
	onViewPositions,
	onAddTransaction,
	onDelete,
}: InvestmentSourceCardProps) {
	const gain = source.value - source.invested;
	const isPositive = gain >= 0;

	return (
		<Card padding="md" className="flex flex-col gap-3 group">
			<div className="flex flex-row justify-between">
				<IconBox icon={source.icon} size="md" variant="primary" rounded="xl" />
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
						>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={onViewPositions}>Voir les positions</DropdownMenuItem>
						<DropdownMenuItem onClick={onAddTransaction}>Ajouter une transaction</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem className="text-destructive" onClick={onDelete}>
							Supprimer
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-1">
					<span className="font-medium">{source.name}</span>
					<span className="text-xs text-muted-foreground">
						{source.positions} position{source.positions > 1 ? 's' : ''} · {source.type}
					</span>
				</div>
				<div className="flex flex-col gap-1">
					<span className="text-2xl font-semibold tabular-nums">{formatMoney(source.value)}</span>
					<span
						className={`text-sm font-medium ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
					>
						{isPositive ? '+' : ''}
						{formatMoney(gain)} ({isPositive ? '+' : ''}
						{source.performance.toFixed(2)}%)
					</span>
				</div>
			</div>
		</Card>
	);
}
