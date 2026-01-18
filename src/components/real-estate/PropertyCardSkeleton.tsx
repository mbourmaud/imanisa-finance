import { Flex, GlassCard, Skeleton } from '@/components'

/**
 * Skeleton loading state for property card
 */
export function PropertyCardSkeleton() {
	return (
		<GlassCard padding="lg">
			<Flex direction="col" gap="md">
				<Flex direction="row" justify="between">
					<Flex direction="row" gap="md">
						<Skeleton className="h-12 w-12 rounded-xl" />
						<Flex direction="col" gap="sm">
							<Skeleton className="h-5 w-40" />
							<Skeleton className="h-3 w-32" />
						</Flex>
					</Flex>
				</Flex>
				<div className="grid grid-cols-2 gap-4">
					<Skeleton className="h-20 rounded-xl" />
					<Skeleton className="h-20 rounded-xl" />
				</div>
				<Skeleton className="h-6 w-full" />
			</Flex>
		</GlassCard>
	)
}
