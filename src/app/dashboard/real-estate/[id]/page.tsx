'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
	CoOwnershipFormDialog,
	Flex,
	LoanFormDialog,
	LoanInsuranceFormDialog,
	PropertyCoOwnershipSection,
	PropertyDeleteDialog,
	PropertyDetailHeader,
	PropertyDetailSkeleton,
	PropertyEditDialog,
	PropertyInfoSection,
	PropertyInsuranceFormDialog,
	PropertyInsuranceSection,
	PropertyLoansSection,
	PropertyNotFoundState,
	PropertyOwnersSection,
	PropertyStatsSummary,
	PropertyUtilityContractsSection,
	UtilityContractFormDialog,
} from '@/components'
import { useCreateLoanInsuranceMutation, useCreateLoanMutation } from '@/features/loans'
import { useMembersQuery } from '@/features/members/hooks/use-members-query'
import type {
	Loan,
	MemberShare,
	UtilityContract as PropertyUtilityContract,
} from '@/features/properties'
import {
	type InsuranceType,
	type PropertyType,
	type PropertyUsage,
	type UtilityType,
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
	useUpdatePropertyMutation,
	useUpdateUtilityContractMutation,
} from '@/features/properties'

// =============================================================================
// FORM DATA TYPES
// =============================================================================

interface LoanFormData {
	name: string
	lender: string
	loanNumber: string
	initialAmount: string
	remainingAmount: string
	rate: string
	monthlyPayment: string
	startDate: string
	endDate: string
	notes: string
}

interface InsuranceFormData {
	memberId: string
	name: string
	provider: string
	contractNumber: string
	coveragePercent: string
	monthlyPremium: string
	link: string
	notes: string
}

interface PropertyInsuranceFormData {
	type: InsuranceType | ''
	provider: string
	contractNumber: string
	monthlyPremium: string
	startDate: string
	endDate: string
	coverage: string
	link: string
	notes: string
}

interface CoOwnershipFormData {
	name: string
	quarterlyAmount: string
	link: string
	notes: string
}

interface UtilityContractFormData {
	type: UtilityType | ''
	provider: string
	contractNumber: string
	monthlyAmount: string
	link: string
	notes: string
}

interface PropertyFormData {
	name: string
	type: PropertyType | ''
	usage: PropertyUsage | ''
	address: string
	address2: string
	city: string
	postalCode: string
	surface: string
	rooms: string
	bedrooms: string
	purchasePrice: string
	purchaseDate: string
	notaryFees: string
	agencyFees: string
	currentValue: string
	rentAmount: string
	rentCharges: string
	notes: string
}

// =============================================================================
// INITIAL VALUES
// =============================================================================

const initialLoanFormData: LoanFormData = {
	name: '',
	lender: '',
	loanNumber: '',
	initialAmount: '',
	remainingAmount: '',
	rate: '',
	monthlyPayment: '',
	startDate: '',
	endDate: '',
	notes: '',
}

const initialInsuranceFormData: InsuranceFormData = {
	memberId: '',
	name: '',
	provider: '',
	contractNumber: '',
	coveragePercent: '',
	monthlyPremium: '',
	link: '',
	notes: '',
}

const initialPropertyInsuranceFormData: PropertyInsuranceFormData = {
	type: '',
	provider: '',
	contractNumber: '',
	monthlyPremium: '',
	startDate: '',
	endDate: '',
	coverage: '',
	link: '',
	notes: '',
}

const initialCoOwnershipFormData: CoOwnershipFormData = {
	name: '',
	quarterlyAmount: '',
	link: '',
	notes: '',
}

const initialUtilityContractFormData: UtilityContractFormData = {
	type: '',
	provider: '',
	contractNumber: '',
	monthlyAmount: '',
	link: '',
	notes: '',
}

