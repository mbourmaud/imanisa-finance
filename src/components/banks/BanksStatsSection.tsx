import {
	CreditCard,
	Landmark,
	StatCard,
	StatCardGrid,
	StatCardSkeleton,
	Wallet,
} from '@/components'
import { formatMoney } from '@/shared/utils/currency'
import type { BanksSummary } from '@/features/banks'

interface BanksStatsSectionProps {
	summary: BanksSummary | undefined
	isLoading: boolean
}

export function BanksStatsSection({ summary, isLoading }: BanksStatsSectionProps) {
	if (isLoading) {
		return (
			<StatCardGrid columns={3}>
				<StatCardSkeleton />
				<StatCardSkeleton />
				<StatCardSkeleton />
			</StatCardGrid>
		)
	}

	return (
		<StatCardGrid columns={3}>
			<StatCard
				variant="gold"
				icon={Landmark}
				label="Banques"
				value={summary?.totalBanksUsed ?? 0}
				description={`/ ${summary?.totalBanksAvailable ?? 0}`}
			/>
			<StatCard
				variant="teal"
				icon={CreditCard}
				label="Comptes actifs"
				value={summary?.totalAccounts ?? 0}
			/>
			<StatCard
				variant="mint"
				icon={Wallet}
				label="Solde total"
				value={formatMoney(summary?.totalBalance ?? 0, 'EUR', 'fr-FR')}
			/>
		</StatCardGrid>
	)
}
