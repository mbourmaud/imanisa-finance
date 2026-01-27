'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
	Button,
	ConfirmDialog,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	EmptyState,
	Input,
	Label,
	MemberAvatar,
	Plus,
	SettingsColorPicker,
	SettingsMemberRow,
	SettingsMemberSkeleton,
	SettingsSectionCard,
	Users,
} from '@/components';
import {
	useCreateMemberMutation,
	useDeleteMemberMutation,
	useMembersQuery,
	useUpdateMemberMutation,
	type Member,
} from '@/features/members';

interface MemberWithAccounts extends Member {
	accountMembers: {
		id: string;
		ownerShare: number;
		account: {
			id: string;
			name: string;
		};
	}[];
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
];

export function MembersSection() {
	// TanStack Query for members
	const { data: members = [], isLoading: loadingMembers } = useMembersQuery() as {
		data: MemberWithAccounts[] | undefined;
		isLoading: boolean;
	};
	const createMutation = useCreateMemberMutation();
	const updateMutation = useUpdateMemberMutation();
	const deleteMutation = useDeleteMemberMutation();

	// UI state
	const [editingMember, setEditingMember] = useState<MemberWithAccounts | null>(null);
	const [showAddMember, setShowAddMember] = useState(false);
	const [newMemberName, setNewMemberName] = useState('');
	const [newMemberColor, setNewMemberColor] = useState(MEMBER_COLORS[0].value);
	const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);

	// Add member
	const handleAddMember = async () => {
		if (!newMemberName.trim()) return;

		try {
			await createMutation.mutateAsync({ name: newMemberName, color: newMemberColor });
			toast.success('Membre ajouté avec succès');
			setNewMemberName('');
			setNewMemberColor(MEMBER_COLORS[0].value);
			setShowAddMember(false);
		} catch {
			toast.error("Impossible d'ajouter le membre");
		}
	};

	// Update member
	const handleUpdateMember = async () => {
		if (!editingMember || !editingMember.name.trim()) return;

		try {
			await updateMutation.mutateAsync({
				id: editingMember.id,
				input: { name: editingMember.name, color: editingMember.color ?? undefined },
			});
			toast.success('Membre mis à jour');
			setEditingMember(null);
		} catch {
			toast.error('Impossible de mettre à jour le membre');
		}
	};

	// Delete member
	const confirmDeleteMember = async () => {
		if (!deleteMemberId) return;

		try {
			await deleteMutation.mutateAsync(deleteMemberId);
			toast.success('Membre supprimé');
		} catch {
			toast.error('Impossible de supprimer le membre');
		} finally {
			setDeleteMemberId(null);
		}
	};

	const memberToDelete = members.find((m) => m.id === deleteMemberId);
	const isSaving = createMutation.isPending || updateMutation.isPending;

	return (
		<>
			<SettingsSectionCard
				icon={Users}
				title="Membres du foyer"
				description="Gérez les membres associés aux comptes"
				action={
					<Dialog open={showAddMember} onOpenChange={setShowAddMember}>
						<DialogTrigger asChild>
							<Button variant="outline" size="sm" iconLeft={<Plus className="h-4 w-4" />}>
								Ajouter
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Ajouter un membre</DialogTitle>
							</DialogHeader>
							<div className="flex flex-col gap-4 pt-4">
								<div className="flex flex-col gap-2">
									<Label htmlFor="memberName">Nom</Label>
									<Input
										id="memberName"
										placeholder="Prénom"
										value={newMemberName}
										onChange={(e) => setNewMemberName(e.target.value)}
									/>
								</div>
								<SettingsColorPicker
									colors={MEMBER_COLORS}
									selected={newMemberColor}
									onChange={setNewMemberColor}
								/>
								<div className="flex flex-row justify-end gap-4 pt-4">
									<Button variant="outline" onClick={() => setShowAddMember(false)}>
										Annuler
									</Button>
									<Button onClick={handleAddMember} disabled={isSaving || !newMemberName.trim()}>
										{createMutation.isPending ? 'Ajout...' : 'Ajouter'}
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>
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
												<div className="flex flex-col gap-4 pt-4">
													<div className="flex flex-col gap-2">
														<Label htmlFor="editMemberName">Nom</Label>
														<Input
															id="editMemberName"
															value={editingMember.name}
															onChange={(e) =>
																setEditingMember({ ...editingMember, name: e.target.value })
															}
														/>
													</div>
													<SettingsColorPicker
														colors={MEMBER_COLORS}
														selected={editingMember.color || MEMBER_COLORS[0].value}
														onChange={(color) => setEditingMember({ ...editingMember, color })}
													/>
													<div className="flex flex-row justify-end gap-4 pt-4">
														<Button variant="outline" onClick={() => setEditingMember(null)}>
															Annuler
														</Button>
														<Button onClick={handleUpdateMember} disabled={isSaving}>
															{updateMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
														</Button>
													</div>
												</div>
											)}
										</DialogContent>
									</Dialog>
								}
							/>
						))
					)}
				</div>
			</SettingsSectionCard>

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
		</>
	);
}
