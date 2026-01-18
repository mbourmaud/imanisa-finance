'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
	Building2,
	Button,
	ContentSkeleton,
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
	EmptyState,
	Flex,
	GlassCard,
	Home,
	IconBox,
	Input,
	Label,
	Loader2,
	MapPin,
	MoreHorizontal,
	PageHeader,
	Plus,
	Progress,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Skeleton,
	StatCard,
	StatCardGrid,
	TrendingUp,
	X,
} from '@/components';
import { useMembersQuery } from '@/features/members/hooks/use-members-query';
import {
	type MemberShare,
	type PropertyType,
	type PropertyUsage,
	type PropertyWithDetails,
	useCreatePropertyMutation,
	usePropertiesQuery,
} from '@/features/properties';

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
};

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: 0,
	}).format(amount);
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

function PropertyCardSkeleton() {
	return (
		<GlassCard padding="lg">
			<Flex direction="col" gap="md">
				<Flex direction="row" justify="between">
					<Flex direction="row" gap="md">
						<Skeleton style={{ height: '3rem', width: '3rem', borderRadius: '0.75rem' }} />
						<Flex direction="col" gap="sm">
							<Skeleton style={{ height: '1.25rem', width: '10rem' }} />
							<Skeleton style={{ height: '0.75rem', width: '8rem' }} />
						</Flex>
					</Flex>
				</Flex>
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
						gap: '1rem',
					}}
				>
					<Skeleton style={{ height: '5rem', borderRadius: '0.75rem' }} />
					<Skeleton style={{ height: '5rem', borderRadius: '0.75rem' }} />
				</div>
				<Skeleton style={{ height: '1.5rem', width: '100%' }} />
			</Flex>
		</GlassCard>
	);
}

function StatsCardSkeleton() {
	return (
		<GlassCard padding="md">
			<Flex direction="row" justify="between">
				<Flex direction="col" gap="sm">
					<ContentSkeleton variant="text" size="md" />
					<ContentSkeleton variant="title" size="lg" />
					<ContentSkeleton variant="text" size="sm" />
				</Flex>
				<ContentSkeleton variant="icon" size="md" />
			</Flex>
		</GlassCard>
	);
}

function PropertiesEmptyState({ onAddClick }: { onAddClick: () => void }) {
	return (
		<EmptyState
			icon={Building2}
			title="Aucun bien immobilier"
			description="Ajoutez votre premier bien pour commencer à suivre votre patrimoine immobilier."
			action={
				<Button onClick={onAddClick} iconLeft={<Plus style={{ height: '1rem', width: '1rem' }} />}>
					Ajouter un bien
				</Button>
			}
		/>
	);
}

