'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
	useCreateLoanInsuranceMutation,
	useCreateLoanMutation,
	useDeleteLoanMutation,
} from '@/features/loans';
import { useMembersQuery } from '@/features/members/hooks/use-members-query';
import {
	type CoOwnershipFormData,
	type InsuranceFormData,
	type LoanFormData,
	type PropertyInsuranceFormData,
	type UtilityContractFormData,
	initialCoOwnershipFormData,
	initialInsuranceFormData,
	initialLoanFormData,
	initialPropertyInsuranceFormData,
	initialUtilityContractFormData,
} from '../types/form-types';
import type {
	InsuranceType,
	UtilityContract,
	UtilityType,
} from '../types';
import {
	useCreateCoOwnershipMutation,
	useCreatePropertyInsuranceMutation,
	useCreateUtilityContractMutation,
	useDeleteCoOwnershipMutation,
	useDeletePropertyInsuranceMutation,
	useDeletePropertyMutation,
	useDeleteUtilityContractMutation,
	usePropertyQuery,
	useUpdateCoOwnershipMutation,
	useUpdatePropertyInsuranceMutation,
	useUpdateUtilityContractMutation,
} from '..';

export function usePropertyDetailPage(propertyId: string) {
	const router = useRouter();

	// TanStack Query hooks
	const {
		data: property,
		isLoading: loading,
		isError,
		error: queryError,
	} = usePropertyQuery(propertyId);
	const { data: members = [], isLoading: loadingMembers } = useMembersQuery();
	const error = isError
		? queryError instanceof Error
			? queryError.message
			: 'Une erreur est survenue'
		: null;

	// Mutations
	const createLoanMutation = useCreateLoanMutation();
	const createLoanInsuranceMutation = useCreateLoanInsuranceMutation();
	const deleteLoanMutation = useDeleteLoanMutation();
	const deletePropertyMutation = useDeletePropertyMutation();
	const createPropertyInsuranceMutation = useCreatePropertyInsuranceMutation();
	const updatePropertyInsuranceMutation = useUpdatePropertyInsuranceMutation();
	const deletePropertyInsuranceMutation = useDeletePropertyInsuranceMutation();
	const createCoOwnershipMutation = useCreateCoOwnershipMutation();
	const updateCoOwnershipMutation = useUpdateCoOwnershipMutation();
	const deleteCoOwnershipMutation = useDeleteCoOwnershipMutation();
	const createUtilityContractMutation = useCreateUtilityContractMutation();
	const updateUtilityContractMutation = useUpdateUtilityContractMutation();
	const deleteUtilityContractMutation = useDeleteUtilityContractMutation();

	// Dialog states
	const [isLoanDialogOpen, setIsLoanDialogOpen] = useState(false);
	const [loanFormData, setLoanFormData] = useState<LoanFormData>(initialLoanFormData);
	const [loanFormError, setLoanFormError] = useState<string | null>(null);

	const [isInsuranceDialogOpen, setIsInsuranceDialogOpen] = useState(false);
	const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
	const [insuranceFormData, setInsuranceFormData] =
		useState<InsuranceFormData>(initialInsuranceFormData);
	const [insuranceFormError, setInsuranceFormError] = useState<string | null>(null);

	const [isPropertyInsuranceDialogOpen, setIsPropertyInsuranceDialogOpen] = useState(false);
	const [isEditingPropertyInsurance, setIsEditingPropertyInsurance] = useState(false);
	const [propertyInsuranceFormData, setPropertyInsuranceFormData] =
		useState<PropertyInsuranceFormData>(initialPropertyInsuranceFormData);
	const [propertyInsuranceFormError, setPropertyInsuranceFormError] = useState<string | null>(null);

	const [isCoOwnershipDialogOpen, setIsCoOwnershipDialogOpen] = useState(false);
	const [isEditingCoOwnership, setIsEditingCoOwnership] = useState(false);
	const [coOwnershipFormData, setCoOwnershipFormData] = useState<CoOwnershipFormData>(
		initialCoOwnershipFormData,
	);
	const [coOwnershipFormError, setCoOwnershipFormError] = useState<string | null>(null);

	const [isUtilityContractDialogOpen, setIsUtilityContractDialogOpen] = useState(false);
	const [editingUtilityContractId, setEditingUtilityContractId] = useState<string | null>(null);
	const [utilityContractFormData, setUtilityContractFormData] = useState<UtilityContractFormData>(
		initialUtilityContractFormData,
	);
	const [utilityContractFormError, setUtilityContractFormError] = useState<string | null>(null);
	const [deletingUtilityContractId, setDeletingUtilityContractId] = useState<string | null>(null);

	const [deletingLoanId, setDeletingLoanId] = useState<string | null>(null);

	const [isEditPropertyDialogOpen, setIsEditPropertyDialogOpen] = useState(false);

	const [showDeletePropertyDialog, setShowDeletePropertyDialog] = useState(false);

	// Derived mutation states
	const isSubmittingLoan = createLoanMutation.isPending;
	const isSubmittingInsurance = createLoanInsuranceMutation.isPending;
	const isSubmittingPropertyInsurance =
		createPropertyInsuranceMutation.isPending || updatePropertyInsuranceMutation.isPending;
	const isDeletingPropertyInsurance = deletePropertyInsuranceMutation.isPending;
	const isSubmittingCoOwnership =
		createCoOwnershipMutation.isPending || updateCoOwnershipMutation.isPending;
	const isDeletingCoOwnership = deleteCoOwnershipMutation.isPending;
	const isSubmittingUtilityContract =
		createUtilityContractMutation.isPending || updateUtilityContractMutation.isPending;
	const isDeletingProperty = deletePropertyMutation.isPending;

	// =============================================================================
	// FORM HANDLERS
	// =============================================================================

	// Loan form handlers
	const handleLoanInputChange = (field: keyof LoanFormData, value: string) => {
		setLoanFormData((prev) => ({ ...prev, [field]: value }));
	};

	const resetLoanForm = () => {
		setLoanFormData(initialLoanFormData);
		setLoanFormError(null);
	};

	const handleLoanSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoanFormError(null);

		try {
			if (!loanFormData.name.trim()) throw new Error('Le nom du prêt est requis');
			if (!loanFormData.initialAmount) throw new Error('Le montant initial est requis');
			if (!loanFormData.remainingAmount) throw new Error('Le capital restant est requis');
			if (!loanFormData.rate) throw new Error('Le taux est requis');
			if (!loanFormData.monthlyPayment) throw new Error('La mensualité est requise');
			if (!loanFormData.startDate) throw new Error('La date de début est requise');

			const initialAmount = Number.parseFloat(loanFormData.initialAmount);
			const remainingAmount = Number.parseFloat(loanFormData.remainingAmount);
			const rate = Number.parseFloat(loanFormData.rate);
			const monthlyPayment = Number.parseFloat(loanFormData.monthlyPayment);

			if (remainingAmount > initialAmount)
				throw new Error('Le capital restant ne peut pas dépasser le montant initial');
			if (rate < 0 || rate > 100) throw new Error('Le taux doit être entre 0 et 100');

			await createLoanMutation.mutateAsync({
				propertyId,
				input: {
					name: loanFormData.name.trim(),
					lender: loanFormData.lender.trim() || null,
					loanNumber: loanFormData.loanNumber.trim() || null,
					initialAmount,
					remainingAmount,
					rate,
					monthlyPayment,
					startDate: loanFormData.startDate,
					endDate: loanFormData.endDate || null,
					notes: loanFormData.notes.trim() || null,
				},
			});

			setIsLoanDialogOpen(false);
			resetLoanForm();
		} catch (err) {
			setLoanFormError(err instanceof Error ? err.message : 'Une erreur est survenue');
		}
	};

	const handleDeleteLoan = async (loanId: string) => {
		setDeletingLoanId(loanId);
		try {
			await deleteLoanMutation.mutateAsync({ id: loanId, propertyId });
		} catch {
			// Loan deletion failed silently
		} finally {
			setDeletingLoanId(null);
		}
	};

	// Insurance form handlers
	const handleOpenInsuranceDialog = (loanId: string) => {
		setSelectedLoanId(loanId);
		setIsInsuranceDialogOpen(true);
	};

	const handleInsuranceInputChange = (field: keyof InsuranceFormData, value: string) => {
		setInsuranceFormData((prev) => ({ ...prev, [field]: value }));
	};

	const resetInsuranceForm = () => {
		setInsuranceFormData(initialInsuranceFormData);
		setInsuranceFormError(null);
		setSelectedLoanId(null);
	};

	const handleInsuranceSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setInsuranceFormError(null);

		try {
			if (!insuranceFormData.memberId) throw new Error('Le membre est requis');
			if (!insuranceFormData.name.trim()) throw new Error("Le nom de l'assurance est requis");
			if (!insuranceFormData.provider.trim()) throw new Error("L'assureur est requis");
			if (!insuranceFormData.coveragePercent) throw new Error('Le taux de couverture est requis');
			if (!insuranceFormData.monthlyPremium) throw new Error('La prime mensuelle est requise');

			const coveragePercent = Number.parseFloat(insuranceFormData.coveragePercent);
			const monthlyPremium = Number.parseFloat(insuranceFormData.monthlyPremium);

			if (coveragePercent < 0 || coveragePercent > 100)
				throw new Error('Le taux de couverture doit être entre 0 et 100');
			if (monthlyPremium < 0) throw new Error('La prime mensuelle ne peut pas être négative');
			if (!selectedLoanId) throw new Error('Aucun prêt sélectionné');

			await createLoanInsuranceMutation.mutateAsync({
				loanId: selectedLoanId,
				propertyId,
				input: {
					memberId: insuranceFormData.memberId,
					name: insuranceFormData.name.trim(),
					provider: insuranceFormData.provider.trim(),
					contractNumber: insuranceFormData.contractNumber.trim() || null,
					coveragePercent,
					monthlyPremium,
					link: insuranceFormData.link.trim() || null,
					notes: insuranceFormData.notes.trim() || null,
				},
			});

			setIsInsuranceDialogOpen(false);
			resetInsuranceForm();
		} catch (err) {
			setInsuranceFormError(err instanceof Error ? err.message : 'Une erreur est survenue');
		}
	};

	// Property insurance form handlers
	const handlePropertyInsuranceInputChange = (
		field: keyof PropertyInsuranceFormData,
		value: string,
	) => {
		setPropertyInsuranceFormData((prev) => ({ ...prev, [field]: value }));
	};

	const resetPropertyInsuranceForm = () => {
		setPropertyInsuranceFormData(initialPropertyInsuranceFormData);
		setPropertyInsuranceFormError(null);
		setIsEditingPropertyInsurance(false);
	};

	const openPropertyInsuranceDialog = (editMode: boolean) => {
		if (editMode && property?.insurance) {
			setPropertyInsuranceFormData({
				type: property.insurance.type,
				provider: property.insurance.provider,
				contractNumber: property.insurance.contractNumber || '',
				monthlyPremium: property.insurance.monthlyPremium.toString(),
				startDate: property.insurance.startDate
					? new Date(property.insurance.startDate).toISOString().split('T')[0]
					: '',
				endDate: property.insurance.endDate
					? new Date(property.insurance.endDate).toISOString().split('T')[0]
					: '',
				coverage: property.insurance.coverage || '',
				link: property.insurance.link || '',
				notes: property.insurance.notes || '',
			});
			setIsEditingPropertyInsurance(true);
		} else {
			resetPropertyInsuranceForm();
		}
		setIsPropertyInsuranceDialogOpen(true);
	};

	const handlePropertyInsuranceSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setPropertyInsuranceFormError(null);

		try {
			if (!propertyInsuranceFormData.type) throw new Error("Le type d'assurance est requis");
			if (!propertyInsuranceFormData.provider.trim()) throw new Error("L'assureur est requis");
			if (!propertyInsuranceFormData.monthlyPremium)
				throw new Error('La prime mensuelle est requise');
			if (!propertyInsuranceFormData.startDate) throw new Error('La date de début est requise');

			const monthlyPremium = Number.parseFloat(propertyInsuranceFormData.monthlyPremium);
			if (monthlyPremium < 0) throw new Error('La prime mensuelle ne peut pas être négative');

			const input = {
				type: propertyInsuranceFormData.type as InsuranceType,
				provider: propertyInsuranceFormData.provider.trim(),
				contractNumber: propertyInsuranceFormData.contractNumber.trim() || null,
				monthlyPremium,
				startDate: propertyInsuranceFormData.startDate,
				endDate: propertyInsuranceFormData.endDate || null,
				coverage: propertyInsuranceFormData.coverage.trim() || null,
				link: propertyInsuranceFormData.link.trim() || null,
				notes: propertyInsuranceFormData.notes.trim() || null,
			};

			if (isEditingPropertyInsurance) {
				await updatePropertyInsuranceMutation.mutateAsync({ propertyId, input });
			} else {
				await createPropertyInsuranceMutation.mutateAsync({ propertyId, input });
			}

			setIsPropertyInsuranceDialogOpen(false);
			resetPropertyInsuranceForm();
		} catch (err) {
			setPropertyInsuranceFormError(err instanceof Error ? err.message : 'Une erreur est survenue');
		}
	};

	const handleDeletePropertyInsurance = async () => {
		try {
			await deletePropertyInsuranceMutation.mutateAsync(propertyId);
		} catch {
			// Property insurance deletion failed silently
		}
	};

	// Co-ownership form handlers
	const handleCoOwnershipInputChange = (field: keyof CoOwnershipFormData, value: string) => {
		setCoOwnershipFormData((prev) => ({ ...prev, [field]: value }));
	};

	const resetCoOwnershipForm = () => {
		setCoOwnershipFormData(initialCoOwnershipFormData);
		setCoOwnershipFormError(null);
		setIsEditingCoOwnership(false);
	};

	const openCoOwnershipDialog = (editMode: boolean) => {
		if (editMode && property?.coOwnership) {
			setCoOwnershipFormData({
				name: property.coOwnership.name,
				quarterlyAmount: property.coOwnership.quarterlyAmount.toString(),
				link: property.coOwnership.link || '',
				notes: property.coOwnership.notes || '',
			});
			setIsEditingCoOwnership(true);
		} else {
			resetCoOwnershipForm();
		}
		setIsCoOwnershipDialogOpen(true);
	};

	const handleCoOwnershipSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setCoOwnershipFormError(null);

		try {
			if (!coOwnershipFormData.name.trim()) throw new Error('Le nom du syndic est requis');
			if (!coOwnershipFormData.quarterlyAmount)
				throw new Error('Le montant trimestriel est requis');

			const quarterlyAmount = Number.parseFloat(coOwnershipFormData.quarterlyAmount);
			if (quarterlyAmount < 0) throw new Error('Le montant trimestriel ne peut pas être négatif');

			const input = {
				name: coOwnershipFormData.name.trim(),
				quarterlyAmount,
				link: coOwnershipFormData.link.trim() || null,
				notes: coOwnershipFormData.notes.trim() || null,
			};

			if (isEditingCoOwnership) {
				await updateCoOwnershipMutation.mutateAsync({ propertyId, input });
			} else {
				await createCoOwnershipMutation.mutateAsync({ propertyId, input });
			}

			setIsCoOwnershipDialogOpen(false);
			resetCoOwnershipForm();
		} catch (err) {
			setCoOwnershipFormError(err instanceof Error ? err.message : 'Une erreur est survenue');
		}
	};

	const handleDeleteCoOwnership = async () => {
		try {
			await deleteCoOwnershipMutation.mutateAsync(propertyId);
		} catch {
			// Co-ownership deletion failed silently
		}
	};

	// Utility contract form handlers
	const handleUtilityContractInputChange = (
		field: keyof UtilityContractFormData,
		value: string,
	) => {
		setUtilityContractFormData((prev) => ({ ...prev, [field]: value }));
	};

	const resetUtilityContractForm = () => {
		setUtilityContractFormData(initialUtilityContractFormData);
		setUtilityContractFormError(null);
		setEditingUtilityContractId(null);
	};

	const openUtilityContractDialog = (contract?: UtilityContract) => {
		if (contract) {
			setUtilityContractFormData({
				type: contract.type,
				provider: contract.provider,
				contractNumber: contract.contractNumber || '',
				monthlyAmount: contract.monthlyAmount.toString(),
				link: contract.link || '',
				notes: contract.notes || '',
			});
			setEditingUtilityContractId(contract.id);
		} else {
			resetUtilityContractForm();
		}
		setIsUtilityContractDialogOpen(true);
	};

	const handleUtilityContractSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setUtilityContractFormError(null);

		try {
			if (!utilityContractFormData.type) throw new Error('Le type de contrat est requis');
			if (!utilityContractFormData.provider.trim()) throw new Error('Le fournisseur est requis');
			if (!utilityContractFormData.monthlyAmount) throw new Error('Le montant mensuel est requis');

			const monthlyAmount = Number.parseFloat(utilityContractFormData.monthlyAmount);
			if (monthlyAmount < 0) throw new Error('Le montant mensuel ne peut pas être négatif');

			const input = {
				type: utilityContractFormData.type as UtilityType,
				provider: utilityContractFormData.provider.trim(),
				contractNumber: utilityContractFormData.contractNumber.trim() || null,
				monthlyAmount,
				link: utilityContractFormData.link.trim() || null,
				notes: utilityContractFormData.notes.trim() || null,
			};

			if (editingUtilityContractId) {
				await updateUtilityContractMutation.mutateAsync({
					id: editingUtilityContractId,
					propertyId,
					input,
				});
			} else {
				await createUtilityContractMutation.mutateAsync({ propertyId, input });
			}

			setIsUtilityContractDialogOpen(false);
			resetUtilityContractForm();
		} catch (err) {
			setUtilityContractFormError(err instanceof Error ? err.message : 'Une erreur est survenue');
		}
	};

	const handleDeleteUtilityContract = async (contractId: string) => {
		setDeletingUtilityContractId(contractId);
		try {
			await deleteUtilityContractMutation.mutateAsync({ id: contractId, propertyId });
		} catch {
			// Utility contract deletion failed silently
		} finally {
			setDeletingUtilityContractId(null);
		}
	};

	// Delete property handler
	const handleDeleteProperty = async () => {
		try {
			await deletePropertyMutation.mutateAsync(propertyId);
			router.push('/dashboard/real-estate');
		} catch {
			setShowDeletePropertyDialog(false);
		}
	};

	// =============================================================================
	// COMPUTED VALUES
	// =============================================================================

	const computedValues = property
		? {
				totalLoansRemaining: property.loans.reduce((sum, loan) => sum + loan.remainingAmount, 0),
				totalInvestment: property.purchasePrice + property.notaryFees + (property.agencyFees || 0),
				get equity() {
					return property.currentValue - this.totalLoansRemaining;
				},
			}
		: null;

	return {
		// Query data
		property,
		loading,
		error,
		members,
		loadingMembers,

		// Computed values
		computedValues,

		// Loan dialog
		loanDialog: {
			isOpen: isLoanDialogOpen,
			setOpen: setIsLoanDialogOpen,
			formData: loanFormData,
			formError: loanFormError,
			isSubmitting: isSubmittingLoan,
			onInputChange: handleLoanInputChange,
			onSubmit: handleLoanSubmit,
			onDelete: handleDeleteLoan,
			deletingLoanId,
			reset: resetLoanForm,
		},

		// Insurance dialog (loan insurance)
		insuranceDialog: {
			isOpen: isInsuranceDialogOpen,
			setOpen: setIsInsuranceDialogOpen,
			formData: insuranceFormData,
			formError: insuranceFormError,
			isSubmitting: isSubmittingInsurance,
			onInputChange: handleInsuranceInputChange,
			onSubmit: handleInsuranceSubmit,
			reset: resetInsuranceForm,
			openForLoan: handleOpenInsuranceDialog,
		},

		// Property insurance dialog
		propertyInsuranceDialog: {
			isOpen: isPropertyInsuranceDialogOpen,
			setOpen: setIsPropertyInsuranceDialogOpen,
			formData: propertyInsuranceFormData,
			formError: propertyInsuranceFormError,
			isSubmitting: isSubmittingPropertyInsurance,
			isEditing: isEditingPropertyInsurance,
			isDeleting: isDeletingPropertyInsurance,
			onInputChange: handlePropertyInsuranceInputChange,
			onSubmit: handlePropertyInsuranceSubmit,
			onDelete: handleDeletePropertyInsurance,
			reset: resetPropertyInsuranceForm,
			open: openPropertyInsuranceDialog,
		},

		// Co-ownership dialog
		coOwnershipDialog: {
			isOpen: isCoOwnershipDialogOpen,
			setOpen: setIsCoOwnershipDialogOpen,
			formData: coOwnershipFormData,
			formError: coOwnershipFormError,
			isSubmitting: isSubmittingCoOwnership,
			isEditing: isEditingCoOwnership,
			isDeleting: isDeletingCoOwnership,
			onInputChange: handleCoOwnershipInputChange,
			onSubmit: handleCoOwnershipSubmit,
			onDelete: handleDeleteCoOwnership,
			reset: resetCoOwnershipForm,
			open: openCoOwnershipDialog,
		},

		// Utility contract dialog
		utilityContractDialog: {
			isOpen: isUtilityContractDialogOpen,
			setOpen: setIsUtilityContractDialogOpen,
			formData: utilityContractFormData,
			formError: utilityContractFormError,
			isSubmitting: isSubmittingUtilityContract,
			isEditing: !!editingUtilityContractId,
			deletingContractId: deletingUtilityContractId,
			onInputChange: handleUtilityContractInputChange,
			onSubmit: handleUtilityContractSubmit,
			onDelete: handleDeleteUtilityContract,
			reset: resetUtilityContractForm,
			open: openUtilityContractDialog,
		},

		// Property edit dialog
		propertyEditDialog: {
			isOpen: isEditPropertyDialogOpen,
			setOpen: setIsEditPropertyDialogOpen,
		},

		// Delete property dialog
		deletePropertyDialog: {
			isOpen: showDeletePropertyDialog,
			setOpen: setShowDeletePropertyDialog,
			isDeleting: isDeletingProperty,
			onDelete: handleDeleteProperty,
		},
	};
}

export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: 0,
	}).format(amount);
}
