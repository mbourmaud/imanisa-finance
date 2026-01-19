'use client'

import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Flex,
	FormErrorBanner,
	Input,
	Label,
	Loader2,
	MemberShareRow,
	Plus,
	PropertyFormGrid,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components'
import type { MemberShare, PropertyFormData } from '@/features/properties'

interface Member {
	id: string
	name: string
	color: string | null
}

interface CreatePropertyDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	formData: PropertyFormData
	memberShares: MemberShare[]
	members: Member[]
	formError: string | null
	isSubmitting: boolean
	onInputChange: (field: keyof PropertyFormData, value: string) => void
	onAddMember: () => void
	onRemoveMember: (memberId: string) => void
	onMemberChange: (index: number, memberId: string) => void
	onShareChange: (index: number, share: number) => void
	onSubmit: (e: React.FormEvent) => Promise<void>
	onReset: () => void
}

export function CreatePropertyDialog({
	open,
	onOpenChange,
	formData,
	memberShares,
	members,
	formError,
	isSubmitting,
	onInputChange,
	onAddMember,
	onRemoveMember,
	onMemberChange,
	onShareChange,
	onSubmit,
	onReset,
}: CreatePropertyDialogProps) {
	const isRental = formData.usage === 'RENTAL'

	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => {
				onOpenChange(isOpen)
				if (!isOpen) onReset()
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
				<form onSubmit={onSubmit}>
					<Flex direction="col" gap="lg">
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
										onChange={(e) => onInputChange('name', e.target.value)}
									/>
								</Flex>
								<Flex direction="col" gap="sm">
									<Label htmlFor="type">Type *</Label>
									<Select
										value={formData.type}
										onValueChange={(value) => onInputChange('type', value)}
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
										onValueChange={(value) => onInputChange('usage', value)}
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
										onChange={(e) => onInputChange('surface', e.target.value)}
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
										onChange={(e) => onInputChange('rooms', e.target.value)}
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
										onChange={(e) => onInputChange('bedrooms', e.target.value)}
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
										onChange={(e) => onInputChange('address', e.target.value)}
									/>
								</Flex>
								<Flex direction="col" gap="sm">
									<Label htmlFor="address2">Complément d&apos;adresse</Label>
									<Input
										id="address2"
										placeholder="Bâtiment A, 3ème étage"
										value={formData.address2}
										onChange={(e) => onInputChange('address2', e.target.value)}
									/>
								</Flex>
								<PropertyFormGrid>
									<Flex direction="col" gap="sm">
										<Label htmlFor="city">Ville *</Label>
										<Input
											id="city"
											placeholder="Paris"
											value={formData.city}
											onChange={(e) => onInputChange('city', e.target.value)}
										/>
									</Flex>
									<Flex direction="col" gap="sm">
										<Label htmlFor="postalCode">Code postal *</Label>
										<Input
											id="postalCode"
											placeholder="75015"
											value={formData.postalCode}
											onChange={(e) => onInputChange('postalCode', e.target.value)}
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
										onChange={(e) => onInputChange('purchasePrice', e.target.value)}
									/>
								</Flex>
								<Flex direction="col" gap="sm">
									<Label htmlFor="purchaseDate">Date d&apos;achat *</Label>
									<Input
										id="purchaseDate"
										type="date"
										value={formData.purchaseDate}
										onChange={(e) => onInputChange('purchaseDate', e.target.value)}
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
										onChange={(e) => onInputChange('notaryFees', e.target.value)}
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
										onChange={(e) => onInputChange('agencyFees', e.target.value)}
									/>
								</Flex>
							</PropertyFormGrid>
						</Flex>

						{/* Current value */}
						<Flex direction="col" gap="md">
							<span className="text-sm font-medium text-muted-foreground">Valeur actuelle</span>
							<Flex direction="col" gap="sm">
								<Label htmlFor="currentValue">Valeur estimée (€) *</Label>
								<Input
									id="currentValue"
									type="number"
									min="0"
									step="0.01"
									placeholder="380000"
									value={formData.currentValue}
									onChange={(e) => onInputChange('currentValue', e.target.value)}
								/>
							</Flex>
						</Flex>

						{/* Rental info */}
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
											onChange={(e) => onInputChange('rentAmount', e.target.value)}
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
											onChange={(e) => onInputChange('rentCharges', e.target.value)}
										/>
									</Flex>
								</PropertyFormGrid>
							</Flex>
						)}

						{/* Members/Owners */}
						<Flex direction="col" gap="md">
							<Flex direction="row" justify="between">
								<span className="text-sm font-medium text-muted-foreground">Propriétaires</span>
								{members.length > memberShares.length && (
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={onAddMember}
										iconLeft={<Plus className="h-3 w-3" />}
									>
										Ajouter
									</Button>
								)}
							</Flex>
							{memberShares.length === 0 ? (
								<span className="text-sm text-muted-foreground">
									Aucun propriétaire sélectionné. Cliquez sur &quot;Ajouter&quot; pour ajouter des
									propriétaires.
								</span>
							) : (
								<Flex direction="col" gap="md">
									{memberShares.map((ms, index) => {
										const availableMembers = members.filter(
											(m) =>
												m.id === ms.memberId ||
												!memberShares.some((other) => other.memberId === m.id)
										)
										return (
											<MemberShareRow
												key={ms.memberId}
												memberId={ms.memberId}
												ownershipShare={ms.ownershipShare}
												members={members}
												availableMembers={availableMembers}
												onMemberChange={(id) => onMemberChange(index, id)}
												onShareChange={(share) => onShareChange(index, share)}
												onRemove={() => onRemoveMember(ms.memberId)}
											/>
										)
									})}
									{memberShares.length > 0 && (
										<span className="text-right text-xs text-muted-foreground">
											Total: {memberShares.reduce((sum, ms) => sum + ms.ownershipShare, 0)}%
											{memberShares.reduce((sum, ms) => sum + ms.ownershipShare, 0) !== 100 && (
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
								onChange={(e) => onInputChange('notes', e.target.value)}
							/>
						</Flex>

						<DialogFooter className="pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
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
	)
}
