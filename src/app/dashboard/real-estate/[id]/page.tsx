'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
	ArrowLeft,
	Building2,
	CreditCard,
	Home,
	Landmark,
	Loader2,
	MapPin,
	MoreHorizontal,
	Pencil,
	Plus,
	Shield,
	Users,
	Wallet,
	Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import type { PropertyType, PropertyUsage, Loan, PropertyInsurance, CoOwnership, UtilityContract, LoanInsurance } from '@prisma/client'

// Type for property with members and related data
interface PropertyMemberWithDetails {
	id: string
	memberId: string
	ownershipShare: number
	member: {
		id: string
		name: string
		color: string | null
	}
}

interface LoanInsuranceWithMember extends LoanInsurance {
	member: {
		id: string
		name: string
		color: string | null
	}
}

interface LoanWithDetails extends Loan {
	property: {
		id: string
		name: string
		type: PropertyType
		address: string
		city: string
	}
	member: {
		id: string
		name: string
		color: string | null
	} | null
	loanInsurances: LoanInsuranceWithMember[]
}

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

interface PropertyWithDetails {
	id: string
	name: string
	type: PropertyType
	usage: PropertyUsage
	address: string
	address2: string | null
	city: string
	postalCode: string
	surface: number
	rooms: number | null
	bedrooms: number | null
	purchasePrice: number
	purchaseDate: string
	notaryFees: number
	agencyFees: number | null
	currentValue: number
	rentAmount: number | null
	rentCharges: number | null
	notes: string | null
	createdAt: string
	updatedAt: string
	propertyMembers: PropertyMemberWithDetails[]
	loans: LoanWithDetails[]
	insurance: PropertyInsurance | null
	coOwnership: CoOwnership | null
	utilityContracts: UtilityContract[]
	_count: {
		loans: number
		utilityContracts: number
	}
}

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: 0,
	}).format(amount)
}

function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString('fr-FR', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	})
}

function getPropertyTypeLabel(type: PropertyType): string {
	switch (type) {
		case 'HOUSE':
			return 'Maison'
		case 'APARTMENT':
			return 'Appartement'
		default:
			return type
	}
}

function getPropertyUsageLabel(usage: PropertyUsage): string {
	switch (usage) {
		case 'PRIMARY':
			return 'Résidence principale'
		case 'SECONDARY':
			return 'Résidence secondaire'
		case 'RENTAL':
			return 'Locatif'
		default:
			return usage
	}
}

function DetailItemSkeleton() {
	return (
		<div className="space-y-1">
			<Skeleton className="h-3 w-16" />
			<Skeleton className="h-5 w-24" />
		</div>
	)
}

function SectionSkeleton() {
	return (
		<Card className="border-border/60">
			<CardHeader className="pb-4">
				<Skeleton className="h-5 w-32" />
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<DetailItemSkeleton />
					<DetailItemSkeleton />
					<DetailItemSkeleton />
				</div>
			</CardContent>
		</Card>
	)
}

function PlaceholderSection({ title, icon: Icon, description }: { title: string; icon: React.ElementType; description: string }) {
	return (
		<Card className="border-border/60 border-dashed">
			<CardContent className="flex items-center gap-4 py-6">
				<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 shrink-0">
					<Icon className="h-5 w-5 text-muted-foreground" />
				</div>
				<div>
					<h3 className="font-medium">{title}</h3>
					<p className="text-sm text-muted-foreground">{description}</p>
				</div>
			</CardContent>
		</Card>
	)
}

