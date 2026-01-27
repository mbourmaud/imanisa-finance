import { Button, RefreshCw } from '@/components';

interface ImportRefreshButtonProps {
	onClick: () => void;
}

/**
 * Refresh button for import page header
 */
export function ImportRefreshButton({ onClick }: ImportRefreshButtonProps) {
	return (
		<Button variant="outline" onClick={onClick} iconLeft={<RefreshCw className="h-4 w-4" />}>
			Actualiser
		</Button>
	);
}