const initialPropertyFormData: PropertyFormData = {
	name: '',
	type: '',
	usage: '',
	address: '',
	address2: '',
	city: '',
	postalCode: '',
	surface: '',
	rooms: '',
	bedrooms: '',
	purchasePrice: '',
	purchaseDate: '',
	notaryFees: '',
	agencyFees: '',
	currentValue: '',
	rentAmount: '',
	rentCharges: '',
	notes: '',
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: 0,
	}).format(amount)
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function PropertyDetailPage() {
	const params = useParams()
	const router = useRouter()
	const propertyId = params.id as string

	// TanStack Query hooks
	const {
		data: property,
		isLoading: loading,
		isError,
		error: queryError,
	} = usePropertyQuery(propertyId)
	const { data: members = [], isLoading: loadingMembers } = useMembersQuery()
	const error = isError
		? queryError instanceof Error
			? queryError.message
			: 'Une erreur est survenue'
		: null

	// Mutations
	const createLoanMutation = useCreateLoanMutation()
	const createLoanInsuranceMutation = useCreateLoanInsuranceMutation()
	const updatePropertyMutation = useUpdatePropertyMutation()
	const deletePropertyMutation = useDeletePropertyMutation()
	const createPropertyInsuranceMutation = useCreatePropertyInsuranceMutation()
	const updatePropertyInsuranceMutation = useUpdatePropertyInsuranceMutation()
	const deletePropertyInsuranceMutation = useDeletePropertyInsuranceMutation()
	const createCoOwnershipMutation = useCreateCoOwnershipMutation()
	const updateCoOwnershipMutation = useUpdateCoOwnershipMutation()
	const deleteCoOwnershipMutation = useDeleteCoOwnershipMutation()
	const createUtilityContractMutation = useCreateUtilityContractMutation()
	const updateUtilityContractMutation = useUpdateUtilityContractMutation()
	const deleteUtilityContractMutation = useDeleteUtilityContractMutation()

	// Dialog states
	const [isLoanDialogOpen, setIsLoanDialogOpen] = useState(false)
	const [loanFormData, setLoanFormData] = useState<LoanFormData>(initialLoanFormData)
	const [loanFormError, setLoanFormError] = useState<string | null>(null)

	const [isInsuranceDialogOpen, setIsInsuranceDialogOpen] = useState(false)
	const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null)
	const [insuranceFormData, setInsuranceFormData] =
		useState<InsuranceFormData>(initialInsuranceFormData)
	const [insuranceFormError, setInsuranceFormError] = useState<string | null>(null)

	const [isPropertyInsuranceDialogOpen, setIsPropertyInsuranceDialogOpen] = useState(false)
	const [isEditingPropertyInsurance, setIsEditingPropertyInsurance] = useState(false)
	const [propertyInsuranceFormData, setPropertyInsuranceFormData] =
		useState<PropertyInsuranceFormData>(initialPropertyInsuranceFormData)
	const [propertyInsuranceFormError, setPropertyInsuranceFormError] = useState<string | null>(null)

	const [isCoOwnershipDialogOpen, setIsCoOwnershipDialogOpen] = useState(false)
	const [isEditingCoOwnership, setIsEditingCoOwnership] = useState(false)
	const [coOwnershipFormData, setCoOwnershipFormData] =
		useState<CoOwnershipFormData>(initialCoOwnershipFormData)
	const [coOwnershipFormError, setCoOwnershipFormError] = useState<string | null>(null)

	const [isUtilityContractDialogOpen, setIsUtilityContractDialogOpen] = useState(false)
	const [editingUtilityContractId, setEditingUtilityContractId] = useState<string | null>(null)
	const [utilityContractFormData, setUtilityContractFormData] =
		useState<UtilityContractFormData>(initialUtilityContractFormData)
	const [utilityContractFormError, setUtilityContractFormError] = useState<string | null>(null)
	const [deletingUtilityContractId, setDeletingUtilityContractId] = useState<string | null>(null)

	const [isEditPropertyDialogOpen, setIsEditPropertyDialogOpen] = useState(false)
	const [propertyFormData, setPropertyFormData] =
		useState<PropertyFormData>(initialPropertyFormData)
	const [editMemberShares, setEditMemberShares] = useState<MemberShare[]>([])
	const [propertyFormError, setPropertyFormError] = useState<string | null>(null)

	const [showDeletePropertyDialog, setShowDeletePropertyDialog] = useState(false)

	// Derived mutation states
	const isSubmittingLoan = createLoanMutation.isPending
	const isSubmittingInsurance = createLoanInsuranceMutation.isPending
	const isSubmittingPropertyInsurance =
		createPropertyInsuranceMutation.isPending || updatePropertyInsuranceMutation.isPending
	const isDeletingPropertyInsurance = deletePropertyInsuranceMutation.isPending
	const isSubmittingCoOwnership =
		createCoOwnershipMutation.isPending || updateCoOwnershipMutation.isPending
	const isDeletingCoOwnership = deleteCoOwnershipMutation.isPending
	const isSubmittingUtilityContract =
		createUtilityContractMutation.isPending || updateUtilityContractMutation.isPending
	const isSubmittingProperty = updatePropertyMutation.isPending
	const isDeletingProperty = deletePropertyMutation.isPending

	// =============================================================================
	// FORM HANDLERS
	// =============================================================================

	// Loan form handlers
	const handleLoanInputChange = (field: keyof LoanFormData, value: string) => {
		setLoanFormData((prev) => ({ ...prev, [field]: value }))
	}

	const resetLoanForm = () => {
		setLoanFormData(initialLoanFormData)
		setLoanFormError(null)
	}

	const handleLoanSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoanFormError(null)

		try {
			if (!loanFormData.name.trim()) throw new Error('Le nom du prêt est requis')
			if (!loanFormData.initialAmount) throw new Error('Le montant initial est requis')
			if (!loanFormData.remainingAmount) throw new Error('Le capital restant est requis')
			if (!loanFormData.rate) throw new Error('Le taux est requis')
			if (!loanFormData.monthlyPayment) throw new Error('La mensualité est requise')
			if (!loanFormData.startDate) throw new Error('La date de début est requise')

			const initialAmount = Number.parseFloat(loanFormData.initialAmount)
			const remainingAmount = Number.parseFloat(loanFormData.remainingAmount)
			const rate = Number.parseFloat(loanFormData.rate)
			const monthlyPayment = Number.parseFloat(loanFormData.monthlyPayment)

			if (remainingAmount > initialAmount)
				throw new Error('Le capital restant ne peut pas dépasser le montant initial')
			if (rate < 0 || rate > 100) throw new Error('Le taux doit être entre 0 et 100')

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
			})

			setIsLoanDialogOpen(false)
			resetLoanForm()
		} catch (err) {
			setLoanFormError(err instanceof Error ? err.message : 'Une erreur est survenue')
		}
	}

	// Insurance form handlers
	const handleOpenInsuranceDialog = (loanId: string) => {
		setSelectedLoanId(loanId)
		setIsInsuranceDialogOpen(true)
	}

	const handleInsuranceInputChange = (field: keyof InsuranceFormData, value: string) => {
		setInsuranceFormData((prev) => ({ ...prev, [field]: value }))
	}

	const resetInsuranceForm = () => {
		setInsuranceFormData(initialInsuranceFormData)
		setInsuranceFormError(null)
		setSelectedLoanId(null)
	}

	const handleInsuranceSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setInsuranceFormError(null)

		try {
			if (!insuranceFormData.memberId) throw new Error('Le membre est requis')
			if (!insuranceFormData.name.trim()) throw new Error("Le nom de l'assurance est requis")
			if (!insuranceFormData.provider.trim()) throw new Error("L'assureur est requis")
			if (!insuranceFormData.coveragePercent)
				throw new Error('Le taux de couverture est requis')
			if (!insuranceFormData.monthlyPremium) throw new Error('La prime mensuelle est requise')

			const coveragePercent = Number.parseFloat(insuranceFormData.coveragePercent)
			const monthlyPremium = Number.parseFloat(insuranceFormData.monthlyPremium)

			if (coveragePercent < 0 || coveragePercent > 100)
				throw new Error('Le taux de couverture doit être entre 0 et 100')
			if (monthlyPremium < 0) throw new Error('La prime mensuelle ne peut pas être négative')
			if (!selectedLoanId) throw new Error('Aucun prêt sélectionné')

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
			})

			setIsInsuranceDialogOpen(false)
			resetInsuranceForm()
		} catch (err) {
			setInsuranceFormError(err instanceof Error ? err.message : 'Une erreur est survenue')
		}
	}

	// Property insurance form handlers
	const handlePropertyInsuranceInputChange = (
		field: keyof PropertyInsuranceFormData,
		value: string
	) => {
		setPropertyInsuranceFormData((prev) => ({ ...prev, [field]: value }))
	}

	const resetPropertyInsuranceForm = () => {
		setPropertyInsuranceFormData(initialPropertyInsuranceFormData)
		setPropertyInsuranceFormError(null)
		setIsEditingPropertyInsurance(false)
	}

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
			})
			setIsEditingPropertyInsurance(true)
		} else {
			resetPropertyInsuranceForm()
		}
		setIsPropertyInsuranceDialogOpen(true)
	}

	const handlePropertyInsuranceSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setPropertyInsuranceFormError(null)

		try {
			if (!propertyInsuranceFormData.type) throw new Error("Le type d'assurance est requis")
			if (!propertyInsuranceFormData.provider.trim()) throw new Error("L'assureur est requis")
			if (!propertyInsuranceFormData.monthlyPremium)
				throw new Error('La prime mensuelle est requise')
			if (!propertyInsuranceFormData.startDate) throw new Error('La date de début est requise')

			const monthlyPremium = Number.parseFloat(propertyInsuranceFormData.monthlyPremium)
			if (monthlyPremium < 0) throw new Error('La prime mensuelle ne peut pas être négative')

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
			}

			if (isEditingPropertyInsurance) {
				await updatePropertyInsuranceMutation.mutateAsync({ propertyId, input })
			} else {
				await createPropertyInsuranceMutation.mutateAsync({ propertyId, input })
			}

			setIsPropertyInsuranceDialogOpen(false)
			resetPropertyInsuranceForm()
		} catch (err) {
			setPropertyInsuranceFormError(
				err instanceof Error ? err.message : 'Une erreur est survenue'
			)
		}
	}

	const handleDeletePropertyInsurance = async () => {
		try {
			await deletePropertyInsuranceMutation.mutateAsync(propertyId)
		} catch {
			// Property insurance deletion failed silently
		}
	}

	// Co-ownership form handlers
	const handleCoOwnershipInputChange = (field: keyof CoOwnershipFormData, value: string) => {
		setCoOwnershipFormData((prev) => ({ ...prev, [field]: value }))
	}

	const resetCoOwnershipForm = () => {
		setCoOwnershipFormData(initialCoOwnershipFormData)
		setCoOwnershipFormError(null)
		setIsEditingCoOwnership(false)
	}

	const openCoOwnershipDialog = (editMode: boolean) => {
		if (editMode && property?.coOwnership) {
			setCoOwnershipFormData({
				name: property.coOwnership.name,
				quarterlyAmount: property.coOwnership.quarterlyAmount.toString(),
				link: property.coOwnership.link || '',
				notes: property.coOwnership.notes || '',
			})
			setIsEditingCoOwnership(true)
		} else {
			resetCoOwnershipForm()
		}
		setIsCoOwnershipDialogOpen(true)
	}

	const handleCoOwnershipSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setCoOwnershipFormError(null)

		try {
			if (!coOwnershipFormData.name.trim()) throw new Error('Le nom du syndic est requis')
			if (!coOwnershipFormData.quarterlyAmount)
				throw new Error('Le montant trimestriel est requis')

			const quarterlyAmount = Number.parseFloat(coOwnershipFormData.quarterlyAmount)
			if (quarterlyAmount < 0) throw new Error('Le montant trimestriel ne peut pas être négatif')

			const input = {
				name: coOwnershipFormData.name.trim(),
				quarterlyAmount,
				link: coOwnershipFormData.link.trim() || null,
				notes: coOwnershipFormData.notes.trim() || null,
			}

			if (isEditingCoOwnership) {
				await updateCoOwnershipMutation.mutateAsync({ propertyId, input })
			} else {
				await createCoOwnershipMutation.mutateAsync({ propertyId, input })
			}

			setIsCoOwnershipDialogOpen(false)
			resetCoOwnershipForm()
		} catch (err) {
			setCoOwnershipFormError(err instanceof Error ? err.message : 'Une erreur est survenue')
		}
	}

	const handleDeleteCoOwnership = async () => {
		try {
			await deleteCoOwnershipMutation.mutateAsync(propertyId)
		} catch {
			// Co-ownership deletion failed silently
		}
	}

	// Utility contract form handlers
	const handleUtilityContractInputChange = (
		field: keyof UtilityContractFormData,
		value: string
	) => {
		setUtilityContractFormData((prev) => ({ ...prev, [field]: value }))
	}

	const resetUtilityContractForm = () => {
		setUtilityContractFormData(initialUtilityContractFormData)
		setUtilityContractFormError(null)
		setEditingUtilityContractId(null)
	}

	const openUtilityContractDialog = (contract?: PropertyUtilityContract) => {
		if (contract) {
			setUtilityContractFormData({
				type: contract.type,
				provider: contract.provider,
				contractNumber: contract.contractNumber || '',
				monthlyAmount: contract.monthlyAmount.toString(),
				link: contract.link || '',
				notes: contract.notes || '',
			})
			setEditingUtilityContractId(contract.id)
		} else {
			resetUtilityContractForm()
		}
		setIsUtilityContractDialogOpen(true)
	}

	const handleUtilityContractSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setUtilityContractFormError(null)

		try {
			if (!utilityContractFormData.type) throw new Error('Le type de contrat est requis')
			if (!utilityContractFormData.provider.trim()) throw new Error('Le fournisseur est requis')
			if (!utilityContractFormData.monthlyAmount)
				throw new Error('Le montant mensuel est requis')

			const monthlyAmount = Number.parseFloat(utilityContractFormData.monthlyAmount)
			if (monthlyAmount < 0) throw new Error('Le montant mensuel ne peut pas être négatif')

			const input = {
				type: utilityContractFormData.type as UtilityType,
				provider: utilityContractFormData.provider.trim(),
				contractNumber: utilityContractFormData.contractNumber.trim() || null,
				monthlyAmount,
				link: utilityContractFormData.link.trim() || null,
				notes: utilityContractFormData.notes.trim() || null,
			}

			if (editingUtilityContractId) {
				await updateUtilityContractMutation.mutateAsync({
					id: editingUtilityContractId,
					propertyId,
					input,
				})
			} else {
				await createUtilityContractMutation.mutateAsync({ propertyId, input })
			}

			setIsUtilityContractDialogOpen(false)
			resetUtilityContractForm()
		} catch (err) {
			setUtilityContractFormError(
				err instanceof Error ? err.message : 'Une erreur est survenue'
			)
		}
	}

	const handleDeleteUtilityContract = async (contractId: string) => {
		setDeletingUtilityContractId(contractId)
		try {
			await deleteUtilityContractMutation.mutateAsync({ id: contractId, propertyId })
		} catch {
			// Utility contract deletion failed silently
		} finally {
			setDeletingUtilityContractId(null)
		}
	}

	// Property edit form handlers
	const handlePropertyInputChange = (field: keyof PropertyFormData, value: string) => {
		setPropertyFormData((prev) => ({ ...prev, [field]: value }))
	}

	const resetPropertyForm = () => {
		setPropertyFormData(initialPropertyFormData)
		setEditMemberShares([])
		setPropertyFormError(null)
	}

	const openEditPropertyDialog = () => {
		if (!property) return
		setPropertyFormData({
			name: property.name,
			type: property.type,
			usage: property.usage,
			address: property.address,
			address2: property.address2 || '',
			city: property.city,
			postalCode: property.postalCode,
			surface: property.surface.toString(),
			rooms: property.rooms?.toString() || '',
			bedrooms: property.bedrooms?.toString() || '',
			purchasePrice: property.purchasePrice.toString(),
			purchaseDate: new Date(property.purchaseDate).toISOString().split('T')[0],
			notaryFees: property.notaryFees.toString(),
			agencyFees: property.agencyFees?.toString() || '',
			currentValue: property.currentValue.toString(),
			rentAmount: property.rentAmount?.toString() || '',
			rentCharges: property.rentCharges?.toString() || '',
			notes: property.notes || '',
		})
		setEditMemberShares(
			property.propertyMembers.map((pm) => ({
				memberId: pm.memberId,
				ownershipShare: pm.ownershipShare,
			}))
		)
		setIsEditPropertyDialogOpen(true)
	}

	const handleAddMember = () => {
		const availableMembers = members.filter(
			(m) => !editMemberShares.some((ms) => ms.memberId === m.id)
		)
		if (availableMembers.length > 0) {
			setEditMemberShares((prev) => [
				...prev,
				{ memberId: availableMembers[0].id, ownershipShare: 100 },
			])
		}
	}

	const handleRemoveMember = (memberId: string) => {
		setEditMemberShares((prev) => prev.filter((ms) => ms.memberId !== memberId))
	}

	const handleMemberChange = (index: number, memberId: string) => {
		setEditMemberShares((prev) => prev.map((ms, i) => (i === index ? { ...ms, memberId } : ms)))
	}

	const handleShareChange = (index: number, share: number) => {
		setEditMemberShares((prev) =>
			prev.map((ms, i) => (i === index ? { ...ms, ownershipShare: share } : ms))
		)
	}

	const handlePropertySubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setPropertyFormError(null)

		try {
			if (!propertyFormData.name.trim()) throw new Error('Le nom est requis')
			if (!propertyFormData.type) throw new Error('Le type est requis')
			if (!propertyFormData.usage) throw new Error("L'usage est requis")
			if (!propertyFormData.address.trim()) throw new Error("L'adresse est requise")
			if (!propertyFormData.city.trim()) throw new Error('La ville est requise')
			if (!propertyFormData.postalCode.trim()) throw new Error('Le code postal est requis')
			if (!propertyFormData.surface) throw new Error('La surface est requise')
			if (!propertyFormData.purchasePrice) throw new Error("Le prix d'achat est requis")
			if (!propertyFormData.purchaseDate) throw new Error("La date d'achat est requise")
			if (!propertyFormData.notaryFees) throw new Error('Les frais de notaire sont requis')
			if (!propertyFormData.currentValue) throw new Error('La valeur actuelle est requise')

			if (editMemberShares.length > 0) {
				const totalShare = editMemberShares.reduce((sum, ms) => sum + ms.ownershipShare, 0)
				if (totalShare !== 100)
					throw new Error('La somme des parts de propriété doit être égale à 100%')
			}

			await updatePropertyMutation.mutateAsync({
				id: propertyId,
				input: {
					name: propertyFormData.name.trim(),
					type: propertyFormData.type as PropertyType,
					usage: propertyFormData.usage as PropertyUsage,
					address: propertyFormData.address.trim(),
					address2: propertyFormData.address2.trim() || null,
					city: propertyFormData.city.trim(),
					postalCode: propertyFormData.postalCode.trim(),
					surface: Number.parseFloat(propertyFormData.surface),
					rooms: propertyFormData.rooms ? Number.parseInt(propertyFormData.rooms, 10) : null,
					bedrooms: propertyFormData.bedrooms
						? Number.parseInt(propertyFormData.bedrooms, 10)
						: null,
					purchasePrice: Number.parseFloat(propertyFormData.purchasePrice),
					purchaseDate: propertyFormData.purchaseDate,
					notaryFees: Number.parseFloat(propertyFormData.notaryFees),
					agencyFees: propertyFormData.agencyFees
						? Number.parseFloat(propertyFormData.agencyFees)
						: null,
					currentValue: Number.parseFloat(propertyFormData.currentValue),
					rentAmount: propertyFormData.rentAmount
						? Number.parseFloat(propertyFormData.rentAmount)
						: null,
					rentCharges: propertyFormData.rentCharges
						? Number.parseFloat(propertyFormData.rentCharges)
						: null,
					notes: propertyFormData.notes.trim() || null,
					memberShares: editMemberShares.length > 0 ? editMemberShares : undefined,
				},
			})

			setIsEditPropertyDialogOpen(false)
			resetPropertyForm()
		} catch (err) {
			setPropertyFormError(err instanceof Error ? err.message : 'Une erreur est survenue')
		}
	}

	// Delete property handler
	const handleDeleteProperty = async () => {
		try {
			await deletePropertyMutation.mutateAsync(propertyId)
			router.push('/dashboard/real-estate')
		} catch {
			setShowDeletePropertyDialog(false)
		}
	}

	// =============================================================================
	// LOADING & ERROR STATES
	// =============================================================================

	if (loading) {
		return <PropertyDetailSkeleton />
	}

	if (error || !property) {
		return <PropertyNotFoundState error={error} />
	}

	// =============================================================================
	// COMPUTED VALUES
	// =============================================================================

	const totalLoansRemaining = property.loans.reduce((sum, loan) => sum + loan.remainingAmount, 0)
	const totalInvestment =
		property.purchasePrice + property.notaryFees + (property.agencyFees || 0)
	const equity = property.currentValue - totalLoansRemaining

	// =============================================================================
	// RENDER
	// =============================================================================

	return (
		<Flex direction="col" gap="lg">
			<PropertyDetailHeader
				name={property.name}
				type={property.type}
				usage={property.usage}
				address={property.address}
				address2={property.address2}
				postalCode={property.postalCode}
				city={property.city}
				onEdit={openEditPropertyDialog}
				onDeleteClick={() => setShowDeletePropertyDialog(true)}
			/>

			<PropertyStatsSummary
				currentValue={property.currentValue}
				purchasePrice={property.purchasePrice}
				equity={equity}
				totalLoansRemaining={totalLoansRemaining}
				totalInvestment={totalInvestment}
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
				onAddLoan={() => setIsLoanDialogOpen(true)}
				onAddInsurance={handleOpenInsuranceDialog}
			/>

			<PropertyInsuranceSection
				insurance={property.insurance}
				onAdd={() => openPropertyInsuranceDialog(false)}
				onEdit={() => openPropertyInsuranceDialog(true)}
				onDelete={handleDeletePropertyInsurance}
				isDeleting={isDeletingPropertyInsurance}
			/>

			<PropertyCoOwnershipSection
				coOwnership={property.coOwnership}
				onAdd={() => openCoOwnershipDialog(false)}
				onEdit={() => openCoOwnershipDialog(true)}
				onDelete={handleDeleteCoOwnership}
				isDeleting={isDeletingCoOwnership}
			/>

			<PropertyUtilityContractsSection
				contracts={property.utilityContracts}
				onAddContract={() => openUtilityContractDialog()}
				onEditContract={openUtilityContractDialog}
				onDeleteContract={handleDeleteUtilityContract}
				deletingContractId={deletingUtilityContractId}
			/>

			{/* Dialogs */}
			<LoanFormDialog
				open={isLoanDialogOpen}
				onOpenChange={(open) => {
					setIsLoanDialogOpen(open)
					if (!open) resetLoanForm()
				}}
				formData={loanFormData}
				onInputChange={handleLoanInputChange}
				onSubmit={handleLoanSubmit}
				error={loanFormError}
				isSubmitting={isSubmittingLoan}
			/>

			<LoanInsuranceFormDialog
				open={isInsuranceDialogOpen}
				onOpenChange={(open) => {
					setIsInsuranceDialogOpen(open)
					if (!open) resetInsuranceForm()
				}}
				formData={insuranceFormData}
				onInputChange={handleInsuranceInputChange}
				onSubmit={handleInsuranceSubmit}
				error={insuranceFormError}
				isSubmitting={isSubmittingInsurance}
				members={members}
				loadingMembers={loadingMembers}
			/>

			<PropertyInsuranceFormDialog
				open={isPropertyInsuranceDialogOpen}
				onOpenChange={(open) => {
					setIsPropertyInsuranceDialogOpen(open)
					if (!open) resetPropertyInsuranceForm()
				}}
				formData={propertyInsuranceFormData}
				onInputChange={handlePropertyInsuranceInputChange}
				onSubmit={handlePropertyInsuranceSubmit}
				error={propertyInsuranceFormError}
				isSubmitting={isSubmittingPropertyInsurance}
				isEditing={isEditingPropertyInsurance}
				formatCurrency={formatCurrency}
			/>

			<CoOwnershipFormDialog
				open={isCoOwnershipDialogOpen}
				onOpenChange={(open) => {
					setIsCoOwnershipDialogOpen(open)
					if (!open) resetCoOwnershipForm()
				}}
				formData={coOwnershipFormData}
				onInputChange={handleCoOwnershipInputChange}
				onSubmit={handleCoOwnershipSubmit}
				error={coOwnershipFormError}
				isSubmitting={isSubmittingCoOwnership}
				isEditing={isEditingCoOwnership}
				formatCurrency={formatCurrency}
			/>

			<UtilityContractFormDialog
				open={isUtilityContractDialogOpen}
				onOpenChange={(open) => {
					setIsUtilityContractDialogOpen(open)
					if (!open) resetUtilityContractForm()
				}}
				formData={utilityContractFormData}
				onInputChange={handleUtilityContractInputChange}
				onSubmit={handleUtilityContractSubmit}
				error={utilityContractFormError}
				isSubmitting={isSubmittingUtilityContract}
				isEditing={!!editingUtilityContractId}
				formatCurrency={formatCurrency}
			/>

			<PropertyEditDialog
				open={isEditPropertyDialogOpen}
				onOpenChange={(open) => {
					setIsEditPropertyDialogOpen(open)
					if (!open) resetPropertyForm()
				}}
				formData={propertyFormData}
				memberShares={editMemberShares}
				members={members}
				loadingMembers={loadingMembers}
				onInputChange={handlePropertyInputChange}
				onAddMember={handleAddMember}
				onRemoveMember={handleRemoveMember}
				onMemberChange={handleMemberChange}
				onShareChange={handleShareChange}
				onSubmit={handlePropertySubmit}
				error={propertyFormError}
				isSubmitting={isSubmittingProperty}
			/>

			<PropertyDeleteDialog
				open={showDeletePropertyDialog}
				onOpenChange={setShowDeletePropertyDialog}
				propertyName={property.name}
				onDelete={handleDeleteProperty}
				isDeleting={isDeletingProperty}
			/>
		</Flex>
	)
}
