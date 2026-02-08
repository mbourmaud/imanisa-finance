'use client'

import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'

import {
	Button,
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
	FormErrorBanner,
	Input,
	Loader2,
	MemberShareRow,
	Plus,
	PropertyFormGrid,
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
	SheetTrigger,
} from '@/components'
import { useCreatePropertyMutation } from '@/features/properties'
import { propertyFormSchema } from '@/features/properties/forms/property-form-schema'
import type { MemberShare, PropertyType, PropertyUsage } from '@/features/properties'

interface Member {
	id: string
	name: string
	color: string | null
}

interface CreatePropertySheetProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	members: Member[]
}

export function CreatePropertySheet({
	open,
	onOpenChange,
	members,
}: CreatePropertySheetProps) {
	const createMutation = useCreatePropertyMutation()
	const [memberShares, setMemberShares] = useState<MemberShare[]>([])
	const [shareError, setShareError] = useState<string | null>(null)

	const form = useForm({
		defaultValues: {
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
		},
		validators: {
			onSubmit: propertyFormSchema,
		},
		onSubmit: async ({ value }) => {
			setShareError(null)

			if (memberShares.length > 0) {
				const totalShare = memberShares.reduce((sum, ms) => sum + ms.ownershipShare, 0)
				if (totalShare !== 100) {
					setShareError('La somme des parts de propriété doit être égale à 100%')
					return
				}
			}

			await createMutation.mutateAsync({
				name: value.name,
				type: value.type as PropertyType,
				usage: value.usage as PropertyUsage,
				address: value.address,
				address2: value.address2 || null,
				city: value.city,
				postalCode: value.postalCode,
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
				notes: value.notes || null,
				memberShares: memberShares.length > 0 ? memberShares : undefined,
			})
			toast.success('Bien créé avec succès')
			resetAll()
			onOpenChange(false)
		},
	})

	const resetAll = () => {
		form.reset()
		setMemberShares([])
		setShareError(null)
		createMutation.reset()
	}

	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) resetAll()
		onOpenChange(nextOpen)
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
		setMemberShares((prev) =>
			prev.map((ms, i) => (i === index ? { ...ms, memberId } : ms)),
		)
	}

	const handleShareChange = (index: number, share: number) => {
		setMemberShares((prev) =>
			prev.map((ms, i) => (i === index ? { ...ms, ownershipShare: share } : ms)),
		)
	}

	const isRental = form.getFieldValue('usage') === 'RENTAL'
	const isSubmitting = createMutation.isPending
	const formError = shareError || (createMutation.isError ? (createMutation.error?.message || 'Une erreur est survenue') : null)

	return (
		<Sheet open={open} onOpenChange={handleOpenChange}>
			<SheetTrigger asChild>
				<Button iconLeft={<Plus className="h-4 w-4" />}>Ajouter un bien</Button>
			</SheetTrigger>
			<SheetContent side="right" size="lg" className="sm:max-w-2xl">
				<SheetHeader>
					<SheetTitle>Ajouter un bien immobilier</SheetTitle>
					<SheetDescription>
						Renseignez les informations de votre bien immobilier.
					</SheetDescription>
				</SheetHeader>
				<SheetBody>
					<form
						id="create-property-form"
						onSubmit={(e) => {
							e.preventDefault()
							form.handleSubmit()
						}}
					>
						<FieldGroup>
							{formError && <FormErrorBanner message={formError} />}

							{/* Basic info */}
							<FieldGroup>
								<span className="text-sm font-medium text-muted-foreground">
									Informations générales
								</span>
								<PropertyFormGrid>
									<form.Field
										name="name"
										children={(field) => {
											const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
											return (
												<Field data-invalid={isInvalid}>
													<FieldLabel htmlFor="prop-name">Nom du bien *</FieldLabel>
													<Input
														id="prop-name"
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
													<FieldLabel htmlFor="prop-type">Type *</FieldLabel>
													<Select
														name={field.name}
														value={field.state.value}
														onValueChange={(v) => field.handleChange(v)}
													>
														<SelectTrigger id="prop-type" aria-invalid={isInvalid} className="w-full">
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
													<FieldLabel htmlFor="prop-usage">Usage *</FieldLabel>
													<Select
														name={field.name}
														value={field.state.value}
														onValueChange={(v) => field.handleChange(v)}
													>
														<SelectTrigger id="prop-usage" aria-invalid={isInvalid} className="w-full">
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
													<FieldLabel htmlFor="prop-surface">Surface (m²) *</FieldLabel>
													<Input
														id="prop-surface"
														type="number"
														min="0"
														step="0.01"
														name={field.name}
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
												<FieldLabel htmlFor="prop-rooms">Pièces</FieldLabel>
												<Input
													id="prop-rooms"
													type="number"
													min="0"
													name={field.name}
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
												<FieldLabel htmlFor="prop-bedrooms">Chambres</FieldLabel>
												<Input
													id="prop-bedrooms"
													type="number"
													min="0"
													name={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													placeholder="2"
												/>
											</Field>
										)}
									/>
								</PropertyFormGrid>
							</FieldGroup>

							{/* Address */}
							<FieldGroup>
								<span className="text-sm font-medium text-muted-foreground">Adresse</span>

								<form.Field
									name="address"
									children={(field) => {
										const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor="prop-address">Adresse *</FieldLabel>
												<Input
													id="prop-address"
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
											<FieldLabel htmlFor="prop-address2">Complément d&apos;adresse</FieldLabel>
											<Input
												id="prop-address2"
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="Bâtiment A, 3ème étage"
											/>
										</Field>
									)}
								/>

								<PropertyFormGrid>
									<form.Field
										name="city"
										children={(field) => {
											const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
											return (
												<Field data-invalid={isInvalid}>
													<FieldLabel htmlFor="prop-city">Ville *</FieldLabel>
													<Input
														id="prop-city"
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
													<FieldLabel htmlFor="prop-postal">Code postal *</FieldLabel>
													<Input
														id="prop-postal"
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
								</PropertyFormGrid>
							</FieldGroup>

							{/* Purchase info */}
							<FieldGroup>
								<span className="text-sm font-medium text-muted-foreground">Achat</span>
								<PropertyFormGrid>
									<form.Field
										name="purchasePrice"
										children={(field) => {
											const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
											return (
												<Field data-invalid={isInvalid}>
													<FieldLabel htmlFor="prop-price">Prix d&apos;achat (€) *</FieldLabel>
													<Input
														id="prop-price"
														type="number"
														min="0"
														step="0.01"
														name={field.name}
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
													<FieldLabel htmlFor="prop-date">Date d&apos;achat *</FieldLabel>
													<Input
														id="prop-date"
														type="date"
														name={field.name}
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
													<FieldLabel htmlFor="prop-notary">Frais de notaire (€) *</FieldLabel>
													<Input
														id="prop-notary"
														type="number"
														min="0"
														step="0.01"
														name={field.name}
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
												<FieldLabel htmlFor="prop-agency">Frais d&apos;agence (€)</FieldLabel>
												<Input
													id="prop-agency"
													type="number"
													min="0"
													step="0.01"
													name={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													placeholder="10000"
												/>
											</Field>
										)}
									/>
								</PropertyFormGrid>
							</FieldGroup>

							{/* Current value */}
							<FieldGroup>
								<span className="text-sm font-medium text-muted-foreground">Valeur actuelle</span>
								<form.Field
									name="currentValue"
									children={(field) => {
										const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor="prop-value">Valeur estimée (€) *</FieldLabel>
												<Input
													id="prop-value"
													type="number"
													min="0"
													step="0.01"
													name={field.name}
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
							</FieldGroup>

							{/* Rental info */}
							{isRental && (
								<FieldGroup>
									<span className="text-sm font-medium text-muted-foreground">
										Informations locatives
									</span>
									<PropertyFormGrid>
										<form.Field
											name="rentAmount"
											children={(field) => (
												<Field>
													<FieldLabel htmlFor="prop-rent">Loyer mensuel (€)</FieldLabel>
													<Input
														id="prop-rent"
														type="number"
														min="0"
														step="0.01"
														name={field.name}
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
													<FieldLabel htmlFor="prop-charges">Charges locatives (€)</FieldLabel>
													<Input
														id="prop-charges"
														type="number"
														min="0"
														step="0.01"
														name={field.name}
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														placeholder="150"
													/>
												</Field>
											)}
										/>
									</PropertyFormGrid>
								</FieldGroup>
							)}

							{/* Members/Owners */}
							<FieldGroup>
								<div className="flex flex-row justify-between">
									<span className="text-sm font-medium text-muted-foreground">Propriétaires</span>
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
								</div>
								{memberShares.length === 0 ? (
									<span className="text-sm text-muted-foreground">
										Aucun propriétaire sélectionné. Cliquez sur &quot;Ajouter&quot; pour ajouter des
										propriétaires.
									</span>
								) : (
									<div className="flex flex-col gap-4">
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
												Total: {memberShares.reduce((sum, ms) => sum + ms.ownershipShare, 0)}%
												{memberShares.reduce((sum, ms) => sum + ms.ownershipShare, 0) !== 100 && (
													<span className="ml-1 text-destructive">(doit être 100%)</span>
												)}
											</span>
										)}
									</div>
								)}
							</FieldGroup>

							{/* Notes */}
							<form.Field
								name="notes"
								children={(field) => (
									<Field>
										<FieldLabel htmlFor="prop-notes">Notes</FieldLabel>
										<Input
											id="prop-notes"
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
						onClick={() => handleOpenChange(false)}
						disabled={isSubmitting}
					>
						Annuler
					</Button>
					<Button type="submit" form="create-property-form" disabled={isSubmitting}>
						{isSubmitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Création...
							</>
						) : (
							'Créer le bien'
						)}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	)
}
