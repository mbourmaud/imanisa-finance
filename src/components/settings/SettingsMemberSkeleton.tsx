import { Flex, Skeleton } from '@/components'

/**
 * Skeleton loading state for a member row
 */
export function SettingsMemberSkeleton() {
	return (
		<Flex
			direction="row"
			justify="between"
			align="center"
			className="rounded-xl bg-muted/30 p-4"
		>
			<Flex direction="row" gap="md" align="center">
				<Skeleton className="h-10 w-10 rounded-lg" />
				<Flex direction="col" gap="sm">
					<Skeleton className="h-5 w-24" />
					<Skeleton className="h-4 w-16" />
				</Flex>
			</Flex>
			<Skeleton className="h-8 w-8" />
		</Flex>
	)
}
