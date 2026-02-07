'use client'

import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'

import {
	Button,
	ConfirmSheet,
	EmptyState,
	Input,
	MemberAvatar,
	Plus,
	SettingsColorPicker,
	SettingsMemberRow,
	SettingsMemberSkeleton,
	SettingsSectionCard,
	Sheet,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
	Users,
} from '@/components'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
	useCreateMemberMutation,
	useDeleteMemberMutation,
	useMembersQuery,
	useUpdateMemberMutation,
	type Member,
} from '@/features/members'
import { memberFormSchema } from '@/features/members/forms/member-form-schema'

interface MemberWithAccounts extends Member {
	accountMembers: {
		id: string
		ownerShare: number
		account: {
			id: string
			name: string
		}
	}[]
}

const MEMBER_COLORS = [
	{ name: 'Blue', value: '#3B82F6' },
	{ name: 'Green', value: '#10B981' },
	{ name: 'Amber', value: '#F59E0B' },
	{ name: 'Red', value: '#EF4444' },
	{ name: 'Purple', value: '#8B5CF6' },
	{ name: 'Pink', value: '#EC4899' },
	{ name: 'Indigo', value: '#6366F1' },
	{ name: 'Teal', value: '#14B8A6' },
]

export function MembersSection() {
	const { data: members = [], isLoading: loadingMembers } = useMembersQuery() as {
		data: MemberWithAccounts[] | undefined
		isLoading: boolean
	}
	const createMutation = useCreateMemberMutation()
	const updateMutation = useUpdateMemberMutation()
	const deleteMutation = useDeleteMemberMutation()

	const [showAddMember, setShowAddMember] = useState(false)
	const [editingMember, setEditingMember] = useState<MemberWithAccounts | null>(null)
	const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null)

	// Add member form
	const addForm = useForm({
		defaultValues: {
			name: '',
			color: MEMBER_COLORS[0].value,
		},
		validators: {
			onSubmit: memberFormSchema,
		},
		onSubmit: async ({ value }) => {
			await createMutation.mutateAsync({ name: value.name, color: value.color })
			toast.success('Membre ajouté avec succès')
			addForm.reset()
			setShowAddMember(false)
		},
	})

	// Edit member form
	const editForm = useForm({
		defaultValues: {
			name: editingMember?.name ?? '',
			color: editingMember?.color ?? MEMBER_COLORS[0].value,
		},
		validators: {
			onSubmit: memberFormSchema,
		},
		onSubmit: async ({ value }) => {
			if (!editingMember) return
			await updateMutation.mutateAsync({
				id: editingMember.id,
				input: { name: value.name, color: value.color },
			})
			toast.success('Membre mis à jour')
			setEditingMember(null)
		},
	})

	const handleOpenEdit = (member: MemberWithAccounts) => {
		setEditingMember(member)
		editForm.reset()
		editForm.setFieldValue('name', member.name)
		editForm.setFieldValue('color', member.color ?? MEMBER_COLORS[0].value)
	}

	const confirmDeleteMember = async () => {
		if (!deleteMemberId) return
		try {
			await deleteMutation.mutateAsync(deleteMemberId)
			toast.success('Membre supprimé')
		} catch {
			toast.error('Impossible de supprimer le membre')
		} finally {
			setDeleteMemberId(null)
		}
	}

	const memberToDelete = members.find((m) => m.id === deleteMemberId)

	return (
		<>
			<SettingsSectionCard
				icon={Users}
				title="Membres du foyer"
				description="Gérez les membres associés aux comptes"
				action={
					<Sheet open={showAddMember} onOpenChange={setShowAddMember}>
						<SheetTrigger asChild>
							<Button variant="outline" size="sm" iconLeft={<Plus className="h-4 w-4" />}>
								Ajouter
							</Button>
						</SheetTrigger>
						<SheetContent side="right" size="sm">
							<SheetHeader>
								<SheetTitle>Ajouter un membre</SheetTitle>
							</SheetHeader>
							<form
								id="add-member-form"
								onSubmit={(e) => {
									e.preventDefault()
									addForm.handleSubmit()
								}}
							>
								<FieldGroup>
									<addForm.Field
										name="name"
										children={(field) => {
											const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
											return (
												<Field data-invalid={isInvalid}>
													<FieldLabel htmlFor="add-member-name">Nom</FieldLabel>
													<Input
														id="add-member-name"
														name={field.name}
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														aria-invalid={isInvalid}
														placeholder="Prénom"
													/>
													{isInvalid && <FieldError errors={field.state.meta.errors} />}
												</Field>
											)
										}}
									/>
									<addForm.Field
										name="color"
										children={(field) => (
											<SettingsColorPicker
												colors={MEMBER_COLORS}
												selected={field.state.value}
												onChange={field.handleChange}
											/>
										)}
									/>
								</FieldGroup>
							</form>
							<SheetFooter>
								<Button variant="outline" onClick={() => setShowAddMember(false)}>
									Annuler
								</Button>
								<Button
									type="submit"
									form="add-member-form"
									disabled={createMutation.isPending}
								>
									{createMutation.isPending ? 'Ajout...' : 'Ajouter'}
								</Button>
							</SheetFooter>
						</SheetContent>
					</Sheet>
				}
			>
				<div className="flex flex-col gap-2">
					{loadingMembers ? (
						<>
							<SettingsMemberSkeleton />
							<SettingsMemberSkeleton />
							<SettingsMemberSkeleton />
						</>
					) : members.length === 0 ? (
						<EmptyState
							icon={Users}
							title="Aucun membre"
							description="Ajoutez votre premier membre pour commencer"
						/>
					) : (
						members.map((member) => (
							<SettingsMemberRow
								key={member.id}
								avatar={
									<MemberAvatar
										member={{
											id: member.id,
											name: member.name,
											color: member.color,
											avatarUrl: member.avatarUrl,
										}}
										size="md"
									/>
								}
								name={member.name}
								accountCount={member.accountMembers?.length ?? 0}
								onEdit={() => handleOpenEdit(member)}
								onDelete={() => setDeleteMemberId(member.id)}
								editDialog={
									<Sheet
										open={editingMember?.id === member.id}
										onOpenChange={(open) => !open && setEditingMember(null)}
									>
										<SheetContent side="right" size="sm">
											<SheetHeader>
												<SheetTitle>Modifier le membre</SheetTitle>
											</SheetHeader>
											{editingMember?.id === member.id && (
												<form
													id={`edit-member-form-${member.id}`}
													onSubmit={(e) => {
														e.preventDefault()
														editForm.handleSubmit()
													}}
												>
													<FieldGroup>
														<editForm.Field
															name="name"
															children={(field) => {
																const isInvalid =
																	field.state.meta.isTouched && !field.state.meta.isValid
																return (
																	<Field data-invalid={isInvalid}>
																		<FieldLabel htmlFor="edit-member-name">
																			Nom
																		</FieldLabel>
																		<Input
																			id="edit-member-name"
																			name={field.name}
																			value={field.state.value}
																			onBlur={field.handleBlur}
																			onChange={(e) => field.handleChange(e.target.value)}
																			aria-invalid={isInvalid}
																		/>
																		{isInvalid && (
																			<FieldError errors={field.state.meta.errors} />
																		)}
																	</Field>
																)
															}}
														/>
														<editForm.Field
															name="color"
															children={(field) => (
																<SettingsColorPicker
																	colors={MEMBER_COLORS}
																	selected={field.state.value}
																	onChange={field.handleChange}
																/>
															)}
														/>
													</FieldGroup>
												</form>
											)}
											<SheetFooter>
												<Button variant="outline" onClick={() => setEditingMember(null)}>
													Annuler
												</Button>
												<Button
													type="submit"
													form={`edit-member-form-${member.id}`}
													disabled={updateMutation.isPending}
												>
													{updateMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
												</Button>
											</SheetFooter>
										</SheetContent>
									</Sheet>
								}
							/>
						))
					)}
				</div>
			</SettingsSectionCard>

			<ConfirmSheet
				open={deleteMemberId !== null}
				onOpenChange={(open) => !open && setDeleteMemberId(null)}
				title="Supprimer le membre"
				description={
					memberToDelete
						? `Êtes-vous sûr de vouloir supprimer "${memberToDelete.name}" ? Cette action est irréversible.`
						: ''
				}
				confirmLabel="Supprimer"
				variant="destructive"
				onConfirm={confirmDeleteMember}
			/>
		</>
	)
}
