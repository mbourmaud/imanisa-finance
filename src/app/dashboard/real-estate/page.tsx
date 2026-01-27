'use client';

import {
	CreatePropertyDialog,
	ErrorBanner,
	LoanProgressCard,
	PageHeader,
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
		error,
		members,
		isDialogOpen,
		setIsDialogOpen,
		formData,
		memberShares,
		formError,
		isSubmitting,
		onInputChange,
		onAddMember,
		onRemoveMember,
		onMemberChange,
		onShareChange,
		onSubmit,
		onReset,
	} = useRealEstatePage();

	return (
		<div className="flex flex-col gap-8">
			<PageHeader
				title="Immobilier"
				description="Gérez votre patrimoine immobilier"
				actions={
					<CreatePropertyDialog
						open={isDialogOpen}
						onOpenChange={setIsDialogOpen}
						formData={formData}
						memberShares={memberShares}
						members={members}
						formError={formError}
						isSubmitting={isSubmitting}
						onInputChange={onInputChange}
						onAddMember={onAddMember}
						onRemoveMember={onRemoveMember}
						onMemberChange={onMemberChange}
						onShareChange={onShareChange}
						onSubmit={onSubmit}
						onReset={onReset}
					/>
				}
			/>

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
		</div>
	);
}
