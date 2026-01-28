'use client';

import { Card, Skeleton } from '@/components';

function DetailItemSkeleton() {
	return (
		<div className="flex flex-col gap-2">
			<Skeleton className="h-3 w-16" />
			<Skeleton className="h-5 w-24" />
		</div>
	);
}

function SectionSkeleton() {
	return (
		<Card padding="lg">
			<div className="flex flex-col gap-4">
				<Skeleton className="h-5 w-32" />
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					<DetailItemSkeleton />
					<DetailItemSkeleton />
					<DetailItemSkeleton />
				</div>
			</div>
		</Card>
	);
}

export function PropertyDetailSkeleton() {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center gap-4">
				<Skeleton className="h-8 w-8" />
				<div className="flex flex-col gap-3 flex-1">
					<Skeleton className="h-7 w-64" />
					<Skeleton className="h-4 w-48" />
				</div>
			</div>
			<SectionSkeleton />
			<SectionSkeleton />
		</div>
	);
}
