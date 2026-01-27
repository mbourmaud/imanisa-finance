'use client';

import { useState } from 'react';
import { useMembersQuery } from '@/features/members/hooks/use-members-query';
import type { MemberShare, PropertyFormData, PropertyType, PropertyUsage } from '../types';
import { initialPropertyFormData } from '../types/form-types';
import { useCreatePropertyMutation, usePropertiesQuery } from '..';

export function useRealEstatePage() {
	// TanStack Query hooks
	const { data, isLoading, isError, error } = usePropertiesQuery();
	const { data: members = [] } = useMembersQuery();
	const createPropertyMutation = useCreatePropertyMutation();

	// Dialog state
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [formData, setFormData] = useState<PropertyFormData>(initialPropertyFormData);
	const [memberShares, setMemberShares] = useState<MemberShare[]>([]);
	const [formError, setFormError] = useState<string | null>(null);

	// Derived data from query
	const properties = data?.properties ?? [];
	const summary = data?.summary ?? null;

	const handleInputChange = (field: keyof PropertyFormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleAddMember = () => {
		const availableMembers = members.filter(
			(m) => !memberShares.some((ms) => ms.memberId === m.id),
		);
		if (availableMembers.length > 0) {
			setMemberShares((prev) => [
				...prev,
				{ memberId: availableMembers[0].id, ownershipShare: 100 },
			]);
		}
	};

	const handleRemoveMember = (memberId: string) => {
		setMemberShares((prev) => prev.filter((ms) => ms.memberId !== memberId));
	};

	const handleMemberChange = (index: number, memberId: string) => {
		setMemberShares((prev) => prev.map((ms, i) => (i === index ? { ...ms, memberId } : ms)));
	};

	const handleShareChange = (index: number, share: number) => {
		setMemberShares((prev) =>
			prev.map((ms, i) => (i === index ? { ...ms, ownershipShare: share } : ms)),
		);
	};

	const resetForm = () => {
		setFormData(initialPropertyFormData);
		setMemberShares([]);
		setFormError(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError(null);

		try {
			// Validate required fields
			if (!formData.name.trim()) throw new Error('Le nom est requis');
			if (!formData.type) throw new Error('Le type est requis');
			if (!formData.usage) throw new Error("L'usage est requis");
			if (!formData.address.trim()) throw new Error("L'adresse est requise");
			if (!formData.city.trim()) throw new Error('La ville est requise');
			if (!formData.postalCode.trim()) throw new Error('Le code postal est requis');
			if (!formData.surface) throw new Error('La surface est requise');
			if (!formData.purchasePrice) throw new Error("Le prix d'achat est requis");
			if (!formData.purchaseDate) throw new Error("La date d'achat est requise");
			if (!formData.notaryFees) throw new Error('Les frais de notaire sont requis');
			if (!formData.currentValue) throw new Error('La valeur actuelle est requise');

			// Validate member shares total to 100%
			if (memberShares.length > 0) {
				const totalShare = memberShares.reduce((sum, ms) => sum + ms.ownershipShare, 0);
				if (totalShare !== 100) {
					throw new Error('La somme des parts de propriété doit être égale à 100%');
				}
			}

			await createPropertyMutation.mutateAsync({
				name: formData.name.trim(),
				type: formData.type as PropertyType,
				usage: formData.usage as PropertyUsage,
				address: formData.address.trim(),
				address2: formData.address2.trim() || null,
				city: formData.city.trim(),
				postalCode: formData.postalCode.trim(),
				surface: Number.parseFloat(formData.surface),
				rooms: formData.rooms ? Number.parseInt(formData.rooms, 10) : null,
				bedrooms: formData.bedrooms ? Number.parseInt(formData.bedrooms, 10) : null,
				purchasePrice: Number.parseFloat(formData.purchasePrice),
				purchaseDate: formData.purchaseDate,
				notaryFees: Number.parseFloat(formData.notaryFees),
				agencyFees: formData.agencyFees ? Number.parseFloat(formData.agencyFees) : null,
				currentValue: Number.parseFloat(formData.currentValue),
				rentAmount: formData.rentAmount ? Number.parseFloat(formData.rentAmount) : null,
				rentCharges: formData.rentCharges ? Number.parseFloat(formData.rentCharges) : null,
				notes: formData.notes.trim() || null,
				memberShares: memberShares.length > 0 ? memberShares : undefined,
			});

			// Success - close dialog and reset form
			setIsDialogOpen(false);
			resetForm();
		} catch (err) {
			setFormError(err instanceof Error ? err.message : 'Une erreur est survenue');
		}
	};

	return {
		// Query state
		properties,
		summary,
		isLoading,
		isError,
		error,

		// Members
		members,

		// Dialog state
		isDialogOpen,
		setIsDialogOpen,
		formData,
		memberShares,
		formError,
		isSubmitting: createPropertyMutation.isPending,

		// Form handlers
		onInputChange: handleInputChange,
		onAddMember: handleAddMember,
		onRemoveMember: handleRemoveMember,
		onMemberChange: handleMemberChange,
		onShareChange: handleShareChange,
		onSubmit: handleSubmit,
		onReset: resetForm,
	};
}
