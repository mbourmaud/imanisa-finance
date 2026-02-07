'use client'

import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'

import {
	Button,
	Input,
	Loader2,
	Plus,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Sheet,
	SheetBody,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	Skeleton,
} from '@/components'
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from '@/components/ui/field'
import { propertyFormSchema } from '@/features/properties/forms/property-form-schema'
import { useUpdatePropertyMutation } from '@/features/properties/hooks/use-properties-query'
import type {
	Member,
	MemberShare,
	PropertyType,
	PropertyUsage,
	PropertyWithDetails,
} from '@/features/properties/types'
import { MemberShareRow } from './MemberShareRow'

interface PropertyEditSheetProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	property: PropertyWithDetails
	members: Member[]
	loadingMembers?: boolean
}

export function PropertyEditSheet({
	open,
	onOpenChange,
	property,
	members,
	loadingMembers = false,
}: PropertyEditSheetProps) {
	const updateMutation = useUpdatePropertyMutation()

	const [memberShares, setMemberShares] = useState<MemberShare[]>(
		property.propertyMembers.map((pm) => ({
			memberId: pm.memberId,
			ownershipShare: pm.ownershipShare,
		})),
	)

	const form = useForm({
		defaultValues: {
			name: property.name,
			type: property.type as string,
			usage: property.usage as string,
			address: property.address,
			address2: property.address2 ?? '',
			city: property.city,
			postalCode: property.postalCode,
			surface: property.surface.toString(),
			rooms: property.rooms?.toString() ?? '',
			bedrooms: property.bedrooms?.toString() ?? '',
			purchasePrice: property.purchasePrice.toString(),
			purchaseDate: new Date(property.purchaseDate).toISOString().split('T')[0],
			notaryFees: property.notaryFees.toString(),
			agencyFees: property.agencyFees?.toString() ?? '',
			currentValue: property.currentValue.toString(),
			rentAmount: property.rentAmount?.toString() ?? '',
			rentCharges: property.rentCharges?.toString() ?? '',
			notes: property.notes ?? '',
		},
		validators: {
			onSubmit: propertyFormSchema,
		},
		onSubmit: async ({ value }) => {
			if (memberShares.length > 0) {
				const totalShare = memberShares.reduce((sum, ms) => sum + ms.ownershipShare, 0)
				if (totalShare !== 100) {
					toast.error('La somme des parts de propriété doit être égale à 100%')
					return
				}
			}

			await updateMutation.mutateAsync({
				id: property.id,
				input: {
					name: value.name.trim(),
					type: value.type as PropertyType,
					usage: value.usage as PropertyUsage,
					address: value.address.trim(),
					address2: value.address2?.trim() || null,
					city: value.city.trim(),
					postalCode: value.postalCode.trim(),
					surface: Number.parseFloat(value.surface),
					rooms: value.rooms ? Number.parseInt(value.rooms, 10) : null,
					bedrooms: value.bedrooms ? Number.parseInt(value.bedrooms, 10) : null,
					purchasePrice: Number.parseFloat(value.purchasePrice),
					purchaseDate: value.purchaseDate,
					notaryFees: Number.parseFloat(value.notaryFees),
					agencyFees: value.agencyFees ? Number.parseFloat(value.agencyFees) : null,
					currentValue: Number.parseFloat(value.currentValue),
					rentAmount: value.rentAmount ? Number.parseFloat(value.rentAmount) : null,
					rentCharges: value.rentCharges ? Number.parseFloat(value.rentCharges) : null,
					notes: value.notes?.trim() || null,
					memberShares: memberShares.length > 0 ? memberShares : undefined,
				},
			})

			toast.success('Bien immobilier modifié avec succès')
			onOpenChange(false)
		},
	})

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
		setMemberShares((prev) =>
			prev.map((ms, i) => (i === index ? { ...ms, memberId } : ms)),
		)
	}

	const handleShareChange = (index: number, share: number) => {
		setMemberShares((prev) =>
			prev.map((ms, i) => (i === index ? { ...ms, ownershipShare: share } : ms)),
		)
	}

	const totalShare = memberShares.reduce((sum, ms) => sum + ms.ownershipShare, 0)

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="right" size="lg">
				<SheetHeader>
					<SheetTitle>Modifier le bien immobilier</SheetTitle>
					<SheetDescription>
						Modifiez les informations de votre bien immobilier.
					</SheetDescription>
				</SheetHeader>

				<SheetBody>
					<form
						id="property-edit-form"
						onSubmit={(e) => {
							e.preventDefault()
							form.handleSubmit()
						}}
					>
						<FieldGroup>
							{/* Basic info */}
							<p className="text-sm font-medium text-muted-foreground">
								Informations générales
							</p>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<form.Field
									name="name"
									children={(field) => {
										const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor="edit-name">Nom du bien</FieldLabel>
												<Input
													id="edit-name"
													name={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													aria-invalid={isInvalid}
													placeholder="Appartement Paris 15"
												/>
												{isInvalid && <FieldError errors={field.state.meta.errors} />}
											</Field>
										)
									}}
								/>
								<form.Field
									name="type"
									children={(field) => {
										const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor="edit-type">Type</FieldLabel>
												<Select
													name={field.name}
													value={field.state.value}
													onValueChange={(v) => field.handleChange(v)}
												>
													<SelectTrigger id="edit-type" className="w-full" aria-invalid={isInvalid}>
														<SelectValue placeholder="Sélectionner..." />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="APARTMENT">Appartement</SelectItem>
														<SelectItem value="HOUSE">Maison</SelectItem>
													</SelectContent>
												</Select>
												{isInvalid && <FieldError errors={field.state.meta.errors} />}
											</Field>
										)
									}}
								/>
								<form.Field
									name="usage"
									children={(field) => {
										const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor="edit-usage">Usage</FieldLabel>
												<Select
													name={field.name}
													value={field.state.value}
													onValueChange={(v) => field.handleChange(v)}
												>
													<SelectTrigger id="edit-usage" className="w-full" aria-invalid={isInvalid}>
														<SelectValue placeholder="Sélectionner..." />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="PRIMARY">Résidence principale</SelectItem>
														<SelectItem value="SECONDARY">Résidence secondaire</SelectItem>
														<SelectItem value="RENTAL">Locatif</SelectItem>
													</SelectContent>
												</Select>
												{isInvalid && <FieldError errors={field.state.meta.errors} />}
											</Field>
										)
									}}
								/>
								<form.Field
									name="surface"
									children={(field) => {
										const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor="edit-surface">Surface (m²)</FieldLabel>
												<Input
													id="edit-surface"
													name={field.name}
													type="number"
													min="0"
													step="0.01"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													aria-invalid={isInvalid}
													placeholder="65"
												/>
												{isInvalid && <FieldError errors={field.state.meta.errors} />}
											</Field>
										)
									}}
								/>
								<form.Field
									name="rooms"
									children={(field) => (
										<Field>
											<FieldLabel htmlFor="edit-rooms">Pièces</FieldLabel>
											<Input
												id="edit-rooms"
												name={field.name}
												type="number"
												min="0"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="3"
											/>
										</Field>
									)}
								/>
								<form.Field
									name="bedrooms"
									children={(field) => (
										<Field>
											<FieldLabel htmlFor="edit-bedrooms">Chambres</FieldLabel>
											<Input
												id="edit-bedrooms"
												name={field.name}
												type="number"
												min="0"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="2"
											/>
										</Field>
									)}
								/>
							</div>

							{/* Address */}
							<p className="text-sm font-medium text-muted-foreground">Adresse</p>
							<form.Field
								name="address"
								children={(field) => {
									const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor="edit-address">Adresse</FieldLabel>
											<Input
												id="edit-address"
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
												placeholder="10 rue de Paris"
											/>
											{isInvalid && <FieldError errors={field.state.meta.errors} />}
										</Field>
									)
								}}
							/>
							<form.Field
								name="address2"
								children={(field) => (
									<Field>
										<FieldLabel htmlFor="edit-address2">
											Complément d&apos;adresse
										</FieldLabel>
										<Input
											id="edit-address2"
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="Bâtiment A, 3ème étage"
										/>
									</Field>
								)}
							/>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<form.Field
									name="city"
									children={(field) => {
										const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor="edit-city">Ville</FieldLabel>
												<Input
													id="edit-city"
													name={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													aria-invalid={isInvalid}
													placeholder="Paris"
												/>
												{isInvalid && <FieldError errors={field.state.meta.errors} />}
											</Field>
										)
									}}
								/>
								<form.Field
									name="postalCode"
									children={(field) => {
										const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor="edit-postalCode">
													Code postal
												</FieldLabel>
												<Input
													id="edit-postalCode"
													name={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													aria-invalid={isInvalid}
													placeholder="75015"
												/>
												{isInvalid && <FieldError errors={field.state.meta.errors} />}
											</Field>
										)
									}}
								/>
							</div>

							{/* Purchase info */}
							<p className="text-sm font-medium text-muted-foreground">Achat</p>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<form.Field
									name="purchasePrice"
									children={(field) => {
										const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor="edit-purchasePrice">
													Prix d&apos;achat (€)
												</FieldLabel>
												<Input
													id="edit-purchasePrice"
													name={field.name}
													type="number"
													min="0"
													step="0.01"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													aria-invalid={isInvalid}
													placeholder="350000"
												/>
												{isInvalid && <FieldError errors={field.state.meta.errors} />}
											</Field>
										)
									}}
								/>
								<form.Field
									name="purchaseDate"
									children={(field) => {
										const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor="edit-purchaseDate">
													Date d&apos;achat
												</FieldLabel>
												<Input
													id="edit-purchaseDate"
													name={field.name}
													type="date"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													aria-invalid={isInvalid}
												/>
												{isInvalid && <FieldError errors={field.state.meta.errors} />}
											</Field>
										)
									}}
								/>
								<form.Field
									name="notaryFees"
									children={(field) => {
										const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor="edit-notaryFees">
													Frais de notaire (€)
												</FieldLabel>
												<Input
													id="edit-notaryFees"
													name={field.name}
													type="number"
													min="0"
													step="0.01"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													aria-invalid={isInvalid}
													placeholder="25000"
												/>
												{isInvalid && <FieldError errors={field.state.meta.errors} />}
											</Field>
										)
									}}
								/>
								<form.Field
									name="agencyFees"
									children={(field) => (
										<Field>
											<FieldLabel htmlFor="edit-agencyFees">
												Frais d&apos;agence (€)
											</FieldLabel>
											<Input
												id="edit-agencyFees"
												name={field.name}
												type="number"
												min="0"
												step="0.01"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="10000"
											/>
										</Field>
									)}
								/>
							</div>

							{/* Current value */}
							<p className="text-sm font-medium text-muted-foreground">
								Valeur actuelle
							</p>
							<form.Field
								name="currentValue"
								children={(field) => {
									const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor="edit-currentValue">
												Valeur estimée (€)
											</FieldLabel>
											<Input
												id="edit-currentValue"
												name={field.name}
												type="number"
												min="0"
												step="0.01"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
												placeholder="380000"
											/>
											{isInvalid && <FieldError errors={field.state.meta.errors} />}
										</Field>
									)
								}}
							/>

							{/* Rental info - conditionally shown */}
							<form.Subscribe
								selector={(state) => state.values.usage}
								children={(usage) =>
									usage === 'RENTAL' ? (
										<>
											<p className="text-sm font-medium text-muted-foreground">
												Informations locatives
											</p>
											<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
												<form.Field
													name="rentAmount"
													children={(field) => (
														<Field>
															<FieldLabel htmlFor="edit-rentAmount">
																Loyer mensuel (€)
															</FieldLabel>
															<Input
																id="edit-rentAmount"
																name={field.name}
																type="number"
																min="0"
																step="0.01"
																value={field.state.value}
																onBlur={field.handleBlur}
																onChange={(e) => field.handleChange(e.target.value)}
																placeholder="1200"
															/>
														</Field>
													)}
												/>
												<form.Field
													name="rentCharges"
													children={(field) => (
														<Field>
															<FieldLabel htmlFor="edit-rentCharges">
																Charges locatives (€)
															</FieldLabel>
															<Input
																id="edit-rentCharges"
																name={field.name}
																type="number"
																min="0"
																step="0.01"
																value={field.state.value}
																onBlur={field.handleBlur}
																onChange={(e) => field.handleChange(e.target.value)}
																placeholder="150"
															/>
														</Field>
													)}
												/>
											</div>
										</>
									) : null
								}
							/>

							{/* Members/Owners */}
							<div className="flex flex-col gap-4">
								<div className="flex items-center justify-between">
									<p className="text-sm font-medium text-muted-foreground">
										Propriétaires
									</p>
									{members.length > memberShares.length && (
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={handleAddMember}
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
										Aucun propriétaire sélectionné. Cliquez sur
										&quot;Ajouter&quot; pour ajouter des propriétaires.
									</p>
								) : (
									<div className="flex flex-col gap-3">
										{memberShares.map((ms, index) => {
											const availableMembers = members.filter(
												(m) =>
													m.id === ms.memberId ||
													!memberShares.some(
														(other) => other.memberId === m.id,
													),
											)
											return (
												<MemberShareRow
													key={ms.memberId}
													memberId={ms.memberId}
													ownershipShare={ms.ownershipShare}
													members={members}
													availableMembers={availableMembers}
													onMemberChange={(memberId) =>
														handleMemberChange(index, memberId)
													}
													onShareChange={(share) =>
														handleShareChange(index, share)
													}
													onRemove={() => handleRemoveMember(ms.memberId)}
												/>
											)
										})}
										{memberShares.length > 0 && (
											<p className="text-right text-xs text-muted-foreground">
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
							<form.Field
								name="notes"
								children={(field) => (
									<Field>
										<FieldLabel htmlFor="edit-notes">Notes</FieldLabel>
										<Input
											id="edit-notes"
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="Notes additionnelles..."
										/>
									</Field>
								)}
							/>
						</FieldGroup>
					</form>
				</SheetBody>

				<SheetFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={updateMutation.isPending}
					>
						Annuler
					</Button>
					<Button
						type="submit"
						form="property-edit-form"
						disabled={updateMutation.isPending}
					>
						{updateMutation.isPending ? (
							<span className="flex items-center gap-2">
								<Loader2 className="h-4 w-4 animate-spin" />
								Modification...
							</span>
						) : (
							'Enregistrer'
						)}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	)
}
