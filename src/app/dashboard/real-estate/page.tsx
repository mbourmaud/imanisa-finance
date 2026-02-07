'use client';

import {
	CreatePropertySheet,
	ErrorBanner,
	LoanProgressCard,
	PropertiesGrid,
	PropertiesStatsOverview,
} from '@/components';
import { formatCurrency, useRealEstatePage } from '@/features/properties';
import { usePageHeader } from '@/shared/hooks';

export default function RealEstatePage() {
	const {
		properties,
		summary,
		isLoading,
		isError,
		error,
		members,
		isDialogOpen,
		setIsDialogOpen,
	} = useRealEstatePage();

	usePageHeader(
		'Immobilier',
		undefined,
		<CreatePropertySheet
			open={isDialogOpen}
			onOpenChange={setIsDialogOpen}
			members={members}
		/>,
	);

	return (
		<>
			{isError && (
				<ErrorBanner message={error instanceof Error ? error.message : 'Une erreur est survenue'} />
			)}

			<PropertiesStatsOverview
				summary={summary}
				isLoading={isLoading}
				formatCurrency={formatCurrency}
			/>

			{!isLoading && summary && summary.totalValue > 0 && (
				<LoanProgressCard
					loansRemaining={summary.totalLoansRemaining}
					totalValue={summary.totalValue}
					equity={summary.totalEquity}
					formatCurrency={formatCurrency}
				/>
			)}

			<PropertiesGrid
				properties={properties}
				isLoading={isLoading}
				formatCurrency={formatCurrency}
				onAddClick={() => setIsDialogOpen(true)}
			/>
		</>
	);
}