function LoanCard({ loan }: { loan: LoanWithDetails }) {
	const paidPercent = loan.initialAmount > 0
		? ((loan.initialAmount - loan.remainingAmount) / loan.initialAmount) * 100
		: 0

	return (
		<div className="rounded-xl border border-border/60 p-4 space-y-4">
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0">
					<h4 className="font-medium truncate">{loan.name}</h4>
					{loan.lender && (
						<p className="text-sm text-muted-foreground">{loan.lender}</p>
					)}
				</div>
				<div className="text-right shrink-0">
					<p className="text-lg font-semibold number-display">{formatCurrency(loan.remainingAmount)}</p>
					<p className="text-xs text-muted-foreground">restant</p>
				</div>
			</div>

			<div className="space-y-1.5">
				<div className="flex justify-between text-xs">
					<span className="text-muted-foreground">Progression du remboursement</span>
					<span className="number-display">{paidPercent.toFixed(0)}%</span>
				</div>
				<Progress value={paidPercent} className="h-2" />
			</div>

			<div className="grid grid-cols-3 gap-4 pt-2 text-sm">
				<div>
					<p className="text-xs text-muted-foreground">Mensualité</p>
					<p className="font-medium number-display">{formatCurrency(loan.monthlyPayment)}</p>
				</div>
				<div>
					<p className="text-xs text-muted-foreground">Taux</p>
					<p className="font-medium number-display">{loan.rate}%</p>
				</div>
				<div>
					<p className="text-xs text-muted-foreground">Montant initial</p>
					<p className="font-medium number-display">{formatCurrency(loan.initialAmount)}</p>
				</div>
			</div>

			{loan.loanNumber && (
				<p className="text-xs text-muted-foreground pt-2 border-t border-border/40">
					N° contrat: {loan.loanNumber}
				</p>
			)}
		</div>
	)
}

function LoansEmptyState({ onAddClick }: { onAddClick: () => void }) {
	return (
		<div className="flex flex-col items-center justify-center py-8 text-center">
			<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 mb-3">
				<CreditCard className="h-6 w-6 text-muted-foreground" />
			</div>
			<h4 className="font-medium mb-1">Aucun prêt</h4>
			<p className="text-sm text-muted-foreground mb-4">
				Ajoutez les crédits immobiliers associés à ce bien.
			</p>
			<Button variant="outline" size="sm" className="gap-2" onClick={onAddClick}>
				<Plus className="h-4 w-4" />
				Ajouter un prêt
			</Button>
		</div>
	)
}

function DetailItem({ label, value }: { label: string; value: string | number | null | undefined }) {
	if (value === null || value === undefined) return null
	return (
		<div className="space-y-0.5">
			<p className="text-xs text-muted-foreground">{label}</p>
			<p className="font-medium">{typeof value === 'number' ? value.toLocaleString('fr-FR') : value}</p>
		</div>
	)
}

function CurrencyItem({ label, value }: { label: string; value: number | null | undefined }) {
	if (value === null || value === undefined) return null
	return (
		<div className="space-y-0.5">
			<p className="text-xs text-muted-foreground">{label}</p>
			<p className="font-medium number-display">{formatCurrency(value)}</p>
		</div>
	)
}

