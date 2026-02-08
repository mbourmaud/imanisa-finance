'use client';

import {
	Button,
	CreatePropertySheet,
	LoanProgressCard,
	PageHeader,
	Plus,
	PropertiesGrid,
	PropertiesStatsOverview,
} from '@/components';
import { formatCurrency, useRealEstatePage } from '@/features/properties';

export default function RealEstatePage() {
	const {
		properties,
		summary,
		isLoading,
		isError,
		refetch,
		members,
		isDialogOpen,
		setIsDialogOpen,
	} = useRealEstatePage();

	return (
		<>
			<PageHeader
				title="Biens immobiliers"
				actions={
					<Button onClick={() => setIsDialogOpen(true)}>
						<Plus className="h-4 w-4" />
						Ajouter un bien
					</Button>
				}
			/>

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
				isError={isError}
				onRetry={refetch}
				formatCurrency={formatCurrency}
				onAddClick={() => setIsDialogOpen(true)}
			/>

			<CreatePropertySheet
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				members={members}
			/>
		</>
	);
}
