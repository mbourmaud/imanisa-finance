'use client';

import {
	CoOwnershipFormDialog,
	LoanFormDialog,
	LoanInsuranceFormDialog,
	PropertyDeleteDialog,
	PropertyEditDialog,
	PropertyInsuranceFormDialog,
	UtilityContractFormDialog,
} from '@/components';
import type {
	CoOwnershipFormData,
	InsuranceFormData,
	LoanFormData,
	PropertyInsuranceFormData,
	PropertyWithDetails,
	UtilityContractFormData,
} from '@/features/properties';

interface Member {
	id: string;
	name: string;
	color: string | null;
}

interface DialogState<T> {
	isOpen: boolean;
	setOpen: (open: boolean) => void;
	formData: T;
	formError: string | null;
	isSubmitting: boolean;
	onInputChange: (field: keyof T, value: string) => void;
	onSubmit: (e: React.FormEvent) => Promise<void>;
	reset: () => void;
}

interface PropertyDetailDialogsProps {
	property: PropertyWithDetails;
	members: Member[];
	loadingMembers: boolean;
	formatCurrency: (amount: number) => string;
	loanDialog: DialogState<LoanFormData>;
	insuranceDialog: DialogState<InsuranceFormData>;
	propertyInsuranceDialog: DialogState<PropertyInsuranceFormData> & {
		isEditing: boolean;
	};
	coOwnershipDialog: DialogState<CoOwnershipFormData> & {
		isEditing: boolean;
	};
	utilityContractDialog: DialogState<UtilityContractFormData> & {
		isEditing: boolean;
	};
	propertyEditDialog: {
		isOpen: boolean;
		setOpen: (open: boolean) => void;
	};
	deletePropertyDialog: {
		isOpen: boolean;
		setOpen: (open: boolean) => void;
		isDeleting: boolean;
		onDelete: () => Promise<void>;
	};
}

export function PropertyDetailDialogs({
	property,
	members,
	loadingMembers,
	formatCurrency,
	loanDialog,
	insuranceDialog,
	propertyInsuranceDialog,
	coOwnershipDialog,
	utilityContractDialog,
	propertyEditDialog,
	deletePropertyDialog,
}: PropertyDetailDialogsProps) {
	return (
		<>
			<LoanFormDialog
				open={loanDialog.isOpen}
				onOpenChange={(open) => {
					loanDialog.setOpen(open);
					if (!open) loanDialog.reset();
				}}
				formData={loanDialog.formData}
				onInputChange={loanDialog.onInputChange}
				onSubmit={loanDialog.onSubmit}
				error={loanDialog.formError}
				isSubmitting={loanDialog.isSubmitting}
			/>

			<LoanInsuranceFormDialog
				open={insuranceDialog.isOpen}
				onOpenChange={(open) => {
					insuranceDialog.setOpen(open);
					if (!open) insuranceDialog.reset();
				}}
				formData={insuranceDialog.formData}
				onInputChange={insuranceDialog.onInputChange}
				onSubmit={insuranceDialog.onSubmit}
				error={insuranceDialog.formError}
				isSubmitting={insuranceDialog.isSubmitting}
				members={members}
				loadingMembers={loadingMembers}
			/>

			<PropertyInsuranceFormDialog
				open={propertyInsuranceDialog.isOpen}
				onOpenChange={(open) => {
					propertyInsuranceDialog.setOpen(open);
					if (!open) propertyInsuranceDialog.reset();
				}}
				formData={propertyInsuranceDialog.formData}
				onInputChange={propertyInsuranceDialog.onInputChange}
				onSubmit={propertyInsuranceDialog.onSubmit}
				error={propertyInsuranceDialog.formError}
				isSubmitting={propertyInsuranceDialog.isSubmitting}
				isEditing={propertyInsuranceDialog.isEditing}
				formatCurrency={formatCurrency}
			/>

			<CoOwnershipFormDialog
				open={coOwnershipDialog.isOpen}
				onOpenChange={(open) => {
					coOwnershipDialog.setOpen(open);
					if (!open) coOwnershipDialog.reset();
				}}
				formData={coOwnershipDialog.formData}
				onInputChange={coOwnershipDialog.onInputChange}
				onSubmit={coOwnershipDialog.onSubmit}
				error={coOwnershipDialog.formError}
				isSubmitting={coOwnershipDialog.isSubmitting}
				isEditing={coOwnershipDialog.isEditing}
				formatCurrency={formatCurrency}
			/>

			<UtilityContractFormDialog
				open={utilityContractDialog.isOpen}
				onOpenChange={(open) => {
					utilityContractDialog.setOpen(open);
					if (!open) utilityContractDialog.reset();
				}}
				formData={utilityContractDialog.formData}
				onInputChange={utilityContractDialog.onInputChange}
				onSubmit={utilityContractDialog.onSubmit}
				error={utilityContractDialog.formError}
				isSubmitting={utilityContractDialog.isSubmitting}
				isEditing={utilityContractDialog.isEditing}
				formatCurrency={formatCurrency}
			/>

			<PropertyEditDialog
				open={propertyEditDialog.isOpen}
				onOpenChange={propertyEditDialog.setOpen}
				property={property}
				members={members}
				loadingMembers={loadingMembers}
			/>

			<PropertyDeleteDialog
				open={deletePropertyDialog.isOpen}
				onOpenChange={deletePropertyDialog.setOpen}
				propertyName={property.name}
				onDelete={deletePropertyDialog.onDelete}
				isDeleting={deletePropertyDialog.isDeleting}
			/>
		</>
	);
}
