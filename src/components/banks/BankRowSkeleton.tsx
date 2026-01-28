import { Card, ContentSkeleton } from '@/components';

/**
 * Skeleton loading state for bank row
 */
export function BankRowSkeleton() {
	return (
		<Card padding="sm">
			<div className="flex gap-4">
				<ContentSkeleton variant="icon" size="md" />
				<div className="flex flex-col gap-2">
					<div className="flex-1">
						<ContentSkeleton variant="title" size="sm" />
						<ContentSkeleton variant="text" size="sm" />
					</div>
				</div>
				<ContentSkeleton variant="text" size="lg" />
			</div>
		</Card>
	);
}
