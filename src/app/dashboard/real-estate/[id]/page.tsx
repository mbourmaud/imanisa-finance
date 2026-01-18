'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
	ArrowLeft,
	Building2,
	Button,
	ChevronDown,
	ChevronUp,
	CreditCard,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	Droplets,
	ExternalLink,
	Flame,
	GlassCard,
	Heading,
	Home,
	Input,
	Label,
	Landmark,
	Loader2,
	MapPin,
	MoreHorizontal,
	Pencil,
	Plus,
	Progress,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Shield,
	Skeleton,
	StatCard,
	StatCardGrid,
	Text,
	Trash2,
	Users,
	Wallet,
	Wifi,
	X,
	Zap,
} from '@/components';
import { useCreateLoanInsuranceMutation, useCreateLoanMutation } from '@/features/loans';
import { useMembersQuery } from '@/features/members/hooks/use-members-query';
import type {
	Loan,
	MemberShare,
	UtilityContract as PropertyUtilityContract,
} from '@/features/properties';
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
} from '@/features/properties';

interface LoanFormData {
	name: string;
	lender: string;
	loanNumber: string;
	initialAmount: string;
	remainingAmount: string;
	rate: string;
	monthlyPayment: string;
	startDate: string;
	endDate: string;
	notes: string;
}

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
};

// Insurance form data
interface InsuranceFormData {
	memberId: string;
	name: string;
	provider: string;
	contractNumber: string;
	coveragePercent: string;
	monthlyPremium: string;
	link: string;
	notes: string;
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
};

// Property insurance form data (PNO/MRH)
interface PropertyInsuranceFormData {
	type: InsuranceType | '';
	provider: string;
	contractNumber: string;
	monthlyPremium: string;
	startDate: string;
	endDate: string;
	coverage: string;
	link: string;
	notes: string;
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
};

// Co-ownership form data
interface CoOwnershipFormData {
	name: string;
	quarterlyAmount: string;
	link: string;
	notes: string;
}

const initialCoOwnershipFormData: CoOwnershipFormData = {
	name: '',
	quarterlyAmount: '',
	link: '',
	notes: '',
};

// Utility contract form data
interface UtilityContractFormData {
	type: UtilityType | '';
	provider: string;
	contractNumber: string;
	monthlyAmount: string;
	link: string;
	notes: string;
}

const initialUtilityContractFormData: UtilityContractFormData = {
	type: '',
	provider: '',
	contractNumber: '',
	monthlyAmount: '',
	link: '',
	notes: '',
};

// Property edit form data
interface PropertyFormData {
	name: string;
	type: PropertyType | '';
	usage: PropertyUsage | '';
	address: string;
	address2: string;
	city: string;
	postalCode: string;
	surface: string;
	rooms: string;
	bedrooms: string;
	purchasePrice: string;
	purchaseDate: string;
	notaryFees: string;
	agencyFees: string;
	currentValue: string;
	rentAmount: string;
	rentCharges: string;
	notes: string;
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
};

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: 0,
	}).format(amount);
}

function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString('fr-FR', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
}

function getPropertyTypeLabel(type: PropertyType): string {
	switch (type) {
		case 'HOUSE':
			return 'Maison';
		case 'APARTMENT':
			return 'Appartement';
		default:
			return type;
	}
}

function getPropertyUsageLabel(usage: PropertyUsage): string {
	switch (usage) {
		case 'PRIMARY':
			return 'Résidence principale';
		case 'SECONDARY':
			return 'Résidence secondaire';
		case 'RENTAL':
			return 'Locatif';
		default:
			return usage;
	}
}

function getInsuranceTypeLabel(type: InsuranceType): string {
	switch (type) {
		case 'PNO':
			return 'Propriétaire Non-Occupant';
		case 'MRH':
			return 'Multirisque Habitation';
		default:
			return type;
	}
}

function getInsuranceTypeBadge(type: InsuranceType): string {
	switch (type) {
		case 'PNO':
			return 'PNO';
		case 'MRH':
			return 'MRH';
		default:
			return type;
	}
}

function getUtilityTypeLabel(type: UtilityType): string {
	switch (type) {
		case 'ELECTRICITY':
			return 'Électricité';
		case 'GAS':
			return 'Gaz';
		case 'WATER':
			return 'Eau';
		case 'INTERNET':
			return 'Internet';
		case 'OTHER':
			return 'Autre';
		default:
			return type;
	}
}

function getUtilityTypeIcon(type: UtilityType): React.ElementType {
	switch (type) {
		case 'ELECTRICITY':
			return Zap;
		case 'GAS':
			return Flame;
		case 'WATER':
			return Droplets;
		case 'INTERNET':
			return Wifi;
		default:
			return Zap;
	}
}

function DetailItemSkeleton() {
	return (
		<div className="flex flex-col gap-2">
			<Skeleton style={{ height: '0.75rem', width: '4rem' }} />
			<Skeleton style={{ height: '1.25rem', width: '6rem' }} />
		</div>
	);
}

function SectionSkeleton() {
	return (
		<GlassCard padding="lg">
			<div className="flex flex-col gap-4">
				<Skeleton style={{ height: '1.25rem', width: '8rem' }} />
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					<DetailItemSkeleton />
					<DetailItemSkeleton />
					<DetailItemSkeleton />
				</div>
			</div>
		</GlassCard>
	);
}

