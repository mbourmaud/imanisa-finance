'use client'

import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Input,
	Label,
	Loader2,
	Plus,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Skeleton,
} from '@/components'
import { FormErrorBanner } from './FormErrorBanner'
import { MemberShareRow } from './MemberShareRow'

type PropertyType = 'HOUSE' | 'APARTMENT'
type PropertyUsage = 'PRIMARY' | 'SECONDARY' | 'RENTAL'

interface Member {
	id: string
	name: string
	color: string | null
}

interface MemberShare {
	memberId: string
	ownershipShare: number
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

interface PropertyEditDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	formData: PropertyFormData
	memberShares: MemberShare[]
	members: Member[]
	loadingMembers: boolean
	onInputChange: (field: keyof PropertyFormData, value: string) => void
	onAddMember: () => void
	onRemoveMember: (memberId: string) => void
	onMemberChange: (index: number, memberId: string) => void
	onShareChange: (index: number, share: number) => void
	onSubmit: (e: React.FormEvent) => void
	error: string | null
	isSubmitting: boolean
}

/**
 * Dialog for editing property information
 */
export function PropertyEditDialog({
	open,
	onOpenChange,
	formData,
	memberShares,
	members,
	loadingMembers,
	onInputChange,
	onAddMember,
	onRemoveMember,
	onMemberChange,
	onShareChange,
	onSubmit,
	error,
	isSubmitting,
}: PropertyEditDialogProps) {
	const isRental = formData.usage === 'RENTAL'
	const totalShare = memberShares.reduce((sum, ms) => sum + ms.ownershipShare, 0)

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Modifier le bien immobilier</DialogTitle>
					<DialogDescription>
						Modifiez les informations de votre bien immobilier.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={onSubmit}>
					<div className="flex flex-col gap-6">
						{error && <FormErrorBanner message={error} />}

						{/* Basic info */}
						<div className="flex flex-col gap-4">
							<p className="text-sm font-medium text-muted-foreground">Informations générales</p>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="flex flex-col gap-2">
									<Label htmlFor="edit-name">Nom du bien *</Label>
									<Input
										id="edit-name"
										placeholder="Appartement Paris 15"
										value={formData.name}
										onChange={(e) => onInputChange('name', e.target.value)}
									/>
								</div>
								<div className="flex flex-col gap-2">
									<Label htmlFor="edit-type">Type *</Label>
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
								</div>
								<div className="flex flex-col gap-2">
									<Label htmlFor="edit-usage">Usage *</Label>
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
								</div>
								<div className="flex flex-col gap-2">
									<Label htmlFor="edit-surface">Surface (m²) *</Label>
									<Input
										id="edit-surface"
										type="number"
										min="0"
										step="0.01"
										placeholder="65"
										value={formData.surface}
										onChange={(e) => onInputChange('surface', e.target.value)}
									/>
								</div>
								<div className="flex flex-col gap-2">
									<Label htmlFor="edit-rooms">Pièces</Label>
									<Input
										id="edit-rooms"
										type="number"
										min="0"
										placeholder="3"
										value={formData.rooms}
										onChange={(e) => onInputChange('rooms', e.target.value)}
									/>
								</div>
								<div className="flex flex-col gap-2">
									<Label htmlFor="edit-bedrooms">Chambres</Label>
									<Input
										id="edit-bedrooms"
										type="number"
										min="0"
										placeholder="2"
										value={formData.bedrooms}
										onChange={(e) => onInputChange('bedrooms', e.target.value)}
									/>
								</div>
							</div>
						</div>

						{/* Address */}
						<div className="flex flex-col gap-4">
							<p className="text-sm font-medium text-muted-foreground">Adresse</p>
							<div className="flex flex-col gap-4">
								<div className="flex flex-col gap-2">
									<Label htmlFor="edit-address">Adresse *</Label>
									<Input
										id="edit-address"
										placeholder="10 rue de Paris"
										value={formData.address}
										onChange={(e) => onInputChange('address', e.target.value)}
									/>
								</div>
								<div className="flex flex-col gap-2">
									<Label htmlFor="edit-address2">Complément d&apos;adresse</Label>
									<Input
										id="edit-address2"
										placeholder="Bâtiment A, 3ème étage"
										value={formData.address2}
										onChange={(e) => onInputChange('address2', e.target.value)}
									/>
								</div>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="flex flex-col gap-2">
										<Label htmlFor="edit-city">Ville *</Label>
										<Input
											id="edit-city"
											placeholder="Paris"
											value={formData.city}
											onChange={(e) => onInputChange('city', e.target.value)}
										/>
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="edit-postalCode">Code postal *</Label>
										<Input
											id="edit-postalCode"
											placeholder="75015"
											value={formData.postalCode}
											onChange={(e) => onInputChange('postalCode', e.target.value)}
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Purchase info */}
						<div className="flex flex-col gap-4">
							<p className="text-sm font-medium text-muted-foreground">Achat</p>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="flex flex-col gap-2">
									<Label htmlFor="edit-purchasePrice">Prix d&apos;achat (€) *</Label>
									<Input
										id="edit-purchasePrice"
										type="number"
										min="0"
										step="0.01"
										placeholder="350000"
										value={formData.purchasePrice}
										onChange={(e) => onInputChange('purchasePrice', e.target.value)}
									/>
								</div>
								<div className="flex flex-col gap-2">
									<Label htmlFor="edit-purchaseDate">Date d&apos;achat *</Label>
									<Input
										id="edit-purchaseDate"
										type="date"
										value={formData.purchaseDate}
										onChange={(e) => onInputChange('purchaseDate', e.target.value)}
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
										value={formData.notaryFees}
										onChange={(e) => onInputChange('notaryFees', e.target.value)}
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
										value={formData.agencyFees}
										onChange={(e) => onInputChange('agencyFees', e.target.value)}
									/>
								</div>
							</div>
						</div>

						{/* Current value */}
						<div className="flex flex-col gap-4">
							<p className="text-sm font-medium text-muted-foreground">Valeur actuelle</p>
							<div className="flex flex-col gap-2">
								<Label htmlFor="edit-currentValue">Valeur estimée (€) *</Label>
								<Input
									id="edit-currentValue"
									type="number"
									min="0"
									step="0.01"
									placeholder="380000"
									value={formData.currentValue}
									onChange={(e) => onInputChange('currentValue', e.target.value)}
								/>
							</div>
						</div>

						{/* Rental info */}
						{isRental && (
							<div className="flex flex-col gap-4">
								<p className="text-sm font-medium text-muted-foreground">
									Informations locatives
								</p>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="flex flex-col gap-2">
										<Label htmlFor="edit-rentAmount">Loyer mensuel (€)</Label>
										<Input
											id="edit-rentAmount"
											type="number"
											min="0"
											step="0.01"
											placeholder="1200"
											value={formData.rentAmount}
											onChange={(e) => onInputChange('rentAmount', e.target.value)}
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
											value={formData.rentCharges}
											onChange={(e) => onInputChange('rentCharges', e.target.value)}
										/>
									</div>
								</div>
							</div>
						)}

						{/* Members/Owners */}
						<div className="flex flex-col gap-4">
							<div className="flex justify-between items-center">
								<p className="text-sm font-medium text-muted-foreground">Propriétaires</p>
								{members.length > memberShares.length && (
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={onAddMember}
									>
										<Plus className="mr-1 h-3 w-3" />
										Ajouter
									</Button>
								)}
							</div>
							{loadingMembers ? (
								<Skeleton className="h-10 w-full" />
							) : memberShares.length === 0 ? (
								<p className="text-sm text-muted-foreground">
									Aucun propriétaire sélectionné. Cliquez sur &quot;Ajouter&quot; pour ajouter des
									propriétaires.
								</p>
							) : (
								<div className="flex flex-col gap-3">
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
												onMemberChange={(memberId) => onMemberChange(index, memberId)}
												onShareChange={(share) => onShareChange(index, share)}
												onRemove={() => onRemoveMember(ms.memberId)}
											/>
										)
									})}
									{memberShares.length > 0 && (
										<p className="text-xs text-muted-foreground text-right">
											Total: {totalShare}%
											{totalShare !== 100 && (
												<span className="ml-1 text-destructive">
													(doit être 100%)
												</span>
											)}
										</p>
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
								value={formData.notes}
								onChange={(e) => onInputChange('notes', e.target.value)}
							/>
						</div>

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
									<span className="flex items-center gap-2">
										<Loader2 className="h-4 w-4 animate-spin" />
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
	)
}
