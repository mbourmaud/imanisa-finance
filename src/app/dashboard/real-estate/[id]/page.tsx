'use client';

import { useParams } from 'next/navigation';
import {
	PropertyCoOwnershipSection,
	PropertyDetailSheets,
	PropertyDetailHeader,
	PropertyDetailSkeleton,
	PropertyInfoSection,
	PropertyInsuranceSection,
	PropertyLoansSection,
	PropertyNotFoundState,
	PropertyOwnersSection,
	PropertyStatsSummary,
	PropertyUtilityContractsSection,
} from '@/components';
import { formatCurrency, usePropertyDetailPage } from '@/features/properties';

export default function PropertyDetailPage() {
	const params = useParams();
	const propertyId = params.id as string;

	const {
		property,
		loading,
		error,
		members,
		loadingMembers,
		computedValues,
		loanDialog,
		insuranceDialog,
		propertyInsuranceDialog,
		coOwnershipDialog,
		utilityContractDialog,
		propertyEditDialog,
		deletePropertyDialog,
	} = usePropertyDetailPage(propertyId);

	if (loading) {
		return <PropertyDetailSkeleton />;
	}

	if (error || !property) {
		return <PropertyNotFoundState error={error} />;
	}

	return (
		<>
			<PropertyDetailHeader
				name={property.name}
				type={property.type}
				usage={property.usage}
				address={property.address}
				address2={property.address2}
				postalCode={property.postalCode}
				city={property.city}
				onEdit={() => propertyEditDialog.setOpen(true)}
				onDeleteClick={() => deletePropertyDialog.setOpen(true)}
			/>

			<PropertyStatsSummary
				currentValue={property.currentValue}
				purchasePrice={property.purchasePrice}
				equity={computedValues?.equity ?? 0}
				totalLoansRemaining={computedValues?.totalLoansRemaining ?? 0}
				totalInvestment={computedValues?.totalInvestment ?? 0}
				loansCount={property._count.loans}
			/>

			<PropertyInfoSection
				surface={property.surface}
				rooms={property.rooms}
				bedrooms={property.bedrooms}
				purchasePrice={property.purchasePrice}
				notaryFees={property.notaryFees}
				agencyFees={property.agencyFees}
				purchaseDate={property.purchaseDate}
				currentValue={property.currentValue}
				rentAmount={property.rentAmount}
				rentCharges={property.rentCharges}
				usage={property.usage}
				notes={property.notes}
			/>

			<PropertyOwnersSection propertyMembers={property.propertyMembers} />

			<PropertyLoansSection
				loans={property.loans}
				onAddLoan={() => loanDialog.setOpen(true)}
				onAddInsurance={insuranceDialog.openForLoan}
				onDeleteLoan={loanDialog.onDelete}
				deletingLoanId={loanDialog.deletingLoanId}
			/>

			<PropertyInsuranceSection
				insurance={property.insurance}
				onAdd={() => propertyInsuranceDialog.open(false)}
				onEdit={() => propertyInsuranceDialog.open(true)}
				onDelete={propertyInsuranceDialog.onDelete}
				isDeleting={propertyInsuranceDialog.isDeleting}
			/>

			<PropertyCoOwnershipSection
				coOwnership={property.coOwnership}
				onAdd={() => coOwnershipDialog.open(false)}
				onEdit={() => coOwnershipDialog.open(true)}
				onDelete={coOwnershipDialog.onDelete}
				isDeleting={coOwnershipDialog.isDeleting}
			/>

			<PropertyUtilityContractsSection
				contracts={property.utilityContracts}
				onAddContract={() => utilityContractDialog.open()}
				onEditContract={utilityContractDialog.open}
				onDeleteContract={utilityContractDialog.onDelete}
				deletingContractId={utilityContractDialog.deletingContractId}
			/>

			<PropertyDetailSheets
				property={property}
				members={members}
				loadingMembers={loadingMembers}
				formatCurrency={formatCurrency}
				loanDialog={loanDialog}
				insuranceDialog={insuranceDialog}
				propertyInsuranceDialog={propertyInsuranceDialog}
				coOwnershipDialog={coOwnershipDialog}
				utilityContractDialog={utilityContractDialog}
				propertyEditDialog={propertyEditDialog}
				deletePropertyDialog={deletePropertyDialog}
			/>
		</>
	);
}
