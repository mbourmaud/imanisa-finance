import { Card, Skeleton } from '@/components';

/**
 * Skeleton loading state for property card
 */
export function PropertyCardSkeleton() {
	return (
		<Card padding="lg">
			<div className="flex flex-col gap-4">
				<div className="flex justify-between">
					<div className="flex gap-4">
						<Skeleton className="h-12 w-12 rounded-xl" />
						<div className="flex flex-col gap-2">
							<Skeleton className="h-5 w-40" />
							<Skeleton className="h-3 w-32" />
						</div>
					</div>
				</div>
				<div className="grid grid-cols-2 gap-4">
					<Skeleton className="h-20 rounded-xl" />
					<Skeleton className="h-20 rounded-xl" />
				</div>
				<Skeleton className="h-6 w-full" />
			</div>
		</Card>
	);
}