export default function PropertyDetailPage() {
	const params = useParams()
	const router = useRouter()
	const propertyId = params.id as string

	const [property, setProperty] = useState<PropertyWithDetails | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// Loan dialog state
	const [isLoanDialogOpen, setIsLoanDialogOpen] = useState(false)
	const [loanFormData, setLoanFormData] = useState<LoanFormData>(initialLoanFormData)
	const [isSubmittingLoan, setIsSubmittingLoan] = useState(false)
	const [loanFormError, setLoanFormError] = useState<string | null>(null)

	const fetchProperty = useCallback(async () => {
		try {
			setLoading(true)
			setError(null)
			const response = await fetch(`/api/properties/${propertyId}`)
			if (!response.ok) {
				if (response.status === 404) {
					throw new Error('Bien non trouvé')
				}
				throw new Error('Erreur lors du chargement du bien')
			}
			const data = await response.json()
			setProperty(data)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Une erreur est survenue')
		} finally {
			setLoading(false)
		}
	}, [propertyId])

	useEffect(() => {
		fetchProperty()
	}, [fetchProperty])

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
		setIsSubmittingLoan(true)

		try {
			// Validate required fields
			if (!loanFormData.name.trim()) {
				throw new Error('Le nom du prêt est requis')
			}
			if (!loanFormData.initialAmount) {
				throw new Error('Le montant initial est requis')
			}
			if (!loanFormData.remainingAmount) {
				throw new Error('Le capital restant est requis')
			}
			if (!loanFormData.rate) {
				throw new Error('Le taux est requis')
			}
			if (!loanFormData.monthlyPayment) {
				throw new Error('La mensualité est requise')
			}
			if (!loanFormData.startDate) {
				throw new Error('La date de début est requise')
			}

			const initialAmount = Number.parseFloat(loanFormData.initialAmount)
			const remainingAmount = Number.parseFloat(loanFormData.remainingAmount)
			const rate = Number.parseFloat(loanFormData.rate)
			const monthlyPayment = Number.parseFloat(loanFormData.monthlyPayment)

			if (remainingAmount > initialAmount) {
				throw new Error('Le capital restant ne peut pas dépasser le montant initial')
			}
			if (rate < 0 || rate > 100) {
				throw new Error('Le taux doit être entre 0 et 100')
			}

			const payload = {
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
			}

			const response = await fetch(`/api/properties/${propertyId}/loans`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Erreur lors de la création du prêt')
			}

			// Success - close dialog and refresh data
			setIsLoanDialogOpen(false)
			resetLoanForm()
			await fetchProperty()
		} catch (err) {
			setLoanFormError(err instanceof Error ? err.message : 'Une erreur est survenue')
		} finally {
			setIsSubmittingLoan(false)
		}
	}

	// Loading state
	if (loading) {
		return (
			<div className="space-y-6">
				{/* Header skeleton */}
				<div className="flex items-center gap-4">
					<Skeleton className="h-8 w-8" />
					<div className="flex-1 space-y-2">
						<Skeleton className="h-7 w-64" />
						<Skeleton className="h-4 w-48" />
					</div>
				</div>

				{/* Sections skeleton */}
				<SectionSkeleton />
				<SectionSkeleton />
			</div>
		)
	}

	// Error state
	if (error || !property) {
		return (
			<div className="space-y-6">
				<Link
					href="/dashboard/real-estate"
					className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
				>
					<ArrowLeft className="h-4 w-4" />
					Retour aux biens
				</Link>
				<Card className="border-destructive/50 bg-destructive/5">
					<CardContent className="py-6">
						<p className="text-sm text-destructive">{error || 'Bien non trouvé'}</p>
						<Button variant="outline" size="sm" className="mt-4" onClick={() => router.push('/dashboard/real-estate')}>
							Retour à la liste
						</Button>
					</CardContent>
				</Card>
			</div>
		)
	}

	const totalLoansRemaining = property.loans.reduce((sum, loan) => sum + loan.remainingAmount, 0)
	const totalInvestment = property.purchasePrice + property.notaryFees + (property.agencyFees || 0)
	const appreciation = ((property.currentValue - property.purchasePrice) / property.purchasePrice) * 100
	const equity = property.currentValue - totalLoansRemaining
	const isRental = property.usage === 'RENTAL'

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div className="flex items-start gap-4">
					<Link
						href="/dashboard/real-estate"
						className="mt-1 flex items-center justify-center h-8 w-8 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
					>
						<ArrowLeft className="h-4 w-4" />
					</Link>
					<div className="min-w-0">
						<div className="flex items-center gap-2 flex-wrap">
							<h1 className="text-2xl font-semibold tracking-tight">{property.name}</h1>
							<div className="flex gap-1.5">
								<span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
									{getPropertyTypeLabel(property.type)}
								</span>
								<span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
									{getPropertyUsageLabel(property.usage)}
								</span>
							</div>
						</div>
						<div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
							<MapPin className="h-3.5 w-3.5 shrink-0" />
							<span>
								{property.address}
								{property.address2 && `, ${property.address2}`}, {property.postalCode} {property.city}
							</span>
						</div>
					</div>
				</div>
				<div className="flex items-center gap-2 sm:shrink-0">
					<Button variant="outline" className="gap-2">
						<Pencil className="h-4 w-4" />
						Modifier
					</Button>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem>Exporter les données</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem className="text-destructive">Supprimer</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Value Summary */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<div className="stat-card">
					<div className="stat-card-content">
						<div className="stat-card-text">
							<p className="text-xs sm:text-sm font-medium text-muted-foreground">Valeur actuelle</p>
							<p className="stat-card-value">{formatCurrency(property.currentValue)}</p>
							<p
								className={`mt-1 text-[10px] sm:text-xs font-medium ${
									appreciation >= 0 ? 'value-positive' : 'value-negative'
								}`}
							>
								{appreciation >= 0 ? '+' : ''}
								{appreciation.toFixed(1)}% depuis l'achat
							</p>
						</div>
						<div className="stat-card-icon">
							<Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
						</div>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-card-content">
						<div className="stat-card-text">
							<p className="text-xs sm:text-sm font-medium text-muted-foreground">Équité</p>
							<p className="stat-card-value value-positive">{formatCurrency(equity)}</p>
							<p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">
								{property.currentValue > 0
									? `${((equity / property.currentValue) * 100).toFixed(0)}% de la valeur`
									: '-'}
							</p>
						</div>
						<div className="stat-card-icon bg-[oklch(0.55_0.15_145)]/10 text-[oklch(0.55_0.15_145)]">
							<Wallet className="h-4 w-4 sm:h-5 sm:w-5" />
						</div>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-card-content">
						<div className="stat-card-text">
							<p className="text-xs sm:text-sm font-medium text-muted-foreground">Crédits restants</p>
							<p className="stat-card-value">{formatCurrency(totalLoansRemaining)}</p>
							<p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">
								{property._count.loans} prêt{property._count.loans !== 1 ? 's' : ''}
							</p>
						</div>
						<div className="stat-card-icon">
							<CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
						</div>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-card-content">
						<div className="stat-card-text">
							<p className="text-xs sm:text-sm font-medium text-muted-foreground">Investissement total</p>
							<p className="stat-card-value">{formatCurrency(totalInvestment)}</p>
							<p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">
								Prix + frais
							</p>
						</div>
						<div className="stat-card-icon">
							<Landmark className="h-4 w-4 sm:h-5 sm:w-5" />
						</div>
					</div>
				</div>
			</div>

			{/* Informations Section */}
			<Card className="border-border/60">
				<CardHeader className="pb-4">
					<CardTitle className="text-base font-medium flex items-center gap-2">
						<Home className="h-4 w-4 text-muted-foreground" />
						Informations
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{/* Caractéristiques */}
						<div className="space-y-3">
							<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Caractéristiques</p>
							<div className="space-y-2.5">
								<DetailItem label="Surface" value={`${property.surface} m²`} />
								<DetailItem label="Pièces" value={property.rooms} />
								<DetailItem label="Chambres" value={property.bedrooms} />
							</div>
						</div>

						{/* Achat */}
						<div className="space-y-3">
							<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Achat</p>
							<div className="space-y-2.5">
								<CurrencyItem label="Prix d'achat" value={property.purchasePrice} />
								<CurrencyItem label="Frais de notaire" value={property.notaryFees} />
								<CurrencyItem label="Frais d'agence" value={property.agencyFees} />
								<DetailItem label="Date d'achat" value={formatDate(property.purchaseDate)} />
							</div>
						</div>

						{/* Valeur & Rentabilité */}
						<div className="space-y-3">
							<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
								{isRental ? 'Valeur & Revenus' : 'Valeur'}
							</p>
							<div className="space-y-2.5">
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
							<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Notes</p>
							<p className="text-sm text-muted-foreground">{property.notes}</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Propriétaires Section */}
			<Card className="border-border/60">
				<CardHeader className="pb-4">
					<CardTitle className="text-base font-medium flex items-center gap-2">
						<Users className="h-4 w-4 text-muted-foreground" />
						Propriétaires
					</CardTitle>
				</CardHeader>
				<CardContent>
					{property.propertyMembers.length === 0 ? (
						<p className="text-sm text-muted-foreground">Aucun propriétaire renseigné</p>
					) : (
						<div className="flex flex-wrap gap-3">
							{property.propertyMembers.map((pm) => (
								<div
									key={pm.id}
									className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/30"
								>
									<div
										className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium text-white shrink-0"
										style={{ backgroundColor: pm.member.color || '#6b7280' }}
									>
										{pm.member.name.charAt(0).toUpperCase()}
									</div>
									<div>
										<p className="font-medium">{pm.member.name}</p>
										<p className="text-sm text-muted-foreground">{pm.ownershipShare}%</p>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Prêts Section */}
			<Card className="border-border/60">
				<CardHeader className="pb-4">
					<div className="flex items-center justify-between">
						<CardTitle className="text-base font-medium flex items-center gap-2">
							<CreditCard className="h-4 w-4 text-muted-foreground" />
							Prêts
						</CardTitle>
						<Dialog open={isLoanDialogOpen} onOpenChange={(open) => {
							setIsLoanDialogOpen(open)
							if (!open) resetLoanForm()
						}}>
							<DialogTrigger asChild>
								<Button variant="outline" size="sm" className="gap-2">
									<Plus className="h-4 w-4" />
									Ajouter un prêt
								</Button>
							</DialogTrigger>
							<DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
								<DialogHeader>
									<DialogTitle>Ajouter un prêt</DialogTitle>
									<DialogDescription>
										Renseignez les informations du crédit immobilier.
									</DialogDescription>
								</DialogHeader>
								<form onSubmit={handleLoanSubmit} className="space-y-4">
									{/* Error message */}
									{loanFormError && (
										<div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
											<p className="text-sm text-destructive">{loanFormError}</p>
										</div>
									)}

									{/* Basic info */}
									<div className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="loan-name">Nom du prêt *</Label>
											<Input
												id="loan-name"
												placeholder="Crédit Immo Principal"
												value={loanFormData.name}
												onChange={(e) => handleLoanInputChange('name', e.target.value)}
											/>
										</div>

										<div className="grid gap-4 sm:grid-cols-2">
											<div className="space-y-2">
												<Label htmlFor="loan-lender">Organisme prêteur</Label>
												<Input
													id="loan-lender"
													placeholder="Crédit Mutuel"
													value={loanFormData.lender}
													onChange={(e) => handleLoanInputChange('lender', e.target.value)}
												/>
											</div>
											<div className="space-y-2">
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
									<div className="space-y-4">
										<h3 className="text-sm font-medium text-muted-foreground">Montants</h3>
										<div className="grid gap-4 sm:grid-cols-2">
											<div className="space-y-2">
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
											<div className="space-y-2">
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
									<div className="grid gap-4 sm:grid-cols-2">
										<div className="space-y-2">
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
										<div className="space-y-2">
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
									<div className="grid gap-4 sm:grid-cols-2">
										<div className="space-y-2">
											<Label htmlFor="loan-start">Date de début *</Label>
											<Input
												id="loan-start"
												type="date"
												value={loanFormData.startDate}
												onChange={(e) => handleLoanInputChange('startDate', e.target.value)}
											/>
										</div>
										<div className="space-y-2">
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
									<div className="space-y-2">
										<Label htmlFor="loan-notes">Notes</Label>
										<Input
											id="loan-notes"
											placeholder="Notes additionnelles..."
											value={loanFormData.notes}
											onChange={(e) => handleLoanInputChange('notes', e.target.value)}
										/>
									</div>

									<DialogFooter className="pt-4">
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
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Création...
												</>
											) : (
												'Créer le prêt'
											)}
										</Button>
									</DialogFooter>
								</form>
							</DialogContent>
						</Dialog>
					</div>
				</CardHeader>
				<CardContent>
					{property.loans.length === 0 ? (
						<LoansEmptyState onAddClick={() => setIsLoanDialogOpen(true)} />
					) : (
						<div className="space-y-4">
							{/* Summary stats */}
							<div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-muted/30">
								<div className="text-center">
									<p className="text-xs text-muted-foreground">Capital restant</p>
									<p className="text-lg font-semibold number-display">{formatCurrency(totalLoansRemaining)}</p>
								</div>
								<div className="text-center">
									<p className="text-xs text-muted-foreground">Mensualités</p>
									<p className="text-lg font-semibold number-display">
										{formatCurrency(property.loans.reduce((sum, l) => sum + l.monthlyPayment, 0))}
									</p>
								</div>
								<div className="text-center">
									<p className="text-xs text-muted-foreground">Taux moyen</p>
									<p className="text-lg font-semibold number-display">
										{property.loans.length > 0
											? (property.loans.reduce((sum, l) => sum + l.rate, 0) / property.loans.length).toFixed(2)
											: 0}%
									</p>
								</div>
							</div>

							{/* Loan cards */}
							<div className="space-y-3">
								{property.loans.map((loan) => (
									<LoanCard key={loan.id} loan={loan} />
								))}
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Assurance Section - Placeholder */}
			<PlaceholderSection
				title="Assurance"
				icon={Shield}
				description="Assurance habitation (MRH) ou propriétaire non-occupant (PNO)"
			/>

			{/* Copropriété Section - Placeholder */}
			<PlaceholderSection
				title="Copropriété"
				icon={Building2}
				description="Informations sur le syndic et les charges de copropriété"
			/>

			{/* Contrats Section - Placeholder */}
			<PlaceholderSection
				title="Contrats & Abonnements"
				icon={Zap}
				description="Électricité, gaz, eau, internet et autres contrats"
			/>
		</div>
	)
}
