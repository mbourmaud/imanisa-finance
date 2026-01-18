import { Button, Card, CardContent, Flex, Loader2 } from '@/components'

interface LoanErrorCardProps {
	error: Error | null
	onRetry: () => void
}

/**
 * Error state card for loans page
 */
export function LoanErrorCard({ error, onRetry }: LoanErrorCardProps) {
	return (
		<Card className="border-destructive/50">
			<CardContent className="py-8">
				<Flex direction="col" gap="md" align="center">
					<span className="text-destructive">
						{error?.message || 'Une erreur est survenue'}
					</span>
					<Button onClick={onRetry} variant="outline" size="sm">
						<Loader2 className="h-4 w-4 mr-2" />
						Réessayer
					</Button>
				</Flex>
			</CardContent>
		</Card>
	)
}
