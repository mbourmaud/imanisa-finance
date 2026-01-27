import { Button, Plus, RefreshCw } from '@/components';

interface InvestmentActionsProps {
	onRefresh?: () => void;
	onAddSource?: () => void;
}

/**
 * Header actions for investments page
 */
export function InvestmentActions({ onRefresh, onAddSource }: InvestmentActionsProps) {
	return (
		<div className="flex gap-2">
			<Button variant="outline" iconLeft={<RefreshCw className="h-4 w-4" />} onClick={onRefresh}>
				Actualiser
			</Button>
			<Button iconLeft={<Plus className="h-4 w-4" />} onClick={onAddSource}>
				Nouvelle source
			</Button>
		</div>
	);
}