export default function RealEstatePage() {
	// TanStack Query hooks
	const { data, isLoading, isError, error } = usePropertiesQuery();
	const { data: members = [] } = useMembersQuery();
	const createPropertyMutation = useCreatePropertyMutation();

	// Dialog state
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [formData, setFormData] = useState<PropertyFormData>(initialFormData);
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
		setFormData(initialFormData);
		setMemberShares([]);
		setFormError(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError(null);

		try {
			// Validate required fields
			if (!formData.name.trim()) {
				throw new Error('Le nom est requis');
			}
			if (!formData.type) {
				throw new Error('Le type est requis');
			}
			if (!formData.usage) {
				throw new Error("L'usage est requis");
			}
			if (!formData.address.trim()) {
				throw new Error("L'adresse est requise");
			}
			if (!formData.city.trim()) {
				throw new Error('La ville est requise');
			}
			if (!formData.postalCode.trim()) {
				throw new Error('Le code postal est requis');
			}
			if (!formData.surface) {
				throw new Error('La surface est requise');
			}
			if (!formData.purchasePrice) {
				throw new Error("Le prix d'achat est requis");
			}
			if (!formData.purchaseDate) {
				throw new Error("La date d'achat est requise");
			}
			if (!formData.notaryFees) {
				throw new Error('Les frais de notaire sont requis');
			}
			if (!formData.currentValue) {
				throw new Error('La valeur actuelle est requise');
			}

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

	const isRental = formData.usage === 'RENTAL';
	const isSubmitting = createPropertyMutation.isPending;

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
							setIsDialogOpen(open);
							if (!open) resetForm();
						}}
					>
						<DialogTrigger asChild>
							<Button iconLeft={<Plus style={{ height: '1rem', width: '1rem' }} />}>
								Ajouter un bien
							</Button>
						</DialogTrigger>
						<DialogContent style={{ maxWidth: '42rem', maxHeight: '90vh', overflowY: 'auto' }}>
							<DialogHeader>
								<DialogTitle>Ajouter un bien immobilier</DialogTitle>
								<DialogDescription>
									Renseignez les informations de votre bien immobilier.
								</DialogDescription>
							</DialogHeader>
							<form onSubmit={handleSubmit}>
								<Flex direction="col" gap="lg">
									{/* Error message */}
									{formError && (
										<div
											style={{
												borderRadius: '0.5rem',
												padding: '0.75rem',
												backgroundColor: 'hsl(var(--destructive) / 0.1)',
												border: '1px solid hsl(var(--destructive) / 0.2)',
											}}
										>
											<span className="text-sm" style={{ color: 'hsl(var(--destructive))' }}>
												{formError}
											</span>
										</div>
									)}

									{/* Basic info */}
									<Flex direction="col" gap="md">
										<span className="text-sm font-medium text-muted-foreground">
											Informations générales
										</span>
										<div
											style={{
												display: 'grid',
												gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
												gap: '1rem',
											}}
										>
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
													<SelectTrigger style={{ width: '100%' }}>
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
													<SelectTrigger style={{ width: '100%' }}>
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
										</div>
									</Flex>

									{/* Address */}
									<Flex direction="col" gap="md">
										<span className="text-sm font-medium text-muted-foreground">
											Adresse
										</span>
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
											<div
												style={{
													display: 'grid',
													gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
													gap: '1rem',
												}}
											>
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
											</div>
										</Flex>
									</Flex>

									{/* Purchase info */}
									<Flex direction="col" gap="md">
										<span className="text-sm font-medium text-muted-foreground">
											Achat
										</span>
										<div
											style={{
												display: 'grid',
												gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
												gap: '1rem',
											}}
										>
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
										</div>
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
											<div
												style={{
													display: 'grid',
													gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
													gap: '1rem',
												}}
											>
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
											</div>
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
													iconLeft={<Plus style={{ height: '0.75rem', width: '0.75rem' }} />}
												>
													Ajouter
												</Button>
											)}
										</Flex>
										{memberShares.length === 0 ? (
											<span className="text-sm text-muted-foreground">
												Aucun propriétaire sélectionné. Cliquez sur &quot;Ajouter&quot; pour ajouter
												des propriétaires.
											</span>
										) : (
											<Flex direction="col" gap="md">
												{memberShares.map((ms, index) => {
													const member = members.find((m) => m.id === ms.memberId);
													const availableMembers = members.filter(
														(m) =>
															m.id === ms.memberId ||
															!memberShares.some((other) => other.memberId === m.id),
													);
													return (
														<Flex
															key={ms.memberId}
															direction="row"
															gap="md"
															style={{
																padding: '0.75rem',
																borderRadius: '0.5rem',
																backgroundColor: 'hsl(var(--muted) / 0.3)',
															}}
														>
															<div
																style={{
																	display: 'flex',
																	alignItems: 'center',
																	justifyContent: 'center',
																	height: '2rem',
																	width: '2rem',
																	borderRadius: '9999px',
																	flexShrink: 0,
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
															<Flex direction="row" gap="sm">
																<Input
																	type="number"
																	min="0"
																	max="100"
																	style={{ width: '5rem' }}
																	value={ms.ownershipShare}
																	onChange={(e) =>
																		handleShareChange(
																			index,
																			Number.parseInt(e.target.value, 10) || 0,
																		)
																	}
																/>
																<span className="text-sm text-muted-foreground">
																	%
																</span>
															</Flex>
															<Button
																type="button"
																variant="ghost"
																size="icon"
																style={{ height: '2rem', width: '2rem', flexShrink: 0 }}
																onClick={() => handleRemoveMember(ms.memberId)}
															>
																<X style={{ height: '1rem', width: '1rem' }} />
															</Button>
														</Flex>
													);
												})}
												{memberShares.length > 0 && (
													<span className="text-xs text-muted-foreground text-right">
														Total: {memberShares.reduce((sum, ms) => sum + ms.ownershipShare, 0)}%
														{memberShares.reduce((sum, ms) => sum + ms.ownershipShare, 0) !==
															100 && (
															<span style={{ color: 'hsl(var(--destructive))', marginLeft: '0.25rem' }}>
																(doit être 100%)
															</span>
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

									<DialogFooter style={{ paddingTop: '1rem' }}>
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
				<GlassCard
					padding="md"
					style={{
						borderColor: 'hsl(var(--destructive) / 0.5)',
						backgroundColor: 'hsl(var(--destructive) / 0.05)',
					}}
				>
					<span className="text-sm" style={{ color: 'hsl(var(--destructive))' }}>
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
				<GlassCard padding="lg">
					<Flex direction="row" justify="between" style={{ marginBottom: '1rem' }}>
						<Flex direction="col" gap="xs">
							<span className="font-medium">Capital restant dû</span>
							<span className="text-sm text-muted-foreground">
								{formatCurrency(summary.totalLoansRemaining)} sur{' '}
								{formatCurrency(summary.totalValue)}
							</span>
						</Flex>
						<span className="text-lg font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
							{((summary.totalLoansRemaining / summary.totalValue) * 100).toFixed(1)}%
						</span>
					</Flex>
					<Progress
						value={(summary.totalLoansRemaining / summary.totalValue) * 100}
						style={{ height: '0.75rem' }}
					/>
					<span className="text-xs text-muted-foreground" style={{ display: 'block', marginTop: '0.5rem' }}>
						Équité: {formatCurrency(summary.totalEquity)} (
						{((summary.totalEquity / summary.totalValue) * 100).toFixed(1)}%)
					</span>
				</GlassCard>
			)}

			{/* Properties Grid */}
			{isLoading ? (
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
						gap: '1.5rem',
					}}
				>
					<PropertyCardSkeleton />
					<PropertyCardSkeleton />
				</div>
			) : properties.length === 0 ? (
				<PropertiesEmptyState onAddClick={() => setIsDialogOpen(true)} />
			) : (
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
						gap: '1.5rem',
					}}
				>
					{properties.map((property: PropertyWithDetails) => {
						const totalLoansRemaining = property.loans.reduce(
							(sum, loan) => sum + loan.remainingAmount,
							0,
						);
						const appreciation =
							((property.currentValue - property.purchasePrice) / property.purchasePrice) * 100;
						const equity = property.currentValue - totalLoansRemaining;
						const loanProgress =
							property.purchasePrice > 0 ? (totalLoansRemaining / property.purchasePrice) * 100 : 0;
						const isRentalProperty = property.usage === 'RENTAL';

						return (
							<GlassCard key={property.id} padding="lg" style={{ overflow: 'hidden' }}>
								<Flex direction="col" gap="md">
									{/* Header */}
									<Flex direction="row" justify="between">
										<Link
											href={`/dashboard/real-estate/${property.id}`}
											style={{
												display: 'flex',
												alignItems: 'center',
												gap: '0.75rem',
												flex: 1,
												minWidth: 0,
											}}
										>
											<IconBox
												icon={property.type === 'HOUSE' ? Home : Building2}
												size="lg"
												variant="primary"
												rounded="xl"
											/>
											<div style={{ minWidth: 0 }}>
												<h3
													className="text-lg font-bold tracking-tight"
													style={{
														overflow: 'hidden',
														textOverflow: 'ellipsis',
														whiteSpace: 'nowrap',
													}}
												>
													{property.name}
												</h3>
												<Flex direction="row" gap="xs" style={{ marginTop: '0.125rem' }}>
													<MapPin
														style={{
															height: '0.75rem',
															width: '0.75rem',
															flexShrink: 0,
															color: 'hsl(var(--muted-foreground))',
														}}
													/>
													<span
														className="text-xs text-muted-foreground"
														style={{
															overflow: 'hidden',
															textOverflow: 'ellipsis',
															whiteSpace: 'nowrap',
														}}
													>
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
													style={{
														height: '2rem',
														width: '2rem',
														opacity: 0,
														transition: 'opacity 0.2s',
														flexShrink: 0,
													}}
												>
													<MoreHorizontal style={{ height: '1rem', width: '1rem' }} />
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
												<DropdownMenuItem style={{ color: 'hsl(var(--destructive))' }}>
													Supprimer
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</Flex>
									<Flex direction="row" gap="sm" wrap="wrap">
										<span
											className="text-xs"
											style={{
												borderRadius: '9999px',
												padding: '0.125rem 0.5rem',
												backgroundColor: 'hsl(var(--muted))',
												color: 'hsl(var(--muted-foreground))',
											}}
										>
											{getPropertyTypeLabel(property.type)}
										</span>
										<span
											className="text-xs"
											style={{
												borderRadius: '9999px',
												padding: '0.125rem 0.5rem',
												backgroundColor: 'hsl(var(--muted))',
												color: 'hsl(var(--muted-foreground))',
											}}
										>
											{getPropertyUsageLabel(property.usage)}
										</span>
										{property.propertyMembers.length > 0 && (
											<span
												className="text-xs"
												style={{
													borderRadius: '9999px',
													padding: '0.125rem 0.5rem',
													backgroundColor: 'hsl(var(--muted))',
													color: 'hsl(var(--muted-foreground))',
												}}
											>
												{property.propertyMembers.map((pm) => pm.member.name).join(', ')}
											</span>
										)}
									</Flex>
									{/* Value & Equity */}
									<div
										style={{
											display: 'grid',
											gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
											gap: '1rem',
										}}
									>
										<div
											style={{
												borderRadius: '0.75rem',
												padding: '0.75rem',
												backgroundColor: 'hsl(var(--muted) / 0.3)',
											}}
										>
											<span className="text-xs text-muted-foreground">
												Valeur actuelle
											</span>
											<span
												className="text-xl font-semibold"
												style={{ fontVariantNumeric: 'tabular-nums', marginTop: '0.25rem', display: 'block' }}
											>
												{formatCurrency(property.currentValue)}
											</span>
											<span
												className="text-xs font-medium"
												style={{
													marginTop: '0.125rem',
													display: 'block',
													color: appreciation >= 0 ? 'oklch(0.55 0.15 145)' : 'oklch(0.55 0.2 25)',
												}}
											>
												{appreciation >= 0 ? '+' : ''}
												{appreciation.toFixed(1)}% depuis l&apos;achat
											</span>
										</div>
										<div
											style={{
												borderRadius: '0.75rem',
												padding: '0.75rem',
												backgroundColor: 'hsl(var(--muted) / 0.3)',
											}}
										>
											<span className="text-xs text-muted-foreground">
												Équité
											</span>
											<span
												className="text-xl font-semibold"
												style={{
													fontVariantNumeric: 'tabular-nums',
													marginTop: '0.25rem',
													display: 'block',
													color: 'oklch(0.55 0.15 145)',
												}}
											>
												{formatCurrency(equity)}
											</span>
											<span className="text-xs text-muted-foreground" style={{ marginTop: '0.125rem', display: 'block' }}>
												{property.currentValue > 0
													? `${((equity / property.currentValue) * 100).toFixed(0)}% de la valeur`
													: '-'}
											</span>
										</div>
									</div>

									{/* Loan Progress */}
									{totalLoansRemaining > 0 && (
										<Flex direction="col" gap="sm">
											<Flex direction="row" justify="between">
												<span className="text-xs text-muted-foreground">
													Crédit restant ({property._count.loans} prêt
													{property._count.loans > 1 ? 's' : ''})
												</span>
												<span className="text-xs" style={{ fontVariantNumeric: 'tabular-nums' }}>
													{formatCurrency(totalLoansRemaining)}
												</span>
											</Flex>
											<Progress value={100 - loanProgress} style={{ height: '0.5rem' }} />
										</Flex>
									)}

									{/* Info Grid */}
									<div
										style={{
											display: 'grid',
											gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
											gap: '1rem',
											paddingTop: '0.5rem',
											borderTop: '1px solid hsl(var(--border) / 0.4)',
										}}
									>
										<Flex direction="col" align="center">
											<Flex direction="row" gap="xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
												<Home style={{ height: '0.875rem', width: '0.875rem' }} />
												<span className="text-xs">
													Surface
												</span>
											</Flex>
											<span className="font-medium" style={{ marginTop: '0.25rem' }}>
												{property.surface} m²
											</span>
										</Flex>
										<Flex direction="col" align="center">
											<Flex direction="row" gap="xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
												<Building2 style={{ height: '0.875rem', width: '0.875rem' }} />
												<span className="text-xs">
													Pièces
												</span>
											</Flex>
											<span className="font-medium" style={{ marginTop: '0.25rem' }}>
												{property.rooms || '-'}
											</span>
										</Flex>
										<Flex direction="col" align="center">
											<Flex direction="row" gap="xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
												<Building2 style={{ height: '0.875rem', width: '0.875rem' }} />
												<span className="text-xs">
													Chambres
												</span>
											</Flex>
											<span className="font-medium" style={{ marginTop: '0.25rem' }}>
												{property.bedrooms || '-'}
											</span>
										</Flex>
									</div>

									{/* Rent Info if rental */}
									{isRentalProperty && property.rentAmount && (
										<div
											style={{
												borderRadius: '0.75rem',
												padding: '0.75rem',
												backgroundColor: 'oklch(0.55 0.15 145 / 0.1)',
											}}
										>
											<Flex direction="row" justify="between">
												<Flex direction="col" gap="xs">
													<span className="text-xs" style={{ color: 'oklch(0.55 0.15 145)' }}>
														Loyer mensuel
													</span>
													<span
														className="text-lg font-semibold"
														style={{
															fontVariantNumeric: 'tabular-nums',
															color: 'oklch(0.55 0.15 145)',
														}}
													>
														{formatCurrency(property.rentAmount)}
													</span>
												</Flex>
												{property.rentCharges && (
													<Flex direction="col" gap="xs" align="end">
														<span className="text-xs text-muted-foreground">
															Net de charges
														</span>
														<span className="font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
															{formatCurrency(property.rentAmount - property.rentCharges)}
														</span>
													</Flex>
												)}
											</Flex>
										</div>
									)}
								</Flex>
							</GlassCard>
						);
					})}
				</div>
			)}
		</Flex>
	);
}
