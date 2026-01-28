import { Card, CardContent, CardHeader, ContentSkeleton, Skeleton } from '@/components';

/**
 * Skeleton loading state for a loan card
 */
export function LoanCardSkeleton() {
	return (
		<Card className="border-border/60">
			<CardHeader className="pb-3">
				<div className="flex justify-between items-start">
					<div className="flex gap-4">
						<ContentSkeleton variant="icon" size="lg" />
						<div className="flex flex-col gap-2">
							<Skeleton className="h-5 w-40" />
							<Skeleton className="h-4 w-32" />
						</div>
					</div>
					<div className="flex flex-col gap-1 items-end hidden sm:flex">
						<Skeleton className="h-8 w-28" />
						<Skeleton className="h-3 w-20" />
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<Skeleton className="h-3 w-full" />
						<Skeleton className="h-2 w-full" />
					</div>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-border/40">
						{[1, 2, 3, 4].map((i) => (
							<div key={i} className="bg-muted/30 rounded-xl p-3">
								<Skeleton className="h-3 w-16 mb-2" />
								<Skeleton className="h-5 w-20" />
								<Skeleton className="h-3 w-14 mt-1" />
							</div>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
