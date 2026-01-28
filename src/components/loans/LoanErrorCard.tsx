import { Button, Card, CardContent, Loader2 } from '@/components';

interface LoanErrorCardProps {
	error: Error | null;
	onRetry: () => void;
}

/**
 * Error state card for loans page
 */
export function LoanErrorCard({ error, onRetry }: LoanErrorCardProps) {
	return (
		<Card className="border-destructive/50">
			<CardContent className="py-8">
				<div className="flex flex-col gap-4 items-center">
					<span className="text-destructive">{error?.message || 'Une erreur est survenue'}</span>
					<Button onClick={onRetry} variant="outline" size="sm">
						<Loader2 className="h-4 w-4 mr-2" />
						Réessayer
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
