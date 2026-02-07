import { Card, ContentSkeleton } from '@/components';

/**
 * Skeleton loading state for bank row
 */
export function BankRowSkeleton() {
	return (
		<Card padding="none">
			<div className="flex items-center gap-4 p-4 sm:p-5">
				<ContentSkeleton variant="icon" size="md" />
				<div className="flex flex-col gap-1.5 flex-1 min-w-0">
					<ContentSkeleton variant="title" size="sm" />
					<ContentSkeleton variant="text" size="xs" />
				</div>
				<ContentSkeleton variant="text" size="lg" />
			</div>
		</Card>
	);
}
