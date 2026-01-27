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
	MemberShare,
	PropertyFormData,
	PropertyInsuranceFormData,
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
	propertyName: string;
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
		formData: PropertyFormData;
		memberShares: MemberShare[];
		formError: string | null;
		isSubmitting: boolean;
		onInputChange: (field: keyof PropertyFormData, value: string) => void;
		onAddMember: () => void;
		onRemoveMember: (memberId: string) => void;
		onMemberChange: (index: number, memberId: string) => void;
		onShareChange: (index: number, share: number) => void;
		onSubmit: (e: React.FormEvent) => Promise<void>;
		reset: () => void;
	};
	deletePropertyDialog: {
		isOpen: boolean;
		setOpen: (open: boolean) => void;
		isDeleting: boolean;
		onDelete: () => Promise<void>;
	};
}

export function PropertyDetailDialogs({
	propertyName,
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
				onOpenChange={(open) => {
					propertyEditDialog.setOpen(open);
					if (!open) propertyEditDialog.reset();
				}}
				formData={propertyEditDialog.formData}
				memberShares={propertyEditDialog.memberShares}
				members={members}
				loadingMembers={loadingMembers}
				onInputChange={propertyEditDialog.onInputChange}
				onAddMember={propertyEditDialog.onAddMember}
				onRemoveMember={propertyEditDialog.onRemoveMember}
				onMemberChange={propertyEditDialog.onMemberChange}
				onShareChange={propertyEditDialog.onShareChange}
				onSubmit={propertyEditDialog.onSubmit}
				error={propertyEditDialog.formError}
				isSubmitting={propertyEditDialog.isSubmitting}
			/>

			<PropertyDeleteDialog
				open={deletePropertyDialog.isOpen}
				onOpenChange={deletePropertyDialog.setOpen}
				propertyName={propertyName}
				onDelete={deletePropertyDialog.onDelete}
				isDeleting={deletePropertyDialog.isDeleting}
			/>
		</>
	);
}
