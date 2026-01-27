import { Card, ContentSkeleton, Flex, FlexItem } from '@/components'

/**
 * Skeleton loading state for bank row
 */
export function BankRowSkeleton() {
	return (
		<Card padding="sm">
			<Flex direction="row" gap="md">
				<ContentSkeleton variant="icon" size="md" />
				<Flex direction="col" gap="sm">
					<FlexItem grow="full">
						<ContentSkeleton variant="title" size="sm" />
						<ContentSkeleton variant="text" size="sm" />
					</FlexItem>
				</Flex>
				<ContentSkeleton variant="text" size="lg" />
			</Flex>
		</Card>
	)
}
