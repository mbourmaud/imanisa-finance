import type { LucideIcon } from '@/components';

interface LoanInfoBoxProps {
	icon: LucideIcon;
	label: string;
	value: string;
	sublabel?: string;
}

/**
 * Info box displaying a loan metric (mensualité, taux, durée, etc.)
 */
export function LoanInfoBox({ icon: Icon, label, value, sublabel }: LoanInfoBoxProps) {
	return (
		<div className="flex flex-col gap-1 bg-muted/30 rounded-xl p-3">
			<div className="flex gap-2 text-muted-foreground">
				<Icon className="h-3.5 w-3.5" />
				<span className="text-xs">{label}</span>
			</div>
			<span className="font-semibold tabular-nums">{value}</span>
			{sublabel && <span className="text-xs text-muted-foreground">{sublabel}</span>}
		</div>
	);
}
