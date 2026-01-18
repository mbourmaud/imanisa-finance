import {
	Card,
	CardContent,
	CardHeader,
	ContentSkeleton,
	Flex,
	Skeleton,
} from '@/components'

/**
 * Skeleton loading state for a loan card
 */
export function LoanCardSkeleton() {
	return (
		<Card className="border-border/60">
			<CardHeader className="pb-3">
				<Flex direction="row" justify="between" align="start">
					<Flex direction="row" gap="md">
						<ContentSkeleton variant="icon" size="lg" />
						<Flex direction="col" gap="sm">
							<Skeleton className="h-5 w-40" />
							<Skeleton className="h-4 w-32" />
						</Flex>
					</Flex>
					<Flex direction="col" gap="xs" align="end" className="hidden sm:flex">
						<Skeleton className="h-8 w-28" />
						<Skeleton className="h-3 w-20" />
					</Flex>
				</Flex>
			</CardHeader>
			<CardContent>
				<Flex direction="col" gap="md">
					<Flex direction="col" gap="sm">
						<Skeleton className="h-3 w-full" />
						<Skeleton className="h-2 w-full" />
					</Flex>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-border/40">
						{[1, 2, 3, 4].map((i) => (
							<div key={i} className="bg-muted/30 rounded-xl p-3">
								<Skeleton className="h-3 w-16 mb-2" />
								<Skeleton className="h-5 w-20" />
								<Skeleton className="h-3 w-14 mt-1" />
							</div>
						))}
					</div>
				</Flex>
			</CardContent>
		</Card>
	)
}
