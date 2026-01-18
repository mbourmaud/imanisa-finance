'use client'

/**
 * Settings Page
 *
 * User settings including profile, members, appearance, and data management.
 * Uses the new component library with glassmorphism styling.
 */

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
	Bell,
	Button,
	ConfirmDialog,
	Database,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Download,
	EmptyState,
	Flex,
	Input,
	Key,
	Label,
	PageHeader,
	Palette,
	Plus,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Separator,
	SettingsAppInfo,
	SettingsColorPicker,
	SettingsMemberRow,
	SettingsMemberSkeleton,
	SettingsNotificationRow,
	SettingsSectionCard,
	SettingsThemeSelector,
	Shield,
	Upload,
	User,
	Users,
} from '@/components'
import { MemberAvatar } from '@/components/members/MemberAvatar'
import { ProfileForm } from '@/features/profile'
import {
	useCreateMemberMutation,
	useDeleteMemberMutation,
	useMembersQuery,
	useUpdateMemberMutation,
	type Member,
} from '@/features/members'

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

export default function SettingsPage() {
	const [mounted, setMounted] = useState(false)
	const { theme, setTheme } = useTheme()

	// TanStack Query for members
	const { data: members = [], isLoading: loadingMembers } = useMembersQuery() as {
		data: MemberWithAccounts[] | undefined
		isLoading: boolean
	}
	const createMutation = useCreateMemberMutation()
	const updateMutation = useUpdateMemberMutation()
	const deleteMutation = useDeleteMemberMutation()

	// UI state only
	const [editingMember, setEditingMember] = useState<MemberWithAccounts | null>(null)
	const [showAddMember, setShowAddMember] = useState(false)
	const [newMemberName, setNewMemberName] = useState('')
	const [newMemberColor, setNewMemberColor] = useState(MEMBER_COLORS[0].value)
	const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null)

	// Avoid hydration mismatch by only rendering theme-dependent UI after mount
	useEffect(() => {
		setMounted(true)
	}, [])

	// Add member
	const handleAddMember = async () => {
		if (!newMemberName.trim()) return

		try {
			await createMutation.mutateAsync({ name: newMemberName, color: newMemberColor })
			toast.success('Membre ajouté avec succès')
			setNewMemberName('')
			setNewMemberColor(MEMBER_COLORS[0].value)
			setShowAddMember(false)
		} catch {
			toast.error("Impossible d'ajouter le membre")
		}
	}

	// Update member
	const handleUpdateMember = async () => {
		if (!editingMember || !editingMember.name.trim()) return

		try {
			await updateMutation.mutateAsync({
				id: editingMember.id,
				input: { name: editingMember.name, color: editingMember.color ?? undefined },
			})
			toast.success('Membre mis à jour')
			setEditingMember(null)
		} catch {
			toast.error('Impossible de mettre à jour le membre')
		}
	}

	// Delete member
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
	const isSaving = createMutation.isPending || updateMutation.isPending

	return (
		<Flex direction="col" gap="xl">
			{/* Header */}
			<PageHeader title="Paramètres" description="Configurez votre application" />

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Main Settings Column */}
				<Flex direction="col" gap="lg" className="lg:col-span-2">
					{/* Profile */}
					<SettingsSectionCard
						icon={User}
						title="Profil"
						description="Vos informations personnelles"
					>
						<ProfileForm />
						<Flex direction="col" gap="sm">
							<Label htmlFor="currency">Devise par défaut</Label>
							<Select defaultValue="eur">
								<SelectTrigger id="currency" className="w-full max-w-[200px]">
									<SelectValue placeholder="Sélectionner" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="eur">EUR</SelectItem>
									<SelectItem value="usd">USD ($)</SelectItem>
									<SelectItem value="gbp">GBP</SelectItem>
									<SelectItem value="chf">CHF</SelectItem>
								</SelectContent>
							</Select>
						</Flex>
					</SettingsSectionCard>

					{/* Members (Household) */}
					<SettingsSectionCard
						icon={Users}
						title="Membres du foyer"
						description="Gérez les membres associés aux comptes"
						action={
							<Dialog open={showAddMember} onOpenChange={setShowAddMember}>
								<DialogTrigger asChild>
									<Button
										variant="outline"
										size="sm"
										iconLeft={<Plus className="h-4 w-4" />}
									>
										Ajouter
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Ajouter un membre</DialogTitle>
									</DialogHeader>
									<Flex direction="col" gap="md" className="pt-4">
										<Flex direction="col" gap="sm">
											<Label htmlFor="memberName">Nom</Label>
											<Input
												id="memberName"
												placeholder="Prénom"
												value={newMemberName}
												onChange={(e) => setNewMemberName(e.target.value)}
											/>
										</Flex>
										<SettingsColorPicker
											colors={MEMBER_COLORS}
											selected={newMemberColor}
											onChange={setNewMemberColor}
										/>
										<Flex direction="row" justify="end" gap="md" className="pt-4">
											<Button variant="outline" onClick={() => setShowAddMember(false)}>
												Annuler
											</Button>
											<Button
												onClick={handleAddMember}
												disabled={isSaving || !newMemberName.trim()}
											>
												{createMutation.isPending ? 'Ajout...' : 'Ajouter'}
											</Button>
										</Flex>
									</Flex>
								</DialogContent>
							</Dialog>
						}
					>
						<Flex direction="col" gap="sm">
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
									size="sm"
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
										onEdit={() => setEditingMember(member)}
										onDelete={() => setDeleteMemberId(member.id)}
										editDialog={
											<Dialog
												open={editingMember?.id === member.id}
												onOpenChange={(open) => !open && setEditingMember(null)}
											>
												<DialogContent>
													<DialogHeader>
														<DialogTitle>Modifier le membre</DialogTitle>
													</DialogHeader>
													{editingMember && (
														<Flex direction="col" gap="md" className="pt-4">
															<Flex direction="col" gap="sm">
																<Label htmlFor="editMemberName">Nom</Label>
																<Input
																	id="editMemberName"
																	value={editingMember.name}
																	onChange={(e) =>
																		setEditingMember({ ...editingMember, name: e.target.value })
																	}
																/>
															</Flex>
															<SettingsColorPicker
																colors={MEMBER_COLORS}
																selected={editingMember.color || MEMBER_COLORS[0].value}
																onChange={(color) =>
																	setEditingMember({ ...editingMember, color })
																}
															/>
															<Flex direction="row" justify="end" gap="md" className="pt-4">
																<Button variant="outline" onClick={() => setEditingMember(null)}>
																	Annuler
																</Button>
																<Button onClick={handleUpdateMember} disabled={isSaving}>
																	{updateMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
																</Button>
															</Flex>
														</Flex>
													)}
												</DialogContent>
											</Dialog>
										}
									/>
								))
							)}
						</Flex>
					</SettingsSectionCard>

					{/* Appearance */}
					<SettingsSectionCard
						icon={Palette}
						title="Apparence"
						description="Personnalisez l'interface"
					>
						<SettingsThemeSelector
							theme={(theme as 'light' | 'dark' | 'system') || 'system'}
							onChange={setTheme}
							mounted={mounted}
						/>

						<Separator />

						{/* Language */}
						<Flex direction="col" gap="sm">
							<Label htmlFor="language">Langue</Label>
							<Select defaultValue="fr">
								<SelectTrigger id="language" className="w-full max-w-[200px]">
									<SelectValue placeholder="Sélectionner" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="fr">Français</SelectItem>
									<SelectItem value="en">English</SelectItem>
								</SelectContent>
							</Select>
						</Flex>
					</SettingsSectionCard>

					{/* Data & Privacy */}
					<SettingsSectionCard
						icon={Database}
						title="Données"
						description="Export et sauvegarde"
					>
						<Flex direction="col" gap="md">
							<Button
								variant="outline"
								className="flex-1"
								iconLeft={<Download className="h-4 w-4" />}
							>
								Exporter les données
							</Button>
							<Button
								variant="outline"
								className="flex-1"
								iconLeft={<Upload className="h-4 w-4" />}
							>
								Importer une sauvegarde
							</Button>
						</Flex>
						<p className="text-xs text-muted-foreground">
							Vos données sont stockées localement sur votre serveur. Effectuez des sauvegardes
							régulières pour éviter toute perte de données.
						</p>
					</SettingsSectionCard>
				</Flex>

				{/* Sidebar Settings */}
				<Flex direction="col" gap="lg">
					{/* Notifications */}
					<SettingsSectionCard icon={Bell} title="Notifications">
						<SettingsNotificationRow
							title="Alertes budget"
							description="Dépassement de budget"
							defaultChecked
						/>
						<Separator />
						<SettingsNotificationRow
							title="Transactions"
							description="Nouvelles transactions"
						/>
						<Separator />
						<SettingsNotificationRow
							title="Rappels"
							description="Échéances de prêts"
							defaultChecked
						/>
					</SettingsSectionCard>

					{/* Security */}
					<SettingsSectionCard icon={Shield} title="Sécurité">
						<Button
							variant="outline"
							className="w-full justify-start"
							iconLeft={<Key className="h-4 w-4" />}
						>
							Changer le mot de passe
						</Button>
						<SettingsNotificationRow
							title="2FA"
							description="Authentification double facteur"
						/>
						<Separator />
						<SettingsNotificationRow
							title="Sessions"
							description="Déconnexion automatique"
							defaultChecked
						/>
					</SettingsSectionCard>

					{/* App Info */}
					<SettingsAppInfo version="2.0.0" />
				</Flex>
			</div>

			<ConfirmDialog
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
		</Flex>
	)
}
