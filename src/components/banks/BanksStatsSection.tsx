import {
	CreditCard,
	Landmark,
	StatCard,
	StatCardGrid,
	StatCardSkeleton,
	Wallet,
} from '@/components';
import type { BanksSummary } from '@/features/banks';

interface BanksStatsSectionProps {
	summary: BanksSummary | undefined;
	loading: boolean;
	error: string | null;
}

export function BanksStatsSection({ summary, loading, error }: BanksStatsSectionProps) {
	if (loading) {
		return (
			<StatCardGrid columns={3}>
				<StatCardSkeleton variant="gold" />
				<StatCardSkeleton variant="teal" />
				<StatCardSkeleton variant="mint" />
			</StatCardGrid>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col gap-6">
				<span className="text-destructive">{error}</span>
			</div>
		);
	}

	const formattedBalance = new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'EUR',
	}).format(summary?.totalBalance ?? 0);

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
			<StatCard variant="mint" icon={Wallet} label="Solde total" value={formattedBalance} />
		</StatCardGrid>
	);
}
