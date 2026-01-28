'use client';

import { useQuery } from '@tanstack/react-query';
import { useStore } from '@tanstack/react-store';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
	importFormSchema,
	useDeleteImportMutation,
	useImportsQuery,
	useProcessImportMutation,
	useReprocessImportMutation,
	useUploadImportMutation,
} from '@/features/imports';
import { useAppForm } from '@/lib/forms';

interface Bank {
	id: string;
	name: string;
	template: string | null;
	accountCount: number;
	accounts: {
		id: string;
		name: string;
		bankId: string;
		type: string;
		balance: number;
	}[];
}

export function useImportPage() {
	const [dragActive, setDragActive] = useState(false);
	const [deleteImportId, setDeleteImportId] = useState<string | null>(null);

	// Queries
	const {
		data: imports = [],
		isLoading: isLoadingImports,
		refetch: refetchImports,
	} = useImportsQuery();

	const { data: banksData, isLoading: isLoadingBanks } = useQuery<{ banks: Bank[] }>({
		queryKey: ['banks'],
		queryFn: async () => {
			const response = await fetch('/api/banks');
			if (!response.ok) throw new Error('Failed to fetch banks');
			return response.json();
		},
	});

	const banks = banksData?.banks ?? [];

	// Form
	const form = useAppForm({
		defaultValues: {
			bankId: '',
			accountId: '',
		},
		validators: {
			onChange: importFormSchema,
		},
	});

	const selectedBankId = useStore(form.store, (state) => state.values.bankId);
	const selectedAccountId = useStore(form.store, (state) => state.values.accountId);

	// Derived data
	const filteredAccounts = useMemo(() => {
		if (!selectedBankId) return [];
		const bank = banks.find((b) => b.id === selectedBankId);
		return bank?.accounts ?? [];
	}, [selectedBankId, banks]);

	const selectedBank = banks.find((b) => b.id === selectedBankId);

	// Mutations
	const uploadMutation = useUploadImportMutation();
	const processMutation = useProcessImportMutation();
	const reprocessMutation = useReprocessImportMutation();
	const deleteMutation = useDeleteImportMutation();

	// Computed
	const isUploading = uploadMutation.isPending;
	const isLoading = isLoadingImports || isLoadingBanks;
	const canUpload = selectedBankId && selectedAccountId && !isUploading;

	const pendingCount = imports.filter((i) => i.status === 'PENDING').length;
	const processedCount = imports.filter((i) => i.status === 'PROCESSED').length;
	const totalRecords = imports.reduce((sum, i) => sum + (i.recordsCount || 0), 0);

	const bankOptions = banks.map((bank) => ({
		value: bank.id,
		label: bank.template ? `${bank.name} (${bank.template})` : bank.name,
	}));

	const accountOptions = filteredAccounts.map((account) => ({
		value: account.id,
		label: `${account.name} (${account.type})`,
	}));

	const noBanksHelpText =
		banks.length === 0 && !isLoading
			? "Aucune banque configurée. Ajoutez d'abord une banque dans les paramètres."
			: undefined;

	const noAccountsHelpText =
		selectedBankId && filteredAccounts.length === 0
			? "Aucun compte pour cette banque. Ajoutez d'abord un compte."
			: undefined;

	const accountPlaceholder = selectedBankId
		? 'Sélectionner un compte...'
		: "Sélectionnez d'abord une banque";

	// Handlers
	const handleUpload = useCallback(
		async (file: File) => {
			const bankId = form.getFieldValue('bankId');
			const accountId = form.getFieldValue('accountId');

			if (!bankId) {
				toast.error('Veuillez sélectionner une banque');
				return;
			}

			if (!accountId) {
				toast.error('Veuillez sélectionner un compte');
				return;
			}

			const bankKey = selectedBank?.template || selectedBank?.name || 'other';

			try {
				await uploadMutation.mutateAsync({
					file,
					bankKey,
					accountId,
				});
				toast.success('Fichier importé avec succès');
			} catch (err) {
				toast.error(err instanceof Error ? err.message : "Échec de l'upload");
			}
		},
		[form, selectedBank, uploadMutation],
	);

	const handleFileSelect = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) {
				handleUpload(file);
			}
			e.target.value = '';
		},
		[handleUpload],
	);

	const handleDrag = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === 'dragenter' || e.type === 'dragover') {
			setDragActive(true);
		} else if (e.type === 'dragleave') {
			setDragActive(false);
		}
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setDragActive(false);

			const file = e.dataTransfer.files?.[0];
			if (file) {
				handleUpload(file);
			}
		},
		[handleUpload],
	);

	const handleProcess = useCallback(
		async (importId: string, accountId?: string) => {
			if (!accountId) return;
			try {
				await processMutation.mutateAsync({ importId, accountId });
				toast.success('Import traité avec succès');
			} catch (err) {
				toast.error(err instanceof Error ? err.message : 'Échec du traitement');
			}
		},
		[processMutation],
	);

	const handleReprocess = useCallback(
		async (importId: string, accountId?: string) => {
			if (!accountId) return;
			try {
				await reprocessMutation.mutateAsync({ importId, accountId });
				toast.success('Import retraité avec succès');
			} catch (err) {
				toast.error(err instanceof Error ? err.message : 'Échec du retraitement');
			}
		},
		[reprocessMutation],
	);

	const confirmDeleteImport = useCallback(async () => {
		if (!deleteImportId) return;

		try {
			await deleteMutation.mutateAsync({ importId: deleteImportId });
			toast.success('Import supprimé');
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Échec de la suppression');
		} finally {
			setDeleteImportId(null);
		}
	}, [deleteImportId, deleteMutation]);

	const getBankNameForImport = useCallback(
		(bankKey: string): string => {
			const bankByTemplate = banks.find((b) => b.template === bankKey);
			if (bankByTemplate) return bankByTemplate.name;

			const bankByName = banks.find((b) => b.name === bankKey);
			if (bankByName) return bankByName.name;

			return bankKey;
		},
		[banks],
	);

	const closeUploadError = useCallback(() => {
		uploadMutation.reset();
	}, [uploadMutation]);

	const onDeleteImportClick = useCallback((id: string) => {
		setDeleteImportId(id);
	}, []);

	const onDeleteImportDialogChange = useCallback((open: boolean) => {
		if (!open) setDeleteImportId(null);
	}, []);

	return {
		// Form
		form,
		selectedBankId,
		selectedAccountId,

		// Data
		imports,
		banks,
		filteredAccounts,

		// Options
		bankOptions,
		accountOptions,
		noBanksHelpText,
		noAccountsHelpText,
		accountPlaceholder,

		// State
		isLoading,
		isUploading,
		dragActive,
		canUpload,
		deleteImportId,

		// Stats
		pendingCount,
		processedCount,
		totalRecords,

		// Handlers
		handleFileSelect,
		handleDrag,
		handleDrop,
		handleProcess,
		handleReprocess,
		confirmDeleteImport,
		getBankNameForImport,
		refetchImports,
		onDeleteImportClick,
		onDeleteImportDialogChange,

		// Error state
		uploadError: uploadMutation.error?.message,
		closeUploadError,

		// Computed
		isDeleteDialogOpen: deleteImportId !== null,
	};
}
