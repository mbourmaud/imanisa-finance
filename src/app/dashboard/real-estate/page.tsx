'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
	Building2,
	Button,
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
	Flex,
	FormErrorBanner,
	GlassCard,
	Home,
	IconBox,
	Input,
	Label,
	Loader2,
	LoanProgressCard,
	MapPin,
	MemberShareRow,
	MoreHorizontal,
	PageHeader,
	Plus,
	PropertiesEmptyState,
	Progress,
	PropertyBadge,
	PropertyCardSkeleton,
	PropertyFormGrid,
	PropertyInfoItem,
	PropertyRentBox,
	PropertyValueBox,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	StatCard,
	StatCardGrid,
	StatsCardSkeleton,
	TrendingUp,
} from '@/components'
import { useMembersQuery } from '@/features/members/hooks/use-members-query'
import {
	type MemberShare,
	type PropertyType,
	type PropertyUsage,
	type PropertyWithDetails,
	useCreatePropertyMutation,
	usePropertiesQuery,
} from '@/features/properties'

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

const initialFormData: PropertyFormData = {
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

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: 0,
	}).format(amount)
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

export default function RealEstatePage() {
	// TanStack Query hooks
	const { data, isLoading, isError, error } = usePropertiesQuery()
	const { data: members = [] } = useMembersQuery()
	const createPropertyMutation = useCreatePropertyMutation()

	// Dialog state
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [formData, setFormData] = useState<PropertyFormData>(initialFormData)
	const [memberShares, setMemberShares] = useState<MemberShare[]>([])
	const [formError, setFormError] = useState<string | null>(null)

	// Derived data from query
	const properties = data?.properties ?? []
	const summary = data?.summary ?? null

	const handleInputChange = (field: keyof PropertyFormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }))
	}

	const handleAddMember = () => {
		const availableMembers = members.filter(
			(m) => !memberShares.some((ms) => ms.memberId === m.id),
		)
		if (availableMembers.length > 0) {
			setMemberShares((prev) => [
				...prev,
				{ memberId: availableMembers[0].id, ownershipShare: 100 },
			])
		}
	}

	const handleRemoveMember = (memberId: string) => {
		setMemberShares((prev) => prev.filter((ms) => ms.memberId !== memberId))
	}

	const handleMemberChange = (index: number, memberId: string) => {
		setMemberShares((prev) => prev.map((ms, i) => (i === index ? { ...ms, memberId } : ms)))
	}

	const handleShareChange = (index: number, share: number) => {
		setMemberShares((prev) =>
			prev.map((ms, i) => (i === index ? { ...ms, ownershipShare: share } : ms)),
		)
	}

	const resetForm = () => {
		setFormData(initialFormData)
		setMemberShares([])
		setFormError(null)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setFormError(null)

		try {
			// Validate required fields
			if (!formData.name.trim()) {
				throw new Error('Le nom est requis')
			}
			if (!formData.type) {
				throw new Error('Le type est requis')
			}
			if (!formData.usage) {
				throw new Error("L'usage est requis")
			}
			if (!formData.address.trim()) {
				throw new Error("L'adresse est requise")
			}
			if (!formData.city.trim()) {
				throw new Error('La ville est requise')
			}
			if (!formData.postalCode.trim()) {
				throw new Error('Le code postal est requis')
			}
			if (!formData.surface) {
				throw new Error('La surface est requise')
			}
			if (!formData.purchasePrice) {
				throw new Error("Le prix d'achat est requis")
			}
			if (!formData.purchaseDate) {
				throw new Error("La date d'achat est requise")
			}
			if (!formData.notaryFees) {
				throw new Error('Les frais de notaire sont requis')
			}
			if (!formData.currentValue) {
				throw new Error('La valeur actuelle est requise')
			}

			// Validate member shares total to 100%
			if (memberShares.length > 0) {
				const totalShare = memberShares.reduce((sum, ms) => sum + ms.ownershipShare, 0)
				if (totalShare !== 100) {
					throw new Error('La somme des parts de propriété doit être égale à 100%')
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
			})

			// Success - close dialog and reset form
			setIsDialogOpen(false)
			resetForm()
		} catch (err) {
			setFormError(err instanceof Error ? err.message : 'Une erreur est survenue')
		}
	}

	const isRental = formData.usage === 'RENTAL'
	const isSubmitting = createPropertyMutation.isPending

	return (
		<Flex direction="col" gap="xl">
			{/* Header */}
			<PageHeader
				title="Immobilier"
				description="Gérez votre patrimoine immobilier"
				actions={
					<Dialog
						open={isDialogOpen}
						onOpenChange={(open) => {
							setIsDialogOpen(open)
							if (!open) resetForm()
						}}
					>
						<DialogTrigger asChild>
							<Button iconLeft={<Plus className="h-4 w-4" />}>Ajouter un bien</Button>
						</DialogTrigger>
						<DialogContent className="max-h-[90vh] max-w-[42rem] overflow-y-auto">
							<DialogHeader>
								<DialogTitle>Ajouter un bien immobilier</DialogTitle>
								<DialogDescription>
									Renseignez les informations de votre bien immobilier.
								</DialogDescription>
							</DialogHeader>
							<form onSubmit={handleSubmit}>
								<Flex direction="col" gap="lg">
									{/* Error message */}
									{formError && <FormErrorBanner message={formError} />}

									{/* Basic info */}
									<Flex direction="col" gap="md">
										<span className="text-sm font-medium text-muted-foreground">
											Informations générales
										</span>
										<PropertyFormGrid>
											<Flex direction="col" gap="sm">
												<Label htmlFor="name">Nom du bien *</Label>
												<Input
													id="name"
													placeholder="Appartement Paris 15"
													value={formData.name}
													onChange={(e) => handleInputChange('name', e.target.value)}
												/>
											</Flex>
											<Flex direction="col" gap="sm">
												<Label htmlFor="type">Type *</Label>
												<Select
													value={formData.type}
													onValueChange={(value) => handleInputChange('type', value)}
												>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Sélectionner..." />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="APARTMENT">Appartement</SelectItem>
														<SelectItem value="HOUSE">Maison</SelectItem>
													</SelectContent>
												</Select>
											</Flex>
											<Flex direction="col" gap="sm">
												<Label htmlFor="usage">Usage *</Label>
												<Select
													value={formData.usage}
													onValueChange={(value) => handleInputChange('usage', value)}
												>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Sélectionner..." />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="PRIMARY">Résidence principale</SelectItem>
														<SelectItem value="SECONDARY">Résidence secondaire</SelectItem>
														<SelectItem value="RENTAL">Locatif</SelectItem>
													</SelectContent>
												</Select>
											</Flex>
											<Flex direction="col" gap="sm">
												<Label htmlFor="surface">Surface (m²) *</Label>
												<Input
													id="surface"
													type="number"
													min="0"
													step="0.01"
													placeholder="65"
													value={formData.surface}
													onChange={(e) => handleInputChange('surface', e.target.value)}
												/>
											</Flex>
											<Flex direction="col" gap="sm">
												<Label htmlFor="rooms">Pièces</Label>
												<Input
													id="rooms"
													type="number"
													min="0"
													placeholder="3"
													value={formData.rooms}
													onChange={(e) => handleInputChange('rooms', e.target.value)}
												/>
											</Flex>
											<Flex direction="col" gap="sm">
												<Label htmlFor="bedrooms">Chambres</Label>
												<Input
													id="bedrooms"
													type="number"
													min="0"
													placeholder="2"
													value={formData.bedrooms}
													onChange={(e) => handleInputChange('bedrooms', e.target.value)}
												/>
											</Flex>
										</PropertyFormGrid>
									</Flex>

									{/* Address */}
									<Flex direction="col" gap="md">
										<span className="text-sm font-medium text-muted-foreground">Adresse</span>
										<Flex direction="col" gap="md">
											<Flex direction="col" gap="sm">
												<Label htmlFor="address">Adresse *</Label>
												<Input
													id="address"
													placeholder="10 rue de Paris"
													value={formData.address}
													onChange={(e) => handleInputChange('address', e.target.value)}
												/>
											</Flex>
											<Flex direction="col" gap="sm">
												<Label htmlFor="address2">Complément d&apos;adresse</Label>
												<Input
													id="address2"
													placeholder="Bâtiment A, 3ème étage"
													value={formData.address2}
													onChange={(e) => handleInputChange('address2', e.target.value)}
												/>
											</Flex>
											<PropertyFormGrid>
												<Flex direction="col" gap="sm">
													<Label htmlFor="city">Ville *</Label>
													<Input
														id="city"
														placeholder="Paris"
														value={formData.city}
														onChange={(e) => handleInputChange('city', e.target.value)}
													/>
												</Flex>
												<Flex direction="col" gap="sm">
													<Label htmlFor="postalCode">Code postal *</Label>
													<Input
														id="postalCode"
														placeholder="75015"
														value={formData.postalCode}
														onChange={(e) => handleInputChange('postalCode', e.target.value)}
													/>
												</Flex>
											</PropertyFormGrid>
										</Flex>
									</Flex>

									{/* Purchase info */}
									<Flex direction="col" gap="md">
										<span className="text-sm font-medium text-muted-foreground">Achat</span>
										<PropertyFormGrid>
											<Flex direction="col" gap="sm">
												<Label htmlFor="purchasePrice">Prix d&apos;achat (€) *</Label>
												<Input
													id="purchasePrice"
													type="number"
													min="0"
													step="0.01"
													placeholder="350000"
													value={formData.purchasePrice}
													onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
												/>
											</Flex>
											<Flex direction="col" gap="sm">
												<Label htmlFor="purchaseDate">Date d&apos;achat *</Label>
												<Input
													id="purchaseDate"
													type="date"
													value={formData.purchaseDate}
													onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
												/>
											</Flex>
											<Flex direction="col" gap="sm">
												<Label htmlFor="notaryFees">Frais de notaire (€) *</Label>
												<Input
													id="notaryFees"
													type="number"
													min="0"
													step="0.01"
													placeholder="25000"
													value={formData.notaryFees}
													onChange={(e) => handleInputChange('notaryFees', e.target.value)}
												/>
											</Flex>
											<Flex direction="col" gap="sm">
												<Label htmlFor="agencyFees">Frais d&apos;agence (€)</Label>
												<Input
													id="agencyFees"
													type="number"
													min="0"
													step="0.01"
													placeholder="10000"
													value={formData.agencyFees}
													onChange={(e) => handleInputChange('agencyFees', e.target.value)}
												/>
											</Flex>
										</PropertyFormGrid>
									</Flex>

									{/* Current value */}
									<Flex direction="col" gap="md">
										<span className="text-sm font-medium text-muted-foreground">
											Valeur actuelle
										</span>
										<Flex direction="col" gap="sm">
											<Label htmlFor="currentValue">Valeur estimée (€) *</Label>
											<Input
												id="currentValue"
												type="number"
												min="0"
												step="0.01"
												placeholder="380000"
												value={formData.currentValue}
												onChange={(e) => handleInputChange('currentValue', e.target.value)}
											/>
										</Flex>
									</Flex>

									{/* Rental info - only shown for RENTAL usage */}
									{isRental && (
										<Flex direction="col" gap="md">
											<span className="text-sm font-medium text-muted-foreground">
												Informations locatives
											</span>
											<PropertyFormGrid>
												<Flex direction="col" gap="sm">
													<Label htmlFor="rentAmount">Loyer mensuel (€)</Label>
													<Input
														id="rentAmount"
														type="number"
														min="0"
														step="0.01"
														placeholder="1200"
														value={formData.rentAmount}
														onChange={(e) => handleInputChange('rentAmount', e.target.value)}
													/>
												</Flex>
												<Flex direction="col" gap="sm">
													<Label htmlFor="rentCharges">Charges locatives (€)</Label>
													<Input
														id="rentCharges"
														type="number"
														min="0"
														step="0.01"
														placeholder="150"
														value={formData.rentCharges}
														onChange={(e) => handleInputChange('rentCharges', e.target.value)}
													/>
												</Flex>
											</PropertyFormGrid>
										</Flex>
									)}

									{/* Members/Owners */}
									<Flex direction="col" gap="md">
										<Flex direction="row" justify="between">
											<span className="text-sm font-medium text-muted-foreground">
												Propriétaires
											</span>
											{members.length > memberShares.length && (
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={handleAddMember}
													iconLeft={<Plus className="h-3 w-3" />}
												>
													Ajouter
												</Button>
											)}
										</Flex>
										{memberShares.length === 0 ? (
											<span className="text-sm text-muted-foreground">
												Aucun propriétaire sélectionné. Cliquez sur &quot;Ajouter&quot; pour
												ajouter des propriétaires.
											</span>
										) : (
											<Flex direction="col" gap="md">
												{memberShares.map((ms, index) => {
													const availableMembers = members.filter(
														(m) =>
															m.id === ms.memberId ||
															!memberShares.some((other) => other.memberId === m.id),
													)
													return (
														<MemberShareRow
															key={ms.memberId}
															memberId={ms.memberId}
															ownershipShare={ms.ownershipShare}
															members={members}
															availableMembers={availableMembers}
															onMemberChange={(id) => handleMemberChange(index, id)}
															onShareChange={(share) => handleShareChange(index, share)}
															onRemove={() => handleRemoveMember(ms.memberId)}
														/>
													)
												})}
												{memberShares.length > 0 && (
													<span className="text-right text-xs text-muted-foreground">
														Total: {memberShares.reduce((sum, ms) => sum + ms.ownershipShare, 0)}
														%
														{memberShares.reduce((sum, ms) => sum + ms.ownershipShare, 0) !==
															100 && (
															<span className="ml-1 text-destructive">(doit être 100%)</span>
														)}
													</span>
												)}
											</Flex>
										)}
									</Flex>

									{/* Notes */}
									<Flex direction="col" gap="sm">
										<Label htmlFor="notes">Notes</Label>
										<Input
											id="notes"
											placeholder="Notes additionnelles..."
											value={formData.notes}
											onChange={(e) => handleInputChange('notes', e.target.value)}
										/>
									</Flex>

									<DialogFooter className="pt-4">
										<Button
											type="button"
											variant="outline"
											onClick={() => setIsDialogOpen(false)}
											disabled={isSubmitting}
										>
											Annuler
										</Button>
										<Button type="submit" disabled={isSubmitting}>
											{isSubmitting ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Création...
												</>
											) : (
												'Créer le bien'
											)}
										</Button>
									</DialogFooter>
								</Flex>
							</form>
						</DialogContent>
					</Dialog>
				}
			/>

			{/* Error state */}
			{isError && (
				<GlassCard padding="md" className="border-destructive/50 bg-destructive/5">
					<span className="text-sm text-destructive">
						{error instanceof Error ? error.message : 'Une erreur est survenue'}
					</span>
				</GlassCard>
			)}

			{/* Stats Overview */}
			<StatCardGrid columns={4}>
				{isLoading ? (
					<>
						<StatsCardSkeleton />
						<StatsCardSkeleton />
						<StatsCardSkeleton />
						<StatsCardSkeleton />
					</>
				) : summary ? (
					<>
						<StatCard
							label="Valeur totale"
							value={formatCurrency(summary.totalValue)}
							description={`${summary.totalProperties} bien${summary.totalProperties > 1 ? 's' : ''}`}
							icon={Building2}
							variant="default"
						/>

						<StatCard
							label="Valeur nette"
							value={formatCurrency(summary.totalEquity)}
							description="Après crédits"
							icon={TrendingUp}
							variant="teal"
						/>

						<StatCard
							label="Crédits restants"
							value={formatCurrency(summary.totalLoansRemaining)}
							description={
								summary.totalValue > 0
									? `${((summary.totalLoansRemaining / summary.totalValue) * 100).toFixed(0)}% de la valeur`
									: '-'
							}
							icon={TrendingUp}
							variant="default"
						/>

						<StatCard
							label="Équité"
							value={
								summary.totalValue > 0
									? `${((summary.totalEquity / summary.totalValue) * 100).toFixed(0)}%`
									: '-'
							}
							description="Du patrimoine"
							icon={Building2}
							variant="default"
						/>
					</>
				) : null}
			</StatCardGrid>

			{/* Credit Progress */}
			{!isLoading && summary && summary.totalValue > 0 && (
				<LoanProgressCard
					loansRemaining={summary.totalLoansRemaining}
					totalValue={summary.totalValue}
					equity={summary.totalEquity}
					formatCurrency={formatCurrency}
				/>
			)}

			{/* Properties Grid */}
			{isLoading ? (
				<div className="grid grid-cols-2 gap-6">
					<PropertyCardSkeleton />
					<PropertyCardSkeleton />
				</div>
			) : properties.length === 0 ? (
				<PropertiesEmptyState onAddClick={() => setIsDialogOpen(true)} />
			) : (
				<div className="grid grid-cols-2 gap-6">
					{properties.map((property: PropertyWithDetails) => {
						const totalLoansRemaining = property.loans.reduce(
							(sum, loan) => sum + loan.remainingAmount,
							0,
						)
						const appreciation =
							((property.currentValue - property.purchasePrice) / property.purchasePrice) * 100
						const equity = property.currentValue - totalLoansRemaining
						const loanProgress =
							property.purchasePrice > 0 ? (totalLoansRemaining / property.purchasePrice) * 100 : 0
						const isRentalProperty = property.usage === 'RENTAL'

						return (
							<GlassCard key={property.id} padding="lg" className="overflow-hidden">
								<Flex direction="col" gap="md">
									{/* Header */}
									<Flex direction="row" justify="between">
										<Link
											href={`/dashboard/real-estate/${property.id}`}
											className="flex min-w-0 flex-1 items-center gap-3"
										>
											<IconBox
												icon={property.type === 'HOUSE' ? Home : Building2}
												size="lg"
												variant="primary"
												rounded="xl"
											/>
											<div className="min-w-0">
												<h3 className="truncate text-lg font-bold tracking-tight">
													{property.name}
												</h3>
												<Flex direction="row" gap="xs" className="mt-0.5">
													<MapPin className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
													<span className="truncate text-xs text-muted-foreground">
														{property.address}, {property.city}
													</span>
												</Flex>
											</div>
										</Link>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
												>
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem asChild>
													<Link href={`/dashboard/real-estate/${property.id}`}>
														Voir les détails
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem>Modifier</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem className="text-destructive">
													Supprimer
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</Flex>
									<Flex direction="row" gap="sm" wrap="wrap">
										<PropertyBadge>{getPropertyTypeLabel(property.type)}</PropertyBadge>
										<PropertyBadge>{getPropertyUsageLabel(property.usage)}</PropertyBadge>
										{property.propertyMembers.length > 0 && (
											<PropertyBadge>
												{property.propertyMembers.map((pm) => pm.member.name).join(', ')}
											</PropertyBadge>
										)}
									</Flex>
									{/* Value & Equity */}
									<div className="grid grid-cols-2 gap-4">
										<PropertyValueBox
											label="Valeur actuelle"
											value={formatCurrency(property.currentValue)}
											subtitle={`${appreciation >= 0 ? '+' : ''}${appreciation.toFixed(1)}% depuis l'achat`}
											subtitleColor={appreciation >= 0 ? 'positive' : 'negative'}
										/>
										<PropertyValueBox
											label="Équité"
											value={formatCurrency(equity)}
											subtitle={
												property.currentValue > 0
													? `${((equity / property.currentValue) * 100).toFixed(0)}% de la valeur`
													: '-'
											}
											subtitleColor="muted"
										/>
									</div>

									{/* Loan Progress */}
									{totalLoansRemaining > 0 && (
										<Flex direction="col" gap="sm">
											<Flex direction="row" justify="between">
												<span className="text-xs text-muted-foreground">
													Crédit restant ({property._count.loans} prêt
													{property._count.loans > 1 ? 's' : ''})
												</span>
												<span className="text-xs tabular-nums">
													{formatCurrency(totalLoansRemaining)}
												</span>
											</Flex>
											<Progress value={100 - loanProgress} className="h-2" />
										</Flex>
									)}

									{/* Info Grid */}
									<div className="grid grid-cols-3 gap-4 border-t border-border/40 pt-2">
										<PropertyInfoItem icon={Home} label="Surface" value={`${property.surface} m²`} />
										<PropertyInfoItem icon={Building2} label="Pièces" value={property.rooms} />
										<PropertyInfoItem icon={Building2} label="Chambres" value={property.bedrooms} />
									</div>

									{/* Rent Info if rental */}
									{isRentalProperty && property.rentAmount && (
										<PropertyRentBox
											rentAmount={property.rentAmount}
											rentCharges={property.rentCharges}
											formatCurrency={formatCurrency}
										/>
									)}
								</Flex>
							</GlassCard>
						)
					})}
				</div>
			)}
		</Flex>
	)
}