function LoanCard({
	loan,
	onAddInsurance,
}: {
	loan: Loan;
	onAddInsurance: (loanId: string) => void;
}) {
	const [isExpanded, setIsExpanded] = useState(false);
	const paidPercent =
		loan.initialAmount > 0
			? ((loan.initialAmount - loan.remainingAmount) / loan.initialAmount) * 100
			: 0;

	const hasInsurances = loan.loanInsurances && loan.loanInsurances.length > 0;
	const totalInsurancePremium =
		loan.loanInsurances?.reduce((sum, ins) => sum + ins.monthlyPremium, 0) || 0;
	const totalCoverage =
		loan.loanInsurances?.reduce((sum, ins) => sum + ins.coveragePercent, 0) || 0;

	return (
		<div
			className="rounded-xl border border-border p-4"
			style={{ borderColor: 'hsl(var(--border) / 0.6)' }}
		>
			<div className="flex flex-col gap-4">
				<div className="flex justify-between items-start gap-4">
					<div className="min-w-0">
						<Text
							weight="medium"
							style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
						>
							{loan.name}
						</Text>
						{loan.lender && (
							<Text size="sm" color="muted">
								{loan.lender}
							</Text>
						)}
					</div>
					<div className="text-right shrink-0">
						<Text size="lg" weight="semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
							{formatCurrency(loan.remainingAmount)}
						</Text>
						<Text size="xs" color="muted">
							restant
						</Text>
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<div className="flex justify-between">
						<Text size="xs" color="muted">
							Progression du remboursement
						</Text>
						<Text size="xs" style={{ fontVariantNumeric: 'tabular-nums' }}>
							{paidPercent.toFixed(0)}%
						</Text>
					</div>
					<Progress value={paidPercent} style={{ height: '0.5rem' }} />
				</div>

				<div className="grid grid-cols-3 gap-4 pt-2 text-sm">
					<div className="flex flex-col">
						<Text size="xs" color="muted">
							Mensualité
						</Text>
						<Text weight="medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
							{formatCurrency(loan.monthlyPayment)}
						</Text>
					</div>
					<div className="flex flex-col">
						<Text size="xs" color="muted">
							Taux
						</Text>
						<Text weight="medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
							{loan.rate}%
						</Text>
					</div>
					<div className="flex flex-col">
						<Text size="xs" color="muted">
							Montant initial
						</Text>
						<Text weight="medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
							{formatCurrency(loan.initialAmount)}
						</Text>
					</div>
				</div>

				{loan.loanNumber && (
					<Text
						size="xs"
						color="muted"
						style={{ paddingTop: '0.5rem', borderTop: '1px solid hsl(var(--border) / 0.4)' }}
					>
						N° contrat: {loan.loanNumber}
					</Text>
				)}

				{/* Insurance section */}
				<div className="pt-3 border-t border-border/40">
					<button
						type="button"
						onClick={() => setIsExpanded(!isExpanded)}
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							width: '100%',
							textAlign: 'left',
						}}
					>
						<div className="flex items-center gap-3">
							<Shield
								style={{ height: '1rem', width: '1rem', color: 'hsl(var(--muted-foreground))' }}
							/>
							<Text size="sm" weight="medium">
								Assurance emprunteur
								{hasInsurances && (
									<Text
										as="span"
										size="xs"
										color="muted"
										weight="normal"
										style={{ marginLeft: '0.5rem' }}
									>
										({loan.loanInsurances?.length} contrat
										{loan.loanInsurances && loan.loanInsurances.length > 1 ? 's' : ''})
									</Text>
								)}
							</Text>
						</div>
						<div className="flex items-center gap-3">
							{hasInsurances && (
								<Text size="xs" color="muted">
									{formatCurrency(totalInsurancePremium)}/mois · {totalCoverage}%
								</Text>
							)}
							{isExpanded ? (
								<ChevronUp
									style={{ height: '1rem', width: '1rem', color: 'hsl(var(--muted-foreground))' }}
								/>
							) : (
								<ChevronDown
									style={{ height: '1rem', width: '1rem', color: 'hsl(var(--muted-foreground))' }}
								/>
							)}
						</div>
					</button>

					{isExpanded && (
						<div className="flex flex-col gap-3 mt-3">
							{hasInsurances ? (
								<div className="flex flex-col gap-3">
									{loan.loanInsurances?.map((insurance) => (
										<div
											key={insurance.id}
											className="flex items-center gap-3 p-3 rounded-lg"
											style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}
										>
											<div
												className="flex items-center justify-center h-8 w-8 rounded-full text-xs font-medium text-white shrink-0"
												style={{ backgroundColor: insurance.member.color || '#6b7280' }}
											>
												{insurance.member.name.charAt(0).toUpperCase()}
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-3 flex-wrap">
													<Text
														size="sm"
														weight="medium"
														style={{
															overflow: 'hidden',
															textOverflow: 'ellipsis',
															whiteSpace: 'nowrap',
														}}
													>
														{insurance.member.name}
													</Text>
													<Text
														size="xs"
														style={{
															padding: '0.125rem 0.375rem',
															borderRadius: '9999px',
															backgroundColor: 'hsl(var(--primary) / 0.1)',
															color: 'hsl(var(--primary))',
														}}
													>
														{insurance.coveragePercent}%
													</Text>
												</div>
												<Text
													size="xs"
													color="muted"
													style={{
														overflow: 'hidden',
														textOverflow: 'ellipsis',
														whiteSpace: 'nowrap',
													}}
												>
													{insurance.provider} · {formatCurrency(insurance.monthlyPremium)}/mois
												</Text>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-3">
									<Text size="sm" color="muted" style={{ marginBottom: '0.5rem' }}>
										Aucune assurance emprunteur
									</Text>
								</div>
							)}
							<Button
								variant="outline"
								size="sm"
								style={{ width: '100%', gap: '0.5rem' }}
								onClick={() => onAddInsurance(loan.id)}
							>
								<Plus style={{ height: '0.875rem', width: '0.875rem' }} />
								Ajouter une assurance
							</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

function LoansEmptyState({ onAddClick }: { onAddClick: () => void }) {
	return (
		<div className="flex flex-col items-center justify-center py-8 text-center">
			<div
				className="flex items-center justify-center h-12 w-12 rounded-xl mb-3"
				style={{ backgroundColor: 'hsl(var(--muted) / 0.5)' }}
			>
				<CreditCard
					style={{ height: '1.5rem', width: '1.5rem', color: 'hsl(var(--muted-foreground))' }}
				/>
			</div>
			<Text weight="medium" style={{ marginBottom: '0.25rem' }}>
				Aucun prêt
			</Text>
			<Text size="sm" color="muted" style={{ marginBottom: '1rem' }}>
				Ajoutez les crédits immobiliers associés à ce bien.
			</Text>
			<Button variant="outline" size="sm" style={{ gap: '0.5rem' }} onClick={onAddClick}>
				<Plus style={{ height: '1rem', width: '1rem' }} />
				Ajouter un prêt
			</Button>
		</div>
	);
}

function DetailItem({
	label,
	value,
}: {
	label: string;
	value: string | number | null | undefined;
}) {
	if (value === null || value === undefined) return null;
	return (
		<div className="flex flex-col">
			<Text size="xs" color="muted">
				{label}
			</Text>
			<Text weight="medium">
				{typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
			</Text>
		</div>
	);
}

function CurrencyItem({ label, value }: { label: string; value: number | null | undefined }) {
	if (value === null || value === undefined) return null;
	return (
		<div className="flex flex-col">
			<Text size="xs" color="muted">
				{label}
			</Text>
			<Text weight="medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
				{formatCurrency(value)}
			</Text>
		</div>
	);
}

export default function PropertyDetailPage() {
	const params = useParams();
	const router = useRouter();
	const propertyId = params.id as string;

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
	const updatePropertyMutation = useUpdatePropertyMutation();
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

	// Loan dialog state
	const [isLoanDialogOpen, setIsLoanDialogOpen] = useState(false);
	const [loanFormData, setLoanFormData] = useState<LoanFormData>(initialLoanFormData);
	const [loanFormError, setLoanFormError] = useState<string | null>(null);

	// Insurance dialog state
	const [isInsuranceDialogOpen, setIsInsuranceDialogOpen] = useState(false);
	const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
	const [insuranceFormData, setInsuranceFormData] =
		useState<InsuranceFormData>(initialInsuranceFormData);
	const [insuranceFormError, setInsuranceFormError] = useState<string | null>(null);

	// Property insurance dialog state
	const [isPropertyInsuranceDialogOpen, setIsPropertyInsuranceDialogOpen] = useState(false);
	const [isEditingPropertyInsurance, setIsEditingPropertyInsurance] = useState(false);
	const [propertyInsuranceFormData, setPropertyInsuranceFormData] =
		useState<PropertyInsuranceFormData>(initialPropertyInsuranceFormData);
	const [propertyInsuranceFormError, setPropertyInsuranceFormError] = useState<string | null>(null);

	// Co-ownership dialog state
	const [isCoOwnershipDialogOpen, setIsCoOwnershipDialogOpen] = useState(false);
	const [isEditingCoOwnership, setIsEditingCoOwnership] = useState(false);
	const [coOwnershipFormData, setCoOwnershipFormData] = useState<CoOwnershipFormData>(
		initialCoOwnershipFormData,
	);
	const [coOwnershipFormError, setCoOwnershipFormError] = useState<string | null>(null);

	// Utility contract dialog state
	const [isUtilityContractDialogOpen, setIsUtilityContractDialogOpen] = useState(false);
	const [editingUtilityContractId, setEditingUtilityContractId] = useState<string | null>(null);
	const [utilityContractFormData, setUtilityContractFormData] = useState<UtilityContractFormData>(
		initialUtilityContractFormData,
	);
	const [utilityContractFormError, setUtilityContractFormError] = useState<string | null>(null);
	const [deletingUtilityContractId, setDeletingUtilityContractId] = useState<string | null>(null);

	// Property edit dialog state
	const [isEditPropertyDialogOpen, setIsEditPropertyDialogOpen] = useState(false);
	const [propertyFormData, setPropertyFormData] =
		useState<PropertyFormData>(initialPropertyFormData);
	const [editMemberShares, setEditMemberShares] = useState<MemberShare[]>([]);
	const [propertyFormError, setPropertyFormError] = useState<string | null>(null);

	// Property delete state
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
	const isSubmittingProperty = updatePropertyMutation.isPending;
	const isDeletingProperty = deletePropertyMutation.isPending;

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
			// Validate required fields
			if (!loanFormData.name.trim()) {
				throw new Error('Le nom du prêt est requis');
			}
			if (!loanFormData.initialAmount) {
				throw new Error('Le montant initial est requis');
			}
			if (!loanFormData.remainingAmount) {
				throw new Error('Le capital restant est requis');
			}
			if (!loanFormData.rate) {
				throw new Error('Le taux est requis');
			}
			if (!loanFormData.monthlyPayment) {
				throw new Error('La mensualité est requise');
			}
			if (!loanFormData.startDate) {
				throw new Error('La date de début est requise');
			}

			const initialAmount = Number.parseFloat(loanFormData.initialAmount);
			const remainingAmount = Number.parseFloat(loanFormData.remainingAmount);
			const rate = Number.parseFloat(loanFormData.rate);
			const monthlyPayment = Number.parseFloat(loanFormData.monthlyPayment);

			if (remainingAmount > initialAmount) {
				throw new Error('Le capital restant ne peut pas dépasser le montant initial');
			}
			if (rate < 0 || rate > 100) {
				throw new Error('Le taux doit être entre 0 et 100');
			}

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

			// Success - close dialog
			setIsLoanDialogOpen(false);
			resetLoanForm();
		} catch (err) {
			setLoanFormError(err instanceof Error ? err.message : 'Une erreur est survenue');
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
			// Validate required fields
			if (!insuranceFormData.memberId) {
				throw new Error('Le membre est requis');
			}
			if (!insuranceFormData.name.trim()) {
				throw new Error("Le nom de l'assurance est requis");
			}
			if (!insuranceFormData.provider.trim()) {
				throw new Error("L'assureur est requis");
			}
			if (!insuranceFormData.coveragePercent) {
				throw new Error('Le taux de couverture est requis');
			}
			if (!insuranceFormData.monthlyPremium) {
				throw new Error('La prime mensuelle est requise');
			}

			const coveragePercent = Number.parseFloat(insuranceFormData.coveragePercent);
			const monthlyPremium = Number.parseFloat(insuranceFormData.monthlyPremium);

			if (coveragePercent < 0 || coveragePercent > 100) {
				throw new Error('Le taux de couverture doit être entre 0 et 100');
			}
			if (monthlyPremium < 0) {
				throw new Error('La prime mensuelle ne peut pas être négative');
			}

			if (!selectedLoanId) {
				throw new Error('Aucun prêt sélectionné');
			}

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

			// Success - close dialog
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
			// Pre-fill form with existing data
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
			// Validate required fields
			if (!propertyInsuranceFormData.type) {
				throw new Error("Le type d'assurance est requis");
			}
			if (!propertyInsuranceFormData.provider.trim()) {
				throw new Error("L'assureur est requis");
			}
			if (!propertyInsuranceFormData.monthlyPremium) {
				throw new Error('La prime mensuelle est requise');
			}
			if (!propertyInsuranceFormData.startDate) {
				throw new Error('La date de début est requise');
			}

			const monthlyPremium = Number.parseFloat(propertyInsuranceFormData.monthlyPremium);
			if (monthlyPremium < 0) {
				throw new Error('La prime mensuelle ne peut pas être négative');
			}

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

			// Success - close dialog
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
			// Pre-fill form with existing data
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
			// Validate required fields
			if (!coOwnershipFormData.name.trim()) {
				throw new Error('Le nom du syndic est requis');
			}
			if (!coOwnershipFormData.quarterlyAmount) {
				throw new Error('Le montant trimestriel est requis');
			}

			const quarterlyAmount = Number.parseFloat(coOwnershipFormData.quarterlyAmount);
			if (quarterlyAmount < 0) {
				throw new Error('Le montant trimestriel ne peut pas être négatif');
			}

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

			// Success - close dialog
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

	const openUtilityContractDialog = (contract?: PropertyUtilityContract) => {
		if (contract) {
			// Pre-fill form with existing data
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
			// Validate required fields
			if (!utilityContractFormData.type) {
				throw new Error('Le type de contrat est requis');
			}
			if (!utilityContractFormData.provider.trim()) {
				throw new Error('Le fournisseur est requis');
			}
			if (!utilityContractFormData.monthlyAmount) {
				throw new Error('Le montant mensuel est requis');
			}

			const monthlyAmount = Number.parseFloat(utilityContractFormData.monthlyAmount);
			if (monthlyAmount < 0) {
				throw new Error('Le montant mensuel ne peut pas être négatif');
			}

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

			// Success - close dialog
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

	// Property edit form handlers
	const handlePropertyInputChange = (field: keyof PropertyFormData, value: string) => {
		setPropertyFormData((prev) => ({ ...prev, [field]: value }));
	};

	const resetPropertyForm = () => {
		setPropertyFormData(initialPropertyFormData);
		setEditMemberShares([]);
		setPropertyFormError(null);
	};

	const openEditPropertyDialog = () => {
		if (!property) return;
		// Pre-fill form with existing data
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
		});
		// Pre-fill member shares
		setEditMemberShares(
			property.propertyMembers.map((pm) => ({
				memberId: pm.memberId,
				ownershipShare: pm.ownershipShare,
			})),
		);
		setIsEditPropertyDialogOpen(true);
	};

	const handleAddMember = () => {
		const availableMembers = members.filter(
			(m) => !editMemberShares.some((ms) => ms.memberId === m.id),
		);
		if (availableMembers.length > 0) {
			setEditMemberShares((prev) => [
				...prev,
				{ memberId: availableMembers[0].id, ownershipShare: 100 },
			]);
		}
	};

	const handleRemoveMember = (memberId: string) => {
		setEditMemberShares((prev) => prev.filter((ms) => ms.memberId !== memberId));
	};

	const handleMemberChange = (index: number, memberId: string) => {
		setEditMemberShares((prev) => prev.map((ms, i) => (i === index ? { ...ms, memberId } : ms)));
	};

	const handleShareChange = (index: number, share: number) => {
		setEditMemberShares((prev) =>
			prev.map((ms, i) => (i === index ? { ...ms, ownershipShare: share } : ms)),
		);
	};

	const handlePropertySubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setPropertyFormError(null);

		try {
			// Validate required fields
			if (!propertyFormData.name.trim()) {
				throw new Error('Le nom est requis');
			}
			if (!propertyFormData.type) {
				throw new Error('Le type est requis');
			}
			if (!propertyFormData.usage) {
				throw new Error("L'usage est requis");
			}
			if (!propertyFormData.address.trim()) {
				throw new Error("L'adresse est requise");
			}
			if (!propertyFormData.city.trim()) {
				throw new Error('La ville est requise');
			}
			if (!propertyFormData.postalCode.trim()) {
				throw new Error('Le code postal est requis');
			}
			if (!propertyFormData.surface) {
				throw new Error('La surface est requise');
			}
			if (!propertyFormData.purchasePrice) {
				throw new Error("Le prix d'achat est requis");
			}
			if (!propertyFormData.purchaseDate) {
				throw new Error("La date d'achat est requise");
			}
			if (!propertyFormData.notaryFees) {
				throw new Error('Les frais de notaire sont requis');
			}
			if (!propertyFormData.currentValue) {
				throw new Error('La valeur actuelle est requise');
			}

			// Validate member shares total to 100%
			if (editMemberShares.length > 0) {
				const totalShare = editMemberShares.reduce((sum, ms) => sum + ms.ownershipShare, 0);
				if (totalShare !== 100) {
					throw new Error('La somme des parts de propriété doit être égale à 100%');
				}
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
			});

			// Success - close dialog
			setIsEditPropertyDialogOpen(false);
			resetPropertyForm();
		} catch (err) {
			setPropertyFormError(err instanceof Error ? err.message : 'Une erreur est survenue');
		}
	};

	// Delete property handler
	const handleDeleteProperty = async () => {
		try {
			await deletePropertyMutation.mutateAsync(propertyId);
			// Success - redirect to property list
			router.push('/dashboard/real-estate');
		} catch {
			setShowDeletePropertyDialog(false);
		}
	};

	const isEditFormRental = propertyFormData.usage === 'RENTAL';

	// Loading state
	if (loading) {
		return (
			<div className="flex flex-col gap-6">
				{/* Header skeleton */}
				<div className="flex items-center gap-4">
					<Skeleton style={{ height: '2rem', width: '2rem' }} />
					<div className="flex flex-col gap-3" style={{ flex: 1 }}>
						<Skeleton style={{ height: '1.75rem', width: '16rem' }} />
						<Skeleton style={{ height: '1rem', width: '12rem' }} />
					</div>
				</div>

				{/* Sections skeleton */}
				<SectionSkeleton />
				<SectionSkeleton />
			</div>
		);
	}

	// Error state
	if (error || !property) {
		return (
			<div className="flex flex-col gap-6">
				<Link
					href="/dashboard/real-estate"
					style={{
						display: 'inline-flex',
						alignItems: 'center',
						gap: '0.5rem',
						fontSize: '0.875rem',
						color: 'hsl(var(--muted-foreground))',
						transition: 'color 0.2s',
					}}
				>
					<ArrowLeft style={{ height: '1rem', width: '1rem' }} />
					Retour aux biens
				</Link>
				<GlassCard
					padding="lg"
					style={{
						borderColor: 'hsl(var(--destructive) / 0.5)',
						backgroundColor: 'hsl(var(--destructive) / 0.05)',
					}}
				>
					<Text size="sm" style={{ color: 'hsl(var(--destructive))' }}>
						{error || 'Bien non trouvé'}
					</Text>
					<Button
						variant="outline"
						size="sm"
						style={{ marginTop: '1rem' }}
						onClick={() => router.push('/dashboard/real-estate')}
					>
						Retour à la liste
					</Button>
				</GlassCard>
			</div>
		);
	}

	const totalLoansRemaining = property.loans.reduce((sum, loan) => sum + loan.remainingAmount, 0);
	const totalInvestment = property.purchasePrice + property.notaryFees + (property.agencyFees || 0);
	const appreciation =
		((property.currentValue - property.purchasePrice) / property.purchasePrice) * 100;
	const equity = property.currentValue - totalLoansRemaining;
	const isRental = property.usage === 'RENTAL';

	return (
		<div className="flex flex-col gap-6">
			{/* Header */}
			<div className="flex flex-col gap-4">
				<div className="flex justify-between items-start gap-4 flex-wrap">
					<div className="flex items-start gap-4">
						<Link
							href="/dashboard/real-estate"
							style={{
								marginTop: '0.25rem',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								height: '2rem',
								width: '2rem',
								borderRadius: '0.5rem',
								border: '1px solid hsl(var(--border) / 0.6)',
								color: 'hsl(var(--muted-foreground))',
								flexShrink: 0,
								transition: 'all 0.2s',
							}}
						>
							<ArrowLeft style={{ height: '1rem', width: '1rem' }} />
						</Link>
						<div className="min-w-0">
							<div className="flex items-center gap-3 flex-wrap">
								<Heading
									level={1}
									size="2xl"
									weight="semibold"
									style={{ letterSpacing: '-0.025em' }}
								>
									{property.name}
								</Heading>
								<div className="flex gap-1">
									<Text
										size="xs"
										style={{
											padding: '0.125rem 0.5rem',
											borderRadius: '9999px',
											backgroundColor: 'hsl(var(--primary) / 0.1)',
											color: 'hsl(var(--primary))',
										}}
									>
										{getPropertyTypeLabel(property.type)}
									</Text>
									<Text
										size="xs"
										style={{
											padding: '0.125rem 0.5rem',
											borderRadius: '9999px',
											backgroundColor: 'hsl(var(--muted))',
											color: 'hsl(var(--muted-foreground))',
										}}
									>
										{getPropertyUsageLabel(property.usage)}
									</Text>
								</div>
							</div>
							<div className="flex items-center gap-1 mt-1">
								<MapPin
									style={{
										height: '0.875rem',
										width: '0.875rem',
										flexShrink: 0,
										color: 'hsl(var(--muted-foreground))',
									}}
								/>
								<Text size="sm" color="muted">
									{property.address}
									{property.address2 && `, ${property.address2}`}, {property.postalCode}{' '}
									{property.city}
								</Text>
							</div>
						</div>
					</div>
					<div className="flex items-center gap-3 shrink-0">
						<Button variant="outline" style={{ gap: '0.5rem' }} onClick={openEditPropertyDialog}>
							<Pencil style={{ height: '1rem', width: '1rem' }} />
							Modifier
						</Button>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon">
									<MoreHorizontal style={{ height: '1rem', width: '1rem' }} />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem>Exporter les données</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									style={{ color: 'hsl(var(--destructive))' }}
									onClick={() => setShowDeletePropertyDialog(true)}
								>
									<Trash2 style={{ height: '1rem', width: '1rem', marginRight: '0.5rem' }} />
									Supprimer
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>

			{/* Value Summary */}
			<StatCardGrid columns={4}>
				<StatCard
					label="Valeur actuelle"
					value={formatCurrency(property.currentValue)}
					icon={Building2}
					variant="default"
					description={`${appreciation >= 0 ? '+' : ''}${appreciation.toFixed(1)}% depuis l'achat`}
					trend={appreciation >= 0 ? 'up' : 'down'}
				/>
				<StatCard
					label="Équité"
					value={formatCurrency(equity)}
					icon={Wallet}
					variant="teal"
					description={
						property.currentValue > 0
							? `${((equity / property.currentValue) * 100).toFixed(0)}% de la valeur`
							: '-'
					}
				/>
				<StatCard
					label="Crédits restants"
					value={formatCurrency(totalLoansRemaining)}
					icon={CreditCard}
					variant="default"
					description={`${property._count.loans} prêt${property._count.loans !== 1 ? 's' : ''}`}
				/>
				<StatCard
					label="Investissement total"
					value={formatCurrency(totalInvestment)}
					icon={Landmark}
					variant="default"
					description="Prix + frais"
				/>
			</StatCardGrid>

			{/* Informations Section */}
			<GlassCard padding="lg">
				<div className="flex flex-col gap-4">
					<div className="flex items-center gap-3">
						<Home
							style={{ height: '1rem', width: '1rem', color: 'hsl(var(--muted-foreground))' }}
						/>
						<Heading level={3} size="md" weight="medium">
							Informations
						</Heading>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{/* Caractéristiques */}
						<div className="flex flex-col gap-3">
							<Text
								size="xs"
								weight="medium"
								color="muted"
								style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
							>
								Caractéristiques
							</Text>
							<div className="flex flex-col gap-3">
								<DetailItem label="Surface" value={`${property.surface} m²`} />
								<DetailItem label="Pièces" value={property.rooms} />
								<DetailItem label="Chambres" value={property.bedrooms} />
							</div>
						</div>

						{/* Achat */}
						<div className="flex flex-col gap-3">
							<Text
								size="xs"
								weight="medium"
								color="muted"
								style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
							>
								Achat
							</Text>
							<div className="flex flex-col gap-3">
								<CurrencyItem label="Prix d'achat" value={property.purchasePrice} />
								<CurrencyItem label="Frais de notaire" value={property.notaryFees} />
								<CurrencyItem label="Frais d'agence" value={property.agencyFees} />
								<DetailItem label="Date d'achat" value={formatDate(property.purchaseDate)} />
							</div>
						</div>

						{/* Valeur & Rentabilité */}
						<div className="flex flex-col gap-3">
							<Text
								size="xs"
								weight="medium"
								color="muted"
								style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
							>
								{isRental ? 'Valeur & Revenus' : 'Valeur'}
							</Text>
							<div className="flex flex-col gap-3">
								<CurrencyItem label="Valeur actuelle" value={property.currentValue} />
								{isRental && (
									<>
										<CurrencyItem label="Loyer mensuel" value={property.rentAmount} />
										<CurrencyItem label="Charges locatives" value={property.rentCharges} />
									</>
								)}
							</div>
						</div>
					</div>

					{/* Notes */}
					{property.notes && (
						<div className="mt-6 pt-6 border-t border-border/40">
							<Text
								size="xs"
								weight="medium"
								color="muted"
								style={{
									textTransform: 'uppercase',
									letterSpacing: '0.05em',
									marginBottom: '0.5rem',
								}}
							>
								Notes
							</Text>
							<Text size="sm" color="muted">
								{property.notes}
							</Text>
						</div>
					)}
				</div>
			</GlassCard>

			{/* Propriétaires Section */}
			<GlassCard padding="lg">
				<div className="flex flex-col gap-4">
					<div className="flex items-center gap-3">
						<Users
							style={{ height: '1rem', width: '1rem', color: 'hsl(var(--muted-foreground))' }}
						/>
						<Heading level={3} size="md" weight="medium">
							Propriétaires
						</Heading>
					</div>
					{property.propertyMembers.length === 0 ? (
						<Text size="sm" color="muted">
							Aucun propriétaire renseigné
						</Text>
					) : (
						<div className="flex flex-wrap gap-3">
							{property.propertyMembers.map((pm) => (
								<div
									key={pm.id}
									className="flex items-center gap-3"
									style={{
										borderRadius: '0.75rem',
										padding: '0.75rem 1rem',
										backgroundColor: 'hsl(var(--muted) / 0.3)',
									}}
								>
									<div
										className="flex items-center justify-center shrink-0"
										style={{
											height: '2.5rem',
											width: '2.5rem',
											borderRadius: '9999px',
											fontSize: '0.875rem',
											fontWeight: 500,
											color: 'white',
											backgroundColor: pm.member.color || '#6b7280',
										}}
									>
										{pm.member.name.charAt(0).toUpperCase()}
									</div>
									<div className="flex flex-col">
										<Text weight="medium">{pm.member.name}</Text>
										<Text size="sm" color="muted">
											{pm.ownershipShare}%
										</Text>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</GlassCard>

			{/* Prêts Section */}
			<GlassCard padding="lg">
				<div className="flex justify-between items-center">
					<Heading
						level={3}
						size="md"
						weight="medium"
						style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
					>
						<CreditCard
							style={{ height: '1rem', width: '1rem', color: 'hsl(var(--muted-foreground))' }}
						/>
						Prêts
					</Heading>
					<Dialog
						open={isLoanDialogOpen}
						onOpenChange={(open) => {
							setIsLoanDialogOpen(open);
							if (!open) resetLoanForm();
						}}
					>
						<DialogTrigger asChild>
							<Button
								variant="outline"
								size="sm"
								iconLeft={<Plus style={{ height: '1rem', width: '1rem' }} />}
							>
								Ajouter un prêt
							</Button>
						</DialogTrigger>
						<DialogContent style={{ maxWidth: '32rem', maxHeight: '90vh', overflowY: 'auto' }}>
							<DialogHeader>
								<DialogTitle>Ajouter un prêt</DialogTitle>
								<DialogDescription>
									Renseignez les informations du crédit immobilier.
								</DialogDescription>
							</DialogHeader>
							<form onSubmit={handleLoanSubmit}>
								<div className="flex flex-col gap-4">
									{/* Error message */}
									{loanFormError && (
										<div
											className="p-3 rounded-lg"
											style={{
												backgroundColor: 'hsl(var(--destructive) / 0.1)',
												border: '1px solid hsl(var(--destructive) / 0.2)',
											}}
										>
											<Text size="sm" style={{ color: 'hsl(var(--destructive))' }}>
												{loanFormError}
											</Text>
										</div>
									)}

									{/* Basic info */}
									<div className="flex flex-col gap-4">
										<div className="flex flex-col gap-2">
											<Label htmlFor="loan-name">Nom du prêt *</Label>
											<Input
												id="loan-name"
												placeholder="Crédit Immo Principal"
												value={loanFormData.name}
												onChange={(e) => handleLoanInputChange('name', e.target.value)}
											/>
										</div>

										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											<div className="flex flex-col gap-2">
												<Label htmlFor="loan-lender">Organisme prêteur</Label>
												<Input
													id="loan-lender"
													placeholder="Crédit Mutuel"
													value={loanFormData.lender}
													onChange={(e) => handleLoanInputChange('lender', e.target.value)}
												/>
											</div>
											<div className="flex flex-col gap-2">
												<Label htmlFor="loan-number">N° de contrat</Label>
												<Input
													id="loan-number"
													placeholder="PRE-2024-001"
													value={loanFormData.loanNumber}
													onChange={(e) => handleLoanInputChange('loanNumber', e.target.value)}
												/>
											</div>
										</div>
									</div>

									{/* Amounts */}
									<div className="flex flex-col gap-4">
										<Text size="sm" weight="medium" color="muted">
											Montants
										</Text>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											<div className="flex flex-col gap-2">
												<Label htmlFor="loan-initial">Montant initial (€) *</Label>
												<Input
													id="loan-initial"
													type="number"
													min="0"
													step="0.01"
													placeholder="280000"
													value={loanFormData.initialAmount}
													onChange={(e) => handleLoanInputChange('initialAmount', e.target.value)}
												/>
											</div>
											<div className="flex flex-col gap-2">
												<Label htmlFor="loan-remaining">Capital restant (€) *</Label>
												<Input
													id="loan-remaining"
													type="number"
													min="0"
													step="0.01"
													placeholder="250000"
													value={loanFormData.remainingAmount}
													onChange={(e) => handleLoanInputChange('remainingAmount', e.target.value)}
												/>
											</div>
										</div>
									</div>

									{/* Rate and payment */}
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<div className="flex flex-col gap-2">
											<Label htmlFor="loan-rate">Taux (%) *</Label>
											<Input
												id="loan-rate"
												type="number"
												min="0"
												max="100"
												step="0.01"
												placeholder="1.5"
												value={loanFormData.rate}
												onChange={(e) => handleLoanInputChange('rate', e.target.value)}
											/>
										</div>
										<div className="flex flex-col gap-2">
											<Label htmlFor="loan-monthly">Mensualité (€) *</Label>
											<Input
												id="loan-monthly"
												type="number"
												min="0"
												step="0.01"
												placeholder="1200"
												value={loanFormData.monthlyPayment}
												onChange={(e) => handleLoanInputChange('monthlyPayment', e.target.value)}
											/>
										</div>
									</div>

									{/* Dates */}
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<div className="flex flex-col gap-2">
											<Label htmlFor="loan-start">Date de début *</Label>
											<Input
												id="loan-start"
												type="date"
												value={loanFormData.startDate}
												onChange={(e) => handleLoanInputChange('startDate', e.target.value)}
											/>
										</div>
										<div className="flex flex-col gap-2">
											<Label htmlFor="loan-end">Date de fin</Label>
											<Input
												id="loan-end"
												type="date"
												value={loanFormData.endDate}
												onChange={(e) => handleLoanInputChange('endDate', e.target.value)}
											/>
										</div>
									</div>

									{/* Notes */}
									<div className="flex flex-col gap-2">
										<Label htmlFor="loan-notes">Notes</Label>
										<Input
											id="loan-notes"
											placeholder="Notes additionnelles..."
											value={loanFormData.notes}
											onChange={(e) => handleLoanInputChange('notes', e.target.value)}
										/>
									</div>

									<DialogFooter style={{ paddingTop: '1rem' }}>
										<Button
											type="button"
											variant="outline"
											onClick={() => setIsLoanDialogOpen(false)}
											disabled={isSubmittingLoan}
										>
											Annuler
										</Button>
										<Button type="submit" disabled={isSubmittingLoan}>
											{isSubmittingLoan ? (
												<span className="flex items-center gap-3">
													<Loader2
														style={{
															height: '1rem',
															width: '1rem',
															animation: 'spin 1s linear infinite',
														}}
													/>
													Création...
												</span>
											) : (
												'Créer le prêt'
											)}
										</Button>
									</DialogFooter>
								</div>
							</form>
						</DialogContent>
					</Dialog>
				</div>
				{property.loans.length === 0 ? (
					<LoansEmptyState onAddClick={() => setIsLoanDialogOpen(true)} />
				) : (
					<div className="flex flex-col gap-4">
						{/* Summary stats */}
						<div
							className="grid grid-cols-3 gap-4 p-4 rounded-xl"
							style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}
						>
							<div className="text-center">
								<Text size="xs" color="muted">
									Capital restant
								</Text>
								<Text size="lg" weight="semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
									{formatCurrency(totalLoansRemaining)}
								</Text>
							</div>
							<div className="text-center">
								<Text size="xs" color="muted">
									Mensualités
								</Text>
								<Text size="lg" weight="semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
									{formatCurrency(property.loans.reduce((sum, l) => sum + l.monthlyPayment, 0))}
								</Text>
							</div>
							<div className="text-center">
								<Text size="xs" color="muted">
									Taux moyen
								</Text>
								<Text size="lg" weight="semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
									{property.loans.length > 0
										? (
												property.loans.reduce((sum, l) => sum + l.rate, 0) / property.loans.length
											).toFixed(2)
										: 0}
									%
								</Text>
							</div>
						</div>

						{/* Loan cards */}
						<div className="flex flex-col gap-3">
							{property.loans.map((loan) => (
								<LoanCard key={loan.id} loan={loan} onAddInsurance={handleOpenInsuranceDialog} />
							))}
						</div>
					</div>
				)}
			</GlassCard>

			{/* Assurance Section */}
			<GlassCard padding="lg">
				<div className="flex justify-between items-center">
					<Heading
						level={3}
						size="md"
						weight="medium"
						style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
					>
						<Shield
							style={{ height: '1rem', width: '1rem', color: 'hsl(var(--muted-foreground))' }}
						/>
						Assurance habitation
					</Heading>
					{!property.insurance && (
						<Button
							variant="outline"
							size="sm"
							iconLeft={<Plus style={{ height: '1rem', width: '1rem' }} />}
							onClick={() => openPropertyInsuranceDialog(false)}
						>
							Ajouter une assurance
						</Button>
					)}
				</div>
				{property.insurance ? (
					<div
						className="flex flex-col gap-4 p-4"
						style={{ borderRadius: '0.75rem', border: '1px solid hsl(var(--border) / 0.6)' }}
					>
						{/* Header with type badge and actions */}
						<div className="flex justify-between items-start gap-4">
							<div className="flex items-center gap-4">
								<div
									className="flex items-center justify-center shrink-0"
									style={{
										height: '2.5rem',
										width: '2.5rem',
										borderRadius: '0.75rem',
										backgroundColor: 'hsl(var(--primary) / 0.1)',
									}}
								>
									<Shield
										style={{ height: '1.25rem', width: '1.25rem', color: 'hsl(var(--primary))' }}
									/>
								</div>
								<div className="flex flex-col">
									<div className="flex items-center gap-3">
										<Text weight="medium">{property.insurance.provider}</Text>
										<Text
											size="xs"
											style={{
												padding: '0.125rem 0.5rem',
												borderRadius: '9999px',
												backgroundColor: 'hsl(var(--primary) / 0.1)',
												color: 'hsl(var(--primary))',
											}}
										>
											{getInsuranceTypeBadge(property.insurance.type)}
										</Text>
									</div>
									<Text size="sm" color="muted">
										{getInsuranceTypeLabel(property.insurance.type)}
									</Text>
								</div>
							</div>
							<div className="flex items-center gap-3 shrink-0">
								<Button
									variant="ghost"
									size="icon"
									style={{ height: '2rem', width: '2rem' }}
									onClick={() => openPropertyInsuranceDialog(true)}
								>
									<Pencil style={{ height: '1rem', width: '1rem' }} />
								</Button>
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											style={{ height: '2rem', width: '2rem', color: 'hsl(var(--destructive))' }}
										>
											<Trash2 style={{ height: '1rem', width: '1rem' }} />
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>Supprimer l'assurance ?</AlertDialogTitle>
											<AlertDialogDescription>
												Cette action est irréversible. L'assurance habitation sera définitivement
												supprimée.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>Annuler</AlertDialogCancel>
											<AlertDialogAction
												onClick={handleDeletePropertyInsurance}
												disabled={isDeletingPropertyInsurance}
												style={{
													backgroundColor: 'hsl(var(--destructive))',
													color: 'hsl(var(--destructive-foreground))',
												}}
											>
												{isDeletingPropertyInsurance ? (
													<span className="flex items-center gap-3">
														<Loader2
															style={{
																height: '1rem',
																width: '1rem',
																animation: 'spin 1s linear infinite',
															}}
														/>
														Suppression...
													</span>
												) : (
													'Supprimer'
												)}
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</div>
						</div>

						{/* Insurance details */}
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border/40">
							<div>
								<Text size="xs" color="muted">
									Prime mensuelle
								</Text>
								<Text weight="medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
									{formatCurrency(property.insurance.monthlyPremium)}
								</Text>
								<Text size="xs" color="muted" style={{ marginTop: '0.125rem' }}>
									{formatCurrency(property.insurance.monthlyPremium * 12)}/an
								</Text>
							</div>
							<div>
								<Text size="xs" color="muted">
									Date de début
								</Text>
								<Text weight="medium">{formatDate(property.insurance.startDate.toString())}</Text>
							</div>
							{property.insurance.endDate && (
								<div>
									<Text size="xs" color="muted">
										Date de fin
									</Text>
									<Text weight="medium">{formatDate(property.insurance.endDate.toString())}</Text>
								</div>
							)}
						</div>

						{/* Additional info */}
						{(property.insurance.contractNumber ||
							property.insurance.coverage ||
							property.insurance.link) && (
							<div
								className="flex flex-col gap-2"
								style={{ paddingTop: '0.5rem', borderTop: '1px solid hsl(var(--border) / 0.4)' }}
							>
								{property.insurance.contractNumber && (
									<Text size="xs" color="muted">
										N° contrat:{' '}
										<Text as="span" style={{ color: 'hsl(var(--foreground))' }}>
											{property.insurance.contractNumber}
										</Text>
									</Text>
								)}
								{property.insurance.coverage && (
									<Text size="xs" color="muted">
										Couverture:{' '}
										<Text as="span" style={{ color: 'hsl(var(--foreground))' }}>
											{property.insurance.coverage}
										</Text>
									</Text>
								)}
								{property.insurance.link && (
									<a
										href={property.insurance.link}
										target="_blank"
										rel="noopener noreferrer"
										style={{
											display: 'inline-flex',
											alignItems: 'center',
											gap: '0.25rem',
											fontSize: '0.75rem',
											color: 'hsl(var(--primary))',
											textDecoration: 'none',
										}}
									>
										<ExternalLink style={{ height: '0.75rem', width: '0.75rem' }} />
										Voir le contrat
									</a>
								)}
							</div>
						)}

						{property.insurance.notes && (
							<div className="pt-2 border-t border-border/40">
								<Text size="xs" color="muted">
									Notes
								</Text>
								<Text size="sm" color="muted" style={{ marginTop: '0.125rem' }}>
									{property.insurance.notes}
								</Text>
							</div>
						)}
					</div>
				) : (
					<div
						className="flex flex-col items-center justify-center text-center"
						style={{ padding: '2rem 0' }}
					>
						<div
							className="flex items-center justify-center"
							style={{
								height: '3rem',
								width: '3rem',
								borderRadius: '0.75rem',
								backgroundColor: 'hsl(var(--muted) / 0.5)',
								marginBottom: '0.75rem',
							}}
						>
							<Shield
								style={{ height: '1.5rem', width: '1.5rem', color: 'hsl(var(--muted-foreground))' }}
							/>
						</div>
						<Text weight="medium" style={{ marginBottom: '0.25rem' }}>
							Aucune assurance
						</Text>
						<Text size="sm" color="muted" style={{ marginBottom: '1rem' }}>
							Ajoutez l'assurance habitation de ce bien (MRH ou PNO).
						</Text>
						<Button
							variant="outline"
							size="sm"
							iconLeft={<Plus style={{ height: '1rem', width: '1rem' }} />}
							onClick={() => openPropertyInsuranceDialog(false)}
						>
							Ajouter une assurance
						</Button>
					</div>
				)}
			</GlassCard>

			{/* Copropriété Section */}
			<GlassCard padding="lg">
				<div className="flex justify-between items-center">
					<Heading
						level={3}
						size="md"
						weight="medium"
						style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
					>
						<Building2
							style={{ height: '1rem', width: '1rem', color: 'hsl(var(--muted-foreground))' }}
						/>
						Copropriété
					</Heading>
					{!property.coOwnership && (
						<Button
							variant="outline"
							size="sm"
							iconLeft={<Plus style={{ height: '1rem', width: '1rem' }} />}
							onClick={() => openCoOwnershipDialog(false)}
						>
							Ajouter
						</Button>
					)}
				</div>
				{property.coOwnership ? (
					<div
						className="flex flex-col gap-4 p-4"
						style={{
							borderRadius: '0.75rem',
							border: '1px solid hsl(var(--border))',
							borderColor: 'hsl(var(--border) / 0.6)',
						}}
					>
						{/* Header with syndic name and actions */}
						<div className="flex justify-between items-start gap-4">
							<div className="flex items-center gap-4">
								<div
									className="flex items-center justify-center shrink-0"
									style={{
										height: '2.5rem',
										width: '2.5rem',
										borderRadius: '0.75rem',
										backgroundColor: 'hsl(var(--primary) / 0.1)',
									}}
								>
									<Building2
										style={{ height: '1.25rem', width: '1.25rem', color: 'hsl(var(--primary))' }}
									/>
								</div>
								<div className="flex flex-col">
									<Text weight="medium">{property.coOwnership.name}</Text>
									<Text size="sm" color="muted">
										Syndic de copropriété
									</Text>
								</div>
							</div>
							<div className="flex items-center gap-3 shrink-0">
								<Button
									variant="ghost"
									size="icon"
									style={{ height: '2rem', width: '2rem' }}
									onClick={() => openCoOwnershipDialog(true)}
								>
									<Pencil style={{ height: '1rem', width: '1rem' }} />
								</Button>
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											style={{ height: '2rem', width: '2rem', color: 'hsl(var(--destructive))' }}
										>
											<Trash2 style={{ height: '1rem', width: '1rem' }} />
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>Supprimer la copropriété ?</AlertDialogTitle>
											<AlertDialogDescription>
												Cette action est irréversible. Les informations de copropriété seront
												définitivement supprimées.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>Annuler</AlertDialogCancel>
											<AlertDialogAction
												onClick={handleDeleteCoOwnership}
												disabled={isDeletingCoOwnership}
												style={{
													backgroundColor: 'hsl(var(--destructive))',
													color: 'hsl(var(--destructive-foreground))',
												}}
											>
												{isDeletingCoOwnership ? (
													<>
														<Loader2
															style={{
																marginRight: '0.5rem',
																height: '1rem',
																width: '1rem',
																animation: 'spin 1s linear infinite',
															}}
														/>
														Suppression...
													</>
												) : (
													'Supprimer'
												)}
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</div>
						</div>

						{/* Amounts */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/40">
							<div className="flex flex-col">
								<Text size="xs" color="muted">
									Charges trimestrielles
								</Text>
								<Text weight="medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
									{formatCurrency(property.coOwnership.quarterlyAmount)}
								</Text>
							</div>
							<div className="flex flex-col">
								<Text size="xs" color="muted">
									Charges annuelles
								</Text>
								<Text weight="medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
									{formatCurrency(property.coOwnership.quarterlyAmount * 4)}
								</Text>
							</div>
						</div>

						{/* Additional info */}
						{property.coOwnership.link && (
							<div className="pt-2 border-t border-border/40">
								<a
									href={property.coOwnership.link}
									target="_blank"
									rel="noopener noreferrer"
									style={{
										display: 'inline-flex',
										alignItems: 'center',
										gap: '0.25rem',
										fontSize: '0.75rem',
										color: 'hsl(var(--primary))',
									}}
								>
									<ExternalLink style={{ height: '0.75rem', width: '0.75rem' }} />
									Voir les documents
								</a>
							</div>
						)}

						{property.coOwnership.notes && (
							<div className="pt-2 border-t border-border/40">
								<Text size="xs" color="muted">
									Notes
								</Text>
								<Text size="sm" color="muted" style={{ marginTop: '0.125rem' }}>
									{property.coOwnership.notes}
								</Text>
							</div>
						)}
					</div>
				) : (
					<div
						className="flex flex-col items-center justify-center text-center"
						style={{ padding: '2rem 0' }}
					>
						<div
							className="flex items-center justify-center"
							style={{
								height: '3rem',
								width: '3rem',
								borderRadius: '0.75rem',
								backgroundColor: 'hsl(var(--muted) / 0.5)',
								marginBottom: '0.75rem',
							}}
						>
							<Building2
								style={{ height: '1.5rem', width: '1.5rem', color: 'hsl(var(--muted-foreground))' }}
							/>
						</div>
						<Text weight="medium" style={{ marginBottom: '0.25rem' }}>
							Aucune copropriété
						</Text>
						<Text size="sm" color="muted" style={{ marginBottom: '1rem' }}>
							Ajoutez les informations du syndic et des charges de copropriété.
						</Text>
						<Button
							variant="outline"
							size="sm"
							iconLeft={<Plus style={{ height: '1rem', width: '1rem' }} />}
							onClick={() => openCoOwnershipDialog(false)}
						>
							Ajouter
						</Button>
					</div>
				)}
			</GlassCard>

			{/* Contrats Section */}
			<GlassCard padding="lg">
				<div className="flex justify-between items-center">
					<Heading
						level={3}
						size="md"
						weight="medium"
						style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
					>
						<Zap style={{ height: '1rem', width: '1rem', color: 'hsl(var(--muted-foreground))' }} />
						Contrats & Abonnements
					</Heading>
					<Button
						variant="outline"
						size="sm"
						iconLeft={<Plus style={{ height: '1rem', width: '1rem' }} />}
						onClick={() => openUtilityContractDialog()}
					>
						Ajouter un contrat
					</Button>
				</div>
				{property.utilityContracts.length === 0 ? (
					<div
						className="flex flex-col items-center justify-center text-center"
						style={{ padding: '2rem 0' }}
					>
						<div
							className="flex items-center justify-center"
							style={{
								height: '3rem',
								width: '3rem',
								borderRadius: '0.75rem',
								backgroundColor: 'hsl(var(--muted) / 0.5)',
								marginBottom: '0.75rem',
							}}
						>
							<Zap
								style={{ height: '1.5rem', width: '1.5rem', color: 'hsl(var(--muted-foreground))' }}
							/>
						</div>
						<Text weight="medium" style={{ marginBottom: '0.25rem' }}>
							Aucun contrat
						</Text>
						<Text size="sm" color="muted" style={{ marginBottom: '1rem' }}>
							Ajoutez les contrats d'énergie et abonnements liés à ce bien.
						</Text>
						<Button
							variant="outline"
							size="sm"
							iconLeft={<Plus style={{ height: '1rem', width: '1rem' }} />}
							onClick={() => openUtilityContractDialog()}
						>
							Ajouter un contrat
						</Button>
					</div>
				) : (
					<div className="flex flex-col gap-4">
						{/* Summary stats */}
						<div
							className="grid grid-cols-2 gap-4 p-4 rounded-xl"
							style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}
						>
							<div className="flex flex-col items-center">
								<Text size="xs" color="muted">
									Nombre de contrats
								</Text>
								<Text size="lg" weight="semibold">
									{property.utilityContracts.length}
								</Text>
							</div>
							<div className="flex flex-col items-center">
								<Text size="xs" color="muted">
									Total mensuel
								</Text>
								<Text size="lg" weight="semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
									{formatCurrency(
										property.utilityContracts.reduce((sum, c) => sum + c.monthlyAmount, 0),
									)}
								</Text>
							</div>
						</div>

						{/* Contract list */}
						<div className="flex flex-col gap-3">
							{property.utilityContracts.map((contract) => {
								const IconComponent = getUtilityTypeIcon(contract.type);
								return (
									<div
										key={contract.id}
										className="rounded-xl border border-border p-4"
										style={{ borderColor: 'hsl(var(--border) / 0.6)' }}
									>
										<div className="flex justify-between items-start gap-4">
											<div className="flex items-center gap-4">
												<div
													className="flex items-center justify-center shrink-0"
													style={{
														height: '2.5rem',
														width: '2.5rem',
														borderRadius: '0.75rem',
														backgroundColor: 'hsl(var(--primary) / 0.1)',
													}}
												>
													<IconComponent
														style={{
															height: '1.25rem',
															width: '1.25rem',
															color: 'hsl(var(--primary))',
														}}
													/>
												</div>
												<div className="flex flex-col">
													<div className="flex items-center gap-3">
														<Text weight="medium">{contract.provider}</Text>
														<span
															className="rounded-full"
															style={{
																fontSize: '0.75rem',
																padding: '0.125rem 0.5rem',
																backgroundColor: 'hsl(var(--muted))',
																color: 'hsl(var(--muted-foreground))',
															}}
														>
															{getUtilityTypeLabel(contract.type)}
														</span>
													</div>
													<Text
														size="sm"
														color="muted"
														style={{ fontVariantNumeric: 'tabular-nums' }}
													>
														{formatCurrency(contract.monthlyAmount)}/mois
														<span style={{ fontSize: '0.75rem', marginLeft: '0.25rem' }}>
															({formatCurrency(contract.monthlyAmount * 12)}/an)
														</span>
													</Text>
												</div>
											</div>
											<div className="flex items-center gap-3 shrink-0">
												<Button
													variant="ghost"
													size="icon"
													style={{ height: '2rem', width: '2rem' }}
													onClick={() => openUtilityContractDialog(contract)}
												>
													<Pencil style={{ height: '1rem', width: '1rem' }} />
												</Button>
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															style={{
																height: '2rem',
																width: '2rem',
																color: 'hsl(var(--destructive))',
															}}
														>
															<Trash2 style={{ height: '1rem', width: '1rem' }} />
														</Button>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>Supprimer ce contrat ?</AlertDialogTitle>
															<AlertDialogDescription>
																Cette action est irréversible. Le contrat {contract.provider} sera
																définitivement supprimé.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>Annuler</AlertDialogCancel>
															<AlertDialogAction
																onClick={() => handleDeleteUtilityContract(contract.id)}
																disabled={deletingUtilityContractId === contract.id}
																style={{
																	backgroundColor: 'hsl(var(--destructive))',
																	color: 'hsl(var(--destructive-foreground))',
																}}
															>
																{deletingUtilityContractId === contract.id ? (
																	<>
																		<Loader2
																			style={{
																				marginRight: '0.5rem',
																				height: '1rem',
																				width: '1rem',
																				animation: 'spin 1s linear infinite',
																			}}
																		/>
																		Suppression...
																	</>
																) : (
																	'Supprimer'
																)}
															</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											</div>
										</div>

										{/* Additional info */}
										{(contract.contractNumber || contract.link) && (
											<div
												className="flex justify-between items-center gap-4"
												style={{
													marginTop: '0.75rem',
													paddingTop: '0.75rem',
													borderTop: '1px solid hsl(var(--border) / 0.4)',
												}}
											>
												{contract.contractNumber && (
													<Text size="xs" color="muted">
														N° contrat:{' '}
														<span style={{ color: 'hsl(var(--foreground))' }}>
															{contract.contractNumber}
														</span>
													</Text>
												)}
												{contract.link && (
													<a
														href={contract.link}
														target="_blank"
														rel="noopener noreferrer"
														style={{
															display: 'inline-flex',
															alignItems: 'center',
															gap: '0.25rem',
															fontSize: '0.75rem',
															color: 'hsl(var(--primary))',
														}}
													>
														<ExternalLink style={{ height: '0.75rem', width: '0.75rem' }} />
														Voir le contrat
													</a>
												)}
											</div>
										)}

										{contract.notes && (
											<div className="mt-2 pt-2 border-t border-border/40">
												<Text size="xs" color="muted">
													{contract.notes}
												</Text>
											</div>
										)}
									</div>
								);
							})}
						</div>
					</div>
				)}
			</GlassCard>

			{/* Insurance Dialog */}
			<Dialog
				open={isInsuranceDialogOpen}
				onOpenChange={(open) => {
					setIsInsuranceDialogOpen(open);
					if (!open) resetInsuranceForm();
				}}
			>
				<DialogContent style={{ maxWidth: '32rem', maxHeight: '90vh', overflowY: 'auto' }}>
					<DialogHeader>
						<DialogTitle>Ajouter une assurance emprunteur</DialogTitle>
						<DialogDescription>
							Renseignez les informations de l'assurance pour ce prêt.
						</DialogDescription>
					</DialogHeader>
					<form
						onSubmit={handleInsuranceSubmit}
						style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
					>
						{/* Error message */}
						{insuranceFormError && (
							<div
								className="p-3 rounded-lg"
								style={{
									backgroundColor: 'hsl(var(--destructive) / 0.1)',
									border: '1px solid hsl(var(--destructive) / 0.2)',
								}}
							>
								<Text size="sm" style={{ color: 'hsl(var(--destructive))' }}>
									{insuranceFormError}
								</Text>
							</div>
						)}

						{/* Member selection */}
						<div className="flex flex-col gap-2">
							<Label htmlFor="insurance-member">Emprunteur assuré *</Label>
							{loadingMembers ? (
								<Skeleton style={{ height: '2.5rem', width: '100%' }} />
							) : (
								<Select
									value={insuranceFormData.memberId}
									onValueChange={(value) => handleInsuranceInputChange('memberId', value)}
								>
									<SelectTrigger id="insurance-member">
										<SelectValue placeholder="Sélectionner un membre" />
									</SelectTrigger>
									<SelectContent>
										{members.map((member) => (
											<SelectItem key={member.id} value={member.id}>
												<span className="flex items-center gap-3">
													<div
														className="rounded-full h-4 w-4"
														style={{
															backgroundColor: member.color || '#6b7280',
														}}
													/>
													{member.name}
												</span>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						</div>

						{/* Insurance info */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="flex flex-col gap-2">
								<Label htmlFor="insurance-name">Nom de l'assurance *</Label>
								<Input
									id="insurance-name"
									placeholder="Assurance ADI"
									value={insuranceFormData.name}
									onChange={(e) => handleInsuranceInputChange('name', e.target.value)}
								/>
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="insurance-provider">Assureur *</Label>
								<Input
									id="insurance-provider"
									placeholder="April, CNP, MAIF..."
									value={insuranceFormData.provider}
									onChange={(e) => handleInsuranceInputChange('provider', e.target.value)}
								/>
							</div>
						</div>

						{/* Coverage and premium */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="flex flex-col gap-2">
								<Label htmlFor="insurance-coverage">Quotité (%) *</Label>
								<Input
									id="insurance-coverage"
									type="number"
									min="0"
									max="100"
									step="1"
									placeholder="50"
									value={insuranceFormData.coveragePercent}
									onChange={(e) => handleInsuranceInputChange('coveragePercent', e.target.value)}
								/>
								<Text size="xs" color="muted">
									Pourcentage du capital couvert
								</Text>
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="insurance-premium">Prime mensuelle (€) *</Label>
								<Input
									id="insurance-premium"
									type="number"
									min="0"
									step="0.01"
									placeholder="25"
									value={insuranceFormData.monthlyPremium}
									onChange={(e) => handleInsuranceInputChange('monthlyPremium', e.target.value)}
								/>
							</div>
						</div>

						{/* Contract number */}
						<div className="flex flex-col gap-2">
							<Label htmlFor="insurance-contract">N° de contrat</Label>
							<Input
								id="insurance-contract"
								placeholder="ASS-2024-001"
								value={insuranceFormData.contractNumber}
								onChange={(e) => handleInsuranceInputChange('contractNumber', e.target.value)}
							/>
						</div>

						{/* Link */}
						<div className="flex flex-col gap-2">
							<Label htmlFor="insurance-link">Lien vers le contrat</Label>
							<Input
								id="insurance-link"
								placeholder="https://..."
								value={insuranceFormData.link}
								onChange={(e) => handleInsuranceInputChange('link', e.target.value)}
							/>
						</div>

						{/* Notes */}
						<div className="flex flex-col gap-2">
							<Label htmlFor="insurance-notes">Notes</Label>
							<Input
								id="insurance-notes"
								placeholder="Notes additionnelles..."
								value={insuranceFormData.notes}
								onChange={(e) => handleInsuranceInputChange('notes', e.target.value)}
							/>
						</div>

						<DialogFooter style={{ paddingTop: '1rem' }}>
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsInsuranceDialogOpen(false)}
								disabled={isSubmittingInsurance}
							>
								Annuler
							</Button>
							<Button type="submit" disabled={isSubmittingInsurance}>
								{isSubmittingInsurance ? (
									<>
										<Loader2
											style={{
												marginRight: '0.5rem',
												height: '1rem',
												width: '1rem',
												animation: 'spin 1s linear infinite',
											}}
										/>
										Création...
									</>
								) : (
									"Ajouter l'assurance"
								)}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Property Insurance Dialog */}
			<Dialog
				open={isPropertyInsuranceDialogOpen}
				onOpenChange={(open) => {
					setIsPropertyInsuranceDialogOpen(open);
					if (!open) resetPropertyInsuranceForm();
				}}
			>
				<DialogContent style={{ maxWidth: '32rem', maxHeight: '90vh', overflowY: 'auto' }}>
					<DialogHeader>
						<DialogTitle>
							{isEditingPropertyInsurance ? "Modifier l'assurance" : 'Ajouter une assurance'}
						</DialogTitle>
						<DialogDescription>
							Renseignez les informations de l'assurance habitation (MRH ou PNO).
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handlePropertyInsuranceSubmit}>
						<div className="flex flex-col gap-4">
							{/* Error message */}
							{propertyInsuranceFormError && (
								<div
									className="p-3 rounded-lg"
									style={{
										backgroundColor: 'hsl(var(--destructive) / 0.1)',
										border: '1px solid hsl(var(--destructive) / 0.2)',
									}}
								>
									<Text size="sm" style={{ color: 'hsl(var(--destructive))' }}>
										{propertyInsuranceFormError}
									</Text>
								</div>
							)}

							{/* Type selection */}
							<div className="flex flex-col gap-2">
								<Label htmlFor="property-insurance-type">Type d'assurance *</Label>
								<Select
									value={propertyInsuranceFormData.type}
									onValueChange={(value) => handlePropertyInsuranceInputChange('type', value)}
								>
									<SelectTrigger id="property-insurance-type">
										<SelectValue placeholder="Sélectionner le type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="MRH">
											<div className="flex flex-col">
												<span>MRH - Multirisque Habitation</span>
												<Text size="xs" color="muted">
													Pour les occupants du bien
												</Text>
											</div>
										</SelectItem>
										<SelectItem value="PNO">
											<div className="flex flex-col">
												<span>PNO - Propriétaire Non-Occupant</span>
												<Text size="xs" color="muted">
													Pour les biens locatifs
												</Text>
											</div>
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Provider and contract */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="flex flex-col gap-2">
									<Label htmlFor="property-insurance-provider">Assureur *</Label>
									<Input
										id="property-insurance-provider"
										placeholder="MAIF, AXA, Groupama..."
										value={propertyInsuranceFormData.provider}
										onChange={(e) => handlePropertyInsuranceInputChange('provider', e.target.value)}
									/>
								</div>
								<div className="flex flex-col gap-2">
									<Label htmlFor="property-insurance-contract">N° de contrat</Label>
									<Input
										id="property-insurance-contract"
										placeholder="HAB-2024-001"
										value={propertyInsuranceFormData.contractNumber}
										onChange={(e) =>
											handlePropertyInsuranceInputChange('contractNumber', e.target.value)
										}
									/>
								</div>
							</div>

							{/* Premium */}
							<div className="flex flex-col gap-2">
								<Label htmlFor="property-insurance-premium">Prime mensuelle (€) *</Label>
								<Input
									id="property-insurance-premium"
									type="number"
									min="0"
									step="0.01"
									placeholder="35"
									value={propertyInsuranceFormData.monthlyPremium}
									onChange={(e) =>
										handlePropertyInsuranceInputChange('monthlyPremium', e.target.value)
									}
								/>
								{propertyInsuranceFormData.monthlyPremium && (
									<Text size="xs" color="muted">
										Soit{' '}
										{formatCurrency(
											Number.parseFloat(propertyInsuranceFormData.monthlyPremium) * 12,
										)}
										/an
									</Text>
								)}
							</div>

							{/* Dates */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="flex flex-col gap-2">
									<Label htmlFor="property-insurance-start">Date de début *</Label>
									<Input
										id="property-insurance-start"
										type="date"
										value={propertyInsuranceFormData.startDate}
										onChange={(e) =>
											handlePropertyInsuranceInputChange('startDate', e.target.value)
										}
									/>
								</div>
								<div className="flex flex-col gap-2">
									<Label htmlFor="property-insurance-end">Date de fin</Label>
									<Input
										id="property-insurance-end"
										type="date"
										value={propertyInsuranceFormData.endDate}
										onChange={(e) => handlePropertyInsuranceInputChange('endDate', e.target.value)}
									/>
								</div>
							</div>

							{/* Coverage */}
							<div className="flex flex-col gap-2">
								<Label htmlFor="property-insurance-coverage">Couverture</Label>
								<Input
									id="property-insurance-coverage"
									placeholder="Dégâts des eaux, incendie, vol..."
									value={propertyInsuranceFormData.coverage}
									onChange={(e) => handlePropertyInsuranceInputChange('coverage', e.target.value)}
								/>
							</div>

							{/* Link */}
							<div className="flex flex-col gap-2">
								<Label htmlFor="property-insurance-link">Lien vers le contrat</Label>
								<Input
									id="property-insurance-link"
									placeholder="https://..."
									value={propertyInsuranceFormData.link}
									onChange={(e) => handlePropertyInsuranceInputChange('link', e.target.value)}
								/>
							</div>

							{/* Notes */}
							<div className="flex flex-col gap-2">
								<Label htmlFor="property-insurance-notes">Notes</Label>
								<Input
									id="property-insurance-notes"
									placeholder="Notes additionnelles..."
									value={propertyInsuranceFormData.notes}
									onChange={(e) => handlePropertyInsuranceInputChange('notes', e.target.value)}
								/>
							</div>

							<DialogFooter style={{ paddingTop: '1rem' }}>
								<Button
									type="button"
									variant="outline"
									onClick={() => setIsPropertyInsuranceDialogOpen(false)}
									disabled={isSubmittingPropertyInsurance}
								>
									Annuler
								</Button>
								<Button type="submit" disabled={isSubmittingPropertyInsurance}>
									{isSubmittingPropertyInsurance ? (
										<span className="flex items-center gap-3">
											<Loader2
												style={{
													height: '1rem',
													width: '1rem',
													animation: 'spin 1s linear infinite',
												}}
											/>
											{isEditingPropertyInsurance ? 'Modification...' : 'Création...'}
										</span>
									) : isEditingPropertyInsurance ? (
										'Modifier'
									) : (
										'Ajouter'
									)}
								</Button>
							</DialogFooter>
						</div>
					</form>
				</DialogContent>
			</Dialog>

			{/* Co-Ownership Dialog */}
			<Dialog
				open={isCoOwnershipDialogOpen}
				onOpenChange={(open) => {
					setIsCoOwnershipDialogOpen(open);
					if (!open) resetCoOwnershipForm();
				}}
			>
				<DialogContent style={{ maxWidth: '32rem', maxHeight: '90vh', overflowY: 'auto' }}>
					<DialogHeader>
						<DialogTitle>
							{isEditingCoOwnership ? 'Modifier la copropriété' : 'Ajouter une copropriété'}
						</DialogTitle>
						<DialogDescription>
							Renseignez les informations du syndic et des charges de copropriété.
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleCoOwnershipSubmit}>
						<div className="flex flex-col gap-4">
							{/* Error message */}
							{coOwnershipFormError && (
								<div
									className="p-3 rounded-lg"
									style={{
										backgroundColor: 'hsl(var(--destructive) / 0.1)',
										border: '1px solid hsl(var(--destructive) / 0.2)',
									}}
								>
									<Text size="sm" style={{ color: 'hsl(var(--destructive))' }}>
										{coOwnershipFormError}
									</Text>
								</div>
							)}

							{/* Syndic name */}
							<div className="flex flex-col gap-2">
								<Label htmlFor="coownership-name">Nom du syndic *</Label>
								<Input
									id="coownership-name"
									placeholder="Foncia, Nexity, Citya..."
									value={coOwnershipFormData.name}
									onChange={(e) => handleCoOwnershipInputChange('name', e.target.value)}
								/>
							</div>

							{/* Quarterly amount */}
							<div className="flex flex-col gap-2">
								<Label htmlFor="coownership-amount">Charges trimestrielles (€) *</Label>
								<Input
									id="coownership-amount"
									type="number"
									min="0"
									step="0.01"
									placeholder="450"
									value={coOwnershipFormData.quarterlyAmount}
									onChange={(e) => handleCoOwnershipInputChange('quarterlyAmount', e.target.value)}
								/>
								{coOwnershipFormData.quarterlyAmount && (
									<Text size="xs" color="muted">
										Soit{' '}
										{formatCurrency(Number.parseFloat(coOwnershipFormData.quarterlyAmount) * 4)}/an
									</Text>
								)}
							</div>

							{/* Link */}
							<div className="flex flex-col gap-2">
								<Label htmlFor="coownership-link">Lien vers les documents</Label>
								<Input
									id="coownership-link"
									placeholder="https://..."
									value={coOwnershipFormData.link}
									onChange={(e) => handleCoOwnershipInputChange('link', e.target.value)}
								/>
							</div>

							{/* Notes */}
							<div className="flex flex-col gap-2">
								<Label htmlFor="coownership-notes">Notes</Label>
								<Input
									id="coownership-notes"
									placeholder="Notes additionnelles..."
									value={coOwnershipFormData.notes}
									onChange={(e) => handleCoOwnershipInputChange('notes', e.target.value)}
								/>
							</div>

							<DialogFooter style={{ paddingTop: '1rem' }}>
								<Button
									type="button"
									variant="outline"
									onClick={() => setIsCoOwnershipDialogOpen(false)}
									disabled={isSubmittingCoOwnership}
								>
									Annuler
								</Button>
								<Button type="submit" disabled={isSubmittingCoOwnership}>
									{isSubmittingCoOwnership ? (
										<span className="flex items-center gap-3">
											<Loader2
												style={{
													height: '1rem',
													width: '1rem',
													animation: 'spin 1s linear infinite',
												}}
											/>
											{isEditingCoOwnership ? 'Modification...' : 'Création...'}
										</span>
									) : isEditingCoOwnership ? (
										'Modifier'
									) : (
										'Ajouter'
									)}
								</Button>
							</DialogFooter>
						</div>
					</form>
				</DialogContent>
			</Dialog>

			{/* Utility Contract Dialog */}
			<Dialog
				open={isUtilityContractDialogOpen}
				onOpenChange={(open) => {
					setIsUtilityContractDialogOpen(open);
					if (!open) resetUtilityContractForm();
				}}
			>
				<DialogContent style={{ maxWidth: '32rem', maxHeight: '90vh', overflowY: 'auto' }}>
					<DialogHeader>
						<DialogTitle>
							{editingUtilityContractId ? 'Modifier le contrat' : 'Ajouter un contrat'}
						</DialogTitle>
						<DialogDescription>
							Renseignez les informations du contrat ou abonnement.
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleUtilityContractSubmit}>
						<div className="flex flex-col gap-4">
							{/* Error message */}
							{utilityContractFormError && (
								<div
									className="p-3 rounded-lg"
									style={{
										backgroundColor: 'hsl(var(--destructive) / 0.1)',
										border: '1px solid hsl(var(--destructive) / 0.2)',
									}}
								>
									<Text size="sm" style={{ color: 'hsl(var(--destructive))' }}>
										{utilityContractFormError}
									</Text>
								</div>
							)}

							{/* Type selection */}
							<div className="flex flex-col gap-2">
								<Label htmlFor="utility-contract-type">Type de contrat *</Label>
								<Select
									value={utilityContractFormData.type}
									onValueChange={(value) => handleUtilityContractInputChange('type', value)}
								>
									<SelectTrigger id="utility-contract-type">
										<SelectValue placeholder="Sélectionner le type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="ELECTRICITY">
											<span className="flex items-center gap-3">
												<Zap style={{ height: '1rem', width: '1rem' }} />
												Électricité
											</span>
										</SelectItem>
										<SelectItem value="GAS">
											<span className="flex items-center gap-3">
												<Flame style={{ height: '1rem', width: '1rem' }} />
												Gaz
											</span>
										</SelectItem>
										<SelectItem value="WATER">
											<span className="flex items-center gap-3">
												<Droplets style={{ height: '1rem', width: '1rem' }} />
												Eau
											</span>
										</SelectItem>
										<SelectItem value="INTERNET">
											<span className="flex items-center gap-3">
												<Wifi style={{ height: '1rem', width: '1rem' }} />
												Internet
											</span>
										</SelectItem>
										<SelectItem value="OTHER">
											<span className="flex items-center gap-3">
												<Zap style={{ height: '1rem', width: '1rem' }} />
												Autre
											</span>
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Provider and contract number */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="flex flex-col gap-2">
									<Label htmlFor="utility-contract-provider">Fournisseur *</Label>
									<Input
										id="utility-contract-provider"
										placeholder="EDF, Engie, Free..."
										value={utilityContractFormData.provider}
										onChange={(e) => handleUtilityContractInputChange('provider', e.target.value)}
									/>
								</div>
								<div className="flex flex-col gap-2">
									<Label htmlFor="utility-contract-number">N° de contrat</Label>
									<Input
										id="utility-contract-number"
										placeholder="ABC-123456"
										value={utilityContractFormData.contractNumber}
										onChange={(e) =>
											handleUtilityContractInputChange('contractNumber', e.target.value)
										}
									/>
								</div>
							</div>

							{/* Monthly amount */}
							<div className="flex flex-col gap-2">
								<Label htmlFor="utility-contract-amount">Montant mensuel (€) *</Label>
								<Input
									id="utility-contract-amount"
									type="number"
									min="0"
									step="0.01"
									placeholder="80"
									value={utilityContractFormData.monthlyAmount}
									onChange={(e) =>
										handleUtilityContractInputChange('monthlyAmount', e.target.value)
									}
								/>
								{utilityContractFormData.monthlyAmount && (
									<Text size="xs" color="muted">
										Soit{' '}
										{formatCurrency(Number.parseFloat(utilityContractFormData.monthlyAmount) * 12)}
										/an
									</Text>
								)}
							</div>

							{/* Link */}
							<div className="flex flex-col gap-2">
								<Label htmlFor="utility-contract-link">Lien vers le contrat</Label>
								<Input
									id="utility-contract-link"
									placeholder="https://..."
									value={utilityContractFormData.link}
									onChange={(e) => handleUtilityContractInputChange('link', e.target.value)}
								/>
							</div>

							{/* Notes */}
							<div className="flex flex-col gap-2">
								<Label htmlFor="utility-contract-notes">Notes</Label>
								<Input
									id="utility-contract-notes"
									placeholder="Notes additionnelles..."
									value={utilityContractFormData.notes}
									onChange={(e) => handleUtilityContractInputChange('notes', e.target.value)}
								/>
							</div>

							<DialogFooter style={{ paddingTop: '1rem' }}>
								<Button
									type="button"
									variant="outline"
									onClick={() => setIsUtilityContractDialogOpen(false)}
									disabled={isSubmittingUtilityContract}
								>
									Annuler
								</Button>
								<Button type="submit" disabled={isSubmittingUtilityContract}>
									{isSubmittingUtilityContract ? (
										<span className="flex items-center gap-3">
											<Loader2
												style={{
													height: '1rem',
													width: '1rem',
													animation: 'spin 1s linear infinite',
												}}
											/>
											{editingUtilityContractId ? 'Modification...' : 'Création...'}
										</span>
									) : editingUtilityContractId ? (
										'Modifier'
									) : (
										'Ajouter'
									)}
								</Button>
							</DialogFooter>
						</div>
					</form>
				</DialogContent>
			</Dialog>

			{/* Edit Property Dialog */}
			<Dialog
				open={isEditPropertyDialogOpen}
				onOpenChange={(open) => {
					setIsEditPropertyDialogOpen(open);
					if (!open) resetPropertyForm();
				}}
			>
				<DialogContent style={{ maxWidth: '42rem', maxHeight: '90vh', overflowY: 'auto' }}>
					<DialogHeader>
						<DialogTitle>Modifier le bien immobilier</DialogTitle>
						<DialogDescription>
							Modifiez les informations de votre bien immobilier.
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handlePropertySubmit}>
						<div className="flex flex-col gap-6">
							{/* Error message */}
							{propertyFormError && (
								<div
									className="p-3 rounded-lg"
									style={{
										backgroundColor: 'hsl(var(--destructive) / 0.1)',
										border: '1px solid hsl(var(--destructive) / 0.2)',
									}}
								>
									<Text size="sm" style={{ color: 'hsl(var(--destructive))' }}>
										{propertyFormError}
									</Text>
								</div>
							)}

							{/* Basic info */}
							<div className="flex flex-col gap-4">
								<Text size="sm" weight="medium" color="muted">
									Informations générales
								</Text>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="flex flex-col gap-2">
										<Label htmlFor="edit-name">Nom du bien *</Label>
										<Input
											id="edit-name"
											placeholder="Appartement Paris 15"
											value={propertyFormData.name}
											onChange={(e) => handlePropertyInputChange('name', e.target.value)}
										/>
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="edit-type">Type *</Label>
										<Select
											value={propertyFormData.type}
											onValueChange={(value) => handlePropertyInputChange('type', value)}
										>
											<SelectTrigger style={{ width: '100%' }}>
												<SelectValue placeholder="Sélectionner..." />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="APARTMENT">Appartement</SelectItem>
												<SelectItem value="HOUSE">Maison</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="edit-usage">Usage *</Label>
										<Select
											value={propertyFormData.usage}
											onValueChange={(value) => handlePropertyInputChange('usage', value)}
										>
											<SelectTrigger style={{ width: '100%' }}>
												<SelectValue placeholder="Sélectionner..." />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="PRIMARY">Résidence principale</SelectItem>
												<SelectItem value="SECONDARY">Résidence secondaire</SelectItem>
												<SelectItem value="RENTAL">Locatif</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="edit-surface">Surface (m²) *</Label>
										<Input
											id="edit-surface"
											type="number"
											min="0"
											step="0.01"
											placeholder="65"
											value={propertyFormData.surface}
											onChange={(e) => handlePropertyInputChange('surface', e.target.value)}
										/>
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="edit-rooms">Pièces</Label>
										<Input
											id="edit-rooms"
											type="number"
											min="0"
											placeholder="3"
											value={propertyFormData.rooms}
											onChange={(e) => handlePropertyInputChange('rooms', e.target.value)}
										/>
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="edit-bedrooms">Chambres</Label>
										<Input
											id="edit-bedrooms"
											type="number"
											min="0"
											placeholder="2"
											value={propertyFormData.bedrooms}
											onChange={(e) => handlePropertyInputChange('bedrooms', e.target.value)}
										/>
									</div>
								</div>
							</div>

							{/* Address */}
							<div className="flex flex-col gap-4">
								<Text size="sm" weight="medium" color="muted">
									Adresse
								</Text>
								<div className="flex flex-col gap-4">
									<div className="flex flex-col gap-2">
										<Label htmlFor="edit-address">Adresse *</Label>
										<Input
											id="edit-address"
											placeholder="10 rue de Paris"
											value={propertyFormData.address}
											onChange={(e) => handlePropertyInputChange('address', e.target.value)}
										/>
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="edit-address2">Complément d&apos;adresse</Label>
										<Input
											id="edit-address2"
											placeholder="Bâtiment A, 3ème étage"
											value={propertyFormData.address2}
											onChange={(e) => handlePropertyInputChange('address2', e.target.value)}
										/>
									</div>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<div className="flex flex-col gap-2">
											<Label htmlFor="edit-city">Ville *</Label>
											<Input
												id="edit-city"
												placeholder="Paris"
												value={propertyFormData.city}
												onChange={(e) => handlePropertyInputChange('city', e.target.value)}
											/>
										</div>
										<div className="flex flex-col gap-2">
											<Label htmlFor="edit-postalCode">Code postal *</Label>
											<Input
												id="edit-postalCode"
												placeholder="75015"
												value={propertyFormData.postalCode}
												onChange={(e) => handlePropertyInputChange('postalCode', e.target.value)}
											/>
										</div>
									</div>
								</div>
							</div>

							{/* Purchase info */}
							<div className="flex flex-col gap-4">
								<Text size="sm" weight="medium" color="muted">
									Achat
								</Text>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="flex flex-col gap-2">
										<Label htmlFor="edit-purchasePrice">Prix d&apos;achat (€) *</Label>
										<Input
											id="edit-purchasePrice"
											type="number"
											min="0"
											step="0.01"
											placeholder="350000"
											value={propertyFormData.purchasePrice}
											onChange={(e) => handlePropertyInputChange('purchasePrice', e.target.value)}
										/>
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="edit-purchaseDate">Date d&apos;achat *</Label>
										<Input
											id="edit-purchaseDate"
											type="date"
											value={propertyFormData.purchaseDate}
											onChange={(e) => handlePropertyInputChange('purchaseDate', e.target.value)}
										/>
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="edit-notaryFees">Frais de notaire (€) *</Label>
										<Input
											id="edit-notaryFees"
											type="number"
											min="0"
											step="0.01"
											placeholder="25000"
											value={propertyFormData.notaryFees}
											onChange={(e) => handlePropertyInputChange('notaryFees', e.target.value)}
										/>
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="edit-agencyFees">Frais d&apos;agence (€)</Label>
										<Input
											id="edit-agencyFees"
											type="number"
											min="0"
											step="0.01"
											placeholder="10000"
											value={propertyFormData.agencyFees}
											onChange={(e) => handlePropertyInputChange('agencyFees', e.target.value)}
										/>
									</div>
								</div>
							</div>

							{/* Current value */}
							<div className="flex flex-col gap-4">
								<Text size="sm" weight="medium" color="muted">
									Valeur actuelle
								</Text>
								<div className="flex flex-col gap-2">
									<Label htmlFor="edit-currentValue">Valeur estimée (€) *</Label>
									<Input
										id="edit-currentValue"
										type="number"
										min="0"
										step="0.01"
										placeholder="380000"
										value={propertyFormData.currentValue}
										onChange={(e) => handlePropertyInputChange('currentValue', e.target.value)}
									/>
								</div>
							</div>

							{/* Rental info - only shown for RENTAL usage */}
							{isEditFormRental && (
								<div className="flex flex-col gap-4">
									<Text size="sm" weight="medium" color="muted">
										Informations locatives
									</Text>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<div className="flex flex-col gap-2">
											<Label htmlFor="edit-rentAmount">Loyer mensuel (€)</Label>
											<Input
												id="edit-rentAmount"
												type="number"
												min="0"
												step="0.01"
												placeholder="1200"
												value={propertyFormData.rentAmount}
												onChange={(e) => handlePropertyInputChange('rentAmount', e.target.value)}
											/>
										</div>
										<div className="flex flex-col gap-2">
											<Label htmlFor="edit-rentCharges">Charges locatives (€)</Label>
											<Input
												id="edit-rentCharges"
												type="number"
												min="0"
												step="0.01"
												placeholder="150"
												value={propertyFormData.rentCharges}
												onChange={(e) => handlePropertyInputChange('rentCharges', e.target.value)}
											/>
										</div>
									</div>
								</div>
							)}

							{/* Members/Owners */}
							<div className="flex flex-col gap-4">
								<div className="flex justify-between items-center">
									<Text size="sm" weight="medium" color="muted">
										Propriétaires
									</Text>
									{members.length > editMemberShares.length && (
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={handleAddMember}
											iconLeft={<Plus style={{ height: '0.75rem', width: '0.75rem' }} />}
										>
											Ajouter
										</Button>
									)}
								</div>
								{loadingMembers ? (
									<Skeleton style={{ height: '2.5rem', width: '100%' }} />
								) : editMemberShares.length === 0 ? (
									<Text size="sm" color="muted">
										Aucun propriétaire sélectionné. Cliquez sur &quot;Ajouter&quot; pour ajouter des
										propriétaires.
									</Text>
								) : (
									<div className="flex flex-col gap-3">
										{editMemberShares.map((ms, index) => {
											const member = members.find((m) => m.id === ms.memberId);
											const availableMembers = members.filter(
												(m) =>
													m.id === ms.memberId ||
													!editMemberShares.some((other) => other.memberId === m.id),
											);
											return (
												<div
													key={ms.memberId}
													className="flex items-center gap-4 p-3"
													style={{
														borderRadius: '0.5rem',
														backgroundColor: 'hsl(var(--muted) / 0.3)',
													}}
												>
													<div
														className="flex items-center justify-center shrink-0"
														style={{
															borderRadius: '9999px',
															height: '2rem',
															width: '2rem',
															fontSize: '0.875rem',
															fontWeight: 500,
															color: 'white',
															backgroundColor: member?.color || '#6b7280',
														}}
													>
														{member?.name.charAt(0).toUpperCase()}
													</div>
													<Select
														value={ms.memberId}
														onValueChange={(value) => handleMemberChange(index, value)}
													>
														<SelectTrigger style={{ flex: 1 }}>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															{availableMembers.map((m) => (
																<SelectItem key={m.id} value={m.id}>
																	{m.name}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
													<div className="flex items-center gap-3">
														<Input
															type="number"
															min="0"
															max="100"
															style={{ width: '5rem' }}
															value={ms.ownershipShare}
															onChange={(e) =>
																handleShareChange(index, Number.parseInt(e.target.value, 10) || 0)
															}
														/>
														<Text size="sm" color="muted">
															%
														</Text>
													</div>
													<Button
														type="button"
														variant="ghost"
														size="icon"
														style={{ height: '2rem', width: '2rem', flexShrink: 0 }}
														onClick={() => handleRemoveMember(ms.memberId)}
													>
														<X style={{ height: '1rem', width: '1rem' }} />
													</Button>
												</div>
											);
										})}
										{editMemberShares.length > 0 && (
											<Text size="xs" color="muted" style={{ textAlign: 'right' }}>
												Total: {editMemberShares.reduce((sum, ms) => sum + ms.ownershipShare, 0)}%
												{editMemberShares.reduce((sum, ms) => sum + ms.ownershipShare, 0) !==
													100 && (
													<Text
														as="span"
														style={{ marginLeft: '0.25rem', color: 'hsl(var(--destructive))' }}
													>
														(doit être 100%)
													</Text>
												)}
											</Text>
										)}
									</div>
								)}
							</div>

							{/* Notes */}
							<div className="flex flex-col gap-2">
								<Label htmlFor="edit-notes">Notes</Label>
								<Input
									id="edit-notes"
									placeholder="Notes additionnelles..."
									value={propertyFormData.notes}
									onChange={(e) => handlePropertyInputChange('notes', e.target.value)}
								/>
							</div>

							<DialogFooter style={{ paddingTop: '1rem' }}>
								<Button
									type="button"
									variant="outline"
									onClick={() => setIsEditPropertyDialogOpen(false)}
									disabled={isSubmittingProperty}
								>
									Annuler
								</Button>
								<Button type="submit" disabled={isSubmittingProperty}>
									{isSubmittingProperty ? (
										<span className="flex items-center gap-3">
											<Loader2
												style={{
													height: '1rem',
													width: '1rem',
													animation: 'spin 1s linear infinite',
												}}
											/>
											Modification...
										</span>
									) : (
										'Enregistrer'
									)}
								</Button>
							</DialogFooter>
						</div>
					</form>
				</DialogContent>
			</Dialog>

			{/* Delete Property Confirmation Dialog */}
			<AlertDialog open={showDeletePropertyDialog} onOpenChange={setShowDeletePropertyDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Supprimer ce bien ?</AlertDialogTitle>
						<AlertDialogDescription>
							Cette action est irréversible. Le bien « {property.name} » sera définitivement
							supprimé, ainsi que tous les prêts, assurances et contrats associés.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeletingProperty}>Annuler</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteProperty}
							disabled={isDeletingProperty}
							style={{
								backgroundColor: 'hsl(var(--destructive))',
								color: 'hsl(var(--destructive-foreground))',
							}}
						>
							{isDeletingProperty ? (
								<span className="flex items-center gap-3">
									<Loader2
										style={{ height: '1rem', width: '1rem', animation: 'spin 1s linear infinite' }}
									/>
									Suppression...
								</span>
							) : (
								'Supprimer'
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
