import { Card, ContentSkeleton } from '@/components';

/**
 * Skeleton loading state for stats card
 */
export function StatsCardSkeleton() {
	return (
		<Card padding="md">
			<div className="flex justify-between">
				<div className="flex flex-col gap-2">
					<ContentSkeleton variant="text" size="md" />
					<ContentSkeleton variant="title" size="lg" />
					<ContentSkeleton variant="text" size="sm" />
				</div>
				<ContentSkeleton variant="icon" size="md" />
			</div>
		</Card>
	);
}
