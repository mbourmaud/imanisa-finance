import { Card, ContentSkeleton, Flex } from '@/components'

/**
 * Skeleton loading state for stats card
 */
export function StatsCardSkeleton() {
	return (
		<Card padding="md">
			<Flex direction="row" justify="between">
				<Flex direction="col" gap="sm">
					<ContentSkeleton variant="text" size="md" />
					<ContentSkeleton variant="title" size="lg" />
					<ContentSkeleton variant="text" size="sm" />
				</Flex>
				<ContentSkeleton variant="icon" size="md" />
			</Flex>
		</Card>
	)
}
