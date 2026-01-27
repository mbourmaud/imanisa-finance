import Link from 'next/link'
import type { ReactNode } from 'react'
import { ChevronRight, Flex } from '@/components'
import { MoneyDisplay } from '@/components/common/MoneyDisplay'

interface AccountRowLinkProps {
	accountId: string
	name: string
	badge: ReactNode
	memberAvatars?: ReactNode
	balance: number
}

/**
 * Clickable account row with balance display
 */
export function AccountRowLink({
	accountId,
	name,
	badge,
	memberAvatars,
	balance,
}: AccountRowLinkProps) {
	return (
		<Link
			href={`/dashboard/accounts/${accountId}`}
			className="flex items-center justify-between rounded-lg border border-border/40 bg-card p-3 transition-colors hover:bg-accent"
		>
			<Flex direction="row" gap="sm">
				<Flex direction="col" gap="xs">
					<Flex direction="row" gap="sm" align="center">
						<span className="text-sm font-medium">{name}</span>
						{badge}
					</Flex>
					{memberAvatars && <div className="mt-1.5">{memberAvatars}</div>}
				</Flex>
			</Flex>
			<Flex direction="row" gap="sm" align="center">
				<MoneyDisplay amount={balance} size="sm" weight="semibold" autoColor />
				<ChevronRight className="h-4 w-4 text-muted-foreground" />
			</Flex>
		</Link>
	)
}
