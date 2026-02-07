'use client'

import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'

import {
	Button,
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	Input,
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
	Textarea,
} from '@/components'
import { useCreateAccountMutation } from '@/features/accounts'
import { accountFormSchema } from '@/features/banks/forms/account-form-schema'
import { MemberSelectorChips } from './MemberSelectorChips'

interface Member {
	id: string
	name: string
	color: string | null
}

interface AddAccountSheetProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	bankId: string
	bankName: string
	members: Member[]
	onSuccess?: () => void
}

export function AddAccountSheet({
	open,
	onOpenChange,
	bankId,
	bankName,
	members,
	onSuccess,
}: AddAccountSheetProps) {
	const createMutation = useCreateAccountMutation()

	const form = useForm({
		defaultValues: {
			name: '',
			description: '',
			exportUrl: '',
			type: 'CHECKING' as 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'LOAN',
			memberIds: [] as string[],
		},
		validators: {
			onSubmit: accountFormSchema,
		},
		onSubmit: async ({ value }) => {
			await createMutation.mutateAsync({
				name: value.name,
				description: value.description || undefined,
				exportUrl: value.exportUrl || undefined,
				bankId,
				type: value.type,
				memberIds: value.memberIds.length > 0 ? value.memberIds : undefined,
			})
			toast.success('Compte créé avec succès')
			form.reset()
			onOpenChange(false)
			onSuccess?.()
		},
	})

	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			form.reset()
			createMutation.reset()
		}
		onOpenChange(nextOpen)
	}

	return (
		<Sheet open={open} onOpenChange={handleOpenChange}>
			<SheetContent side="right" size="md">
				<SheetHeader>
					<SheetTitle>Nouveau compte</SheetTitle>
					<SheetDescription>{bankName}</SheetDescription>
				</SheetHeader>

				<SheetBody>
					<form
						id="add-account-form"
						onSubmit={(e) => {
							e.preventDefault()
							form.handleSubmit()
						}}
					>
						<FieldGroup>
							{createMutation.isError && (
								<div className="rounded-md border border-destructive/20 bg-destructive/10 p-3">
									<span className="text-sm text-destructive">
										{createMutation.error?.message || 'Erreur lors de la création du compte'}
									</span>
								</div>
							)}

							<form.Field
								name="name"
								children={(field) => {
									const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor="account-name">Nom du compte</FieldLabel>
											<Input
												id="account-name"
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
												placeholder="ex: Compte Joint, Livret A..."
											/>
											{isInvalid && <FieldError errors={field.state.meta.errors} />}
										</Field>
									)
								}}
							/>

							<form.Field
								name="description"
								children={(field) => (
									<Field>
										<FieldLabel htmlFor="account-description">
											Description
											<span className="ml-1 text-xs font-normal text-muted-foreground">
												(optionnel)
											</span>
										</FieldLabel>
										<Textarea
											id="account-description"
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="Notes ou contexte sur ce compte..."
											className="min-h-20 resize-none"
										/>
									</Field>
								)}
							/>

							<form.Field
								name="type"
								children={(field) => (
									<Field>
										<FieldLabel htmlFor="account-type">Type de compte</FieldLabel>
										<Select
											name={field.name}
											value={field.state.value}
											onValueChange={(v) => field.handleChange(v as typeof field.state.value)}
										>
											<SelectTrigger id="account-type">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="CHECKING">Compte courant</SelectItem>
												<SelectItem value="SAVINGS">Épargne</SelectItem>
												<SelectItem value="INVESTMENT">Investissement</SelectItem>
												<SelectItem value="LOAN">Prêt</SelectItem>
											</SelectContent>
										</Select>
									</Field>
								)}
							/>

							<form.Field
								name="exportUrl"
								children={(field) => (
									<Field>
										<FieldLabel htmlFor="account-export-url">
											Lien d'export
											<span className="ml-1 text-xs font-normal text-muted-foreground">
												(optionnel)
											</span>
										</FieldLabel>
										<Input
											id="account-export-url"
											type="url"
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="https://..."
										/>
										<FieldDescription>
											URL vers l'espace client pour exporter les relevés
										</FieldDescription>
									</Field>
								)}
							/>

							<form.Field
								name="memberIds"
								children={(field) => (
									<Field>
										<FieldLabel>Titulaires</FieldLabel>
										<MemberSelectorChips
											members={members}
											selectedIds={field.state.value}
											onToggle={(id) => {
												const current = field.state.value
												field.handleChange(
													current.includes(id)
														? current.filter((mid) => mid !== id)
														: [...current, id],
												)
											}}
										/>
									</Field>
								)}
							/>
						</FieldGroup>
					</form>
				</SheetBody>

				<SheetFooter>
					<Button
						variant="outline"
						onClick={() => handleOpenChange(false)}
						disabled={createMutation.isPending}
					>
						Annuler
					</Button>
					<Button
						type="submit"
						form="add-account-form"
						disabled={createMutation.isPending}
					>
						{createMutation.isPending ? 'Création...' : 'Créer le compte'}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	)
}
