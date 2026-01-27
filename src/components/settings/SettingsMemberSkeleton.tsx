import { Skeleton } from '@/components';

/**
 * Skeleton loading state for a member row
 */
export function SettingsMemberSkeleton() {
	return (
		<div className="flex justify-between items-center rounded-xl bg-muted/30 p-4">
			<div className="flex items-center gap-4">
				<Skeleton className="h-10 w-10 rounded-lg" />
				<div className="flex flex-col gap-2">
					<Skeleton className="h-5 w-24" />
					<Skeleton className="h-4 w-16" />
				</div>
			</div>
			<Skeleton className="h-8 w-8" />
		</div>
	);
}
