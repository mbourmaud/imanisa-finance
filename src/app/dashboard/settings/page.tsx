'use client';

/**
 * Settings Page
 *
 * User settings including profile, members, appearance, and data management.
 * Uses the new component library with glassmorphism styling.
 */

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import {
	Bell,
	Button,
	Database,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Download,
	EmptyState,
	GlassCard,
	Globe,
	Input,
	Key,
	Label,
	Moon,
	PageHeader,
	Palette,
	Pencil,
	Plus,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Separator,
	Shield,
	Skeleton,
	Sun,
	Switch,
	Trash2,
	Upload,
	User,
	Users,
} from '@/components';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { MemberAvatar } from '@/components/members/MemberAvatar';
import { ProfileForm } from '@/features/profile';

interface Member {
	id: string;
	name: string;
	color: string | null;
	avatarUrl: string | null;
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

function MemberSkeleton() {
	return (
		<div
			className="flex justify-between items-center p-4 rounded-xl"
			style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}
		>
			<div className="flex items-center gap-4">
				<Skeleton style={{ height: '2.5rem', width: '2.5rem', borderRadius: '0.5rem' }} />
				<div className="flex flex-col gap-2">
					<Skeleton style={{ height: '1.25rem', width: '6rem' }} />
					<Skeleton style={{ height: '1rem', width: '4rem' }} />
				</div>
			</div>
			<Skeleton style={{ height: '2rem', width: '2rem' }} />
		</div>
	);
}

export default function SettingsPage() {
	const [mounted, setMounted] = useState(false);
	const { theme, setTheme } = useTheme();

	// Members state
	const [members, setMembers] = useState<Member[]>([]);
	const [loadingMembers, setLoadingMembers] = useState(true);
	const [editingMember, setEditingMember] = useState<Member | null>(null);
	const [showAddMember, setShowAddMember] = useState(false);
	const [newMemberName, setNewMemberName] = useState('');
	const [newMemberColor, setNewMemberColor] = useState(MEMBER_COLORS[0].value);
	const [savingMember, setSavingMember] = useState(false);
	const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);

	// Fetch members
	useEffect(() => {
		async function fetchMembers() {
			try {
				const response = await fetch('/api/members');
				if (response.ok) {
					const data = await response.json();
					setMembers(data.members);
				}
			} catch (error) {
				console.error('Error fetching members:', error);
			} finally {
				setLoadingMembers(false);
			}
		}

		fetchMembers();
	}, []);

	// Avoid hydration mismatch by only rendering theme-dependent UI after mount
	useEffect(() => {
		setMounted(true);
	}, []);

	// Add member
	const handleAddMember = async () => {
		if (!newMemberName.trim()) return;

		setSavingMember(true);
		try {
			const response = await fetch('/api/members', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: newMemberName, color: newMemberColor }),
			});

			if (response.ok) {
				const member = await response.json();
				setMembers([...members, { ...member, accountMembers: [] }]);
				setNewMemberName('');
				setNewMemberColor(MEMBER_COLORS[0].value);
				setShowAddMember(false);
			}
		} catch (error) {
			console.error('Error adding member:', error);
		} finally {
			setSavingMember(false);
		}
	};

	// Update member
	const handleUpdateMember = async () => {
		if (!editingMember || !editingMember.name.trim()) return;

		setSavingMember(true);
		try {
			const response = await fetch(`/api/members/${editingMember.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: editingMember.name, color: editingMember.color }),
			});

			if (response.ok) {
				const updated = await response.json();
				setMembers(members.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)));
				setEditingMember(null);
			}
		} catch (error) {
			console.error('Error updating member:', error);
		} finally {
			setSavingMember(false);
		}
	};

	// Delete member
	const confirmDeleteMember = async () => {
		if (!deleteMemberId) return;

		try {
			const response = await fetch(`/api/members/${deleteMemberId}`, { method: 'DELETE' });

			if (response.ok) {
				setMembers(members.filter((m) => m.id !== deleteMemberId));
			} else {
				const data = await response.json();
				console.error(data.error || 'Impossible de supprimer ce membre');
			}
		} catch (error) {
			console.error('Error deleting member:', error);
		} finally {
			setDeleteMemberId(null);
		}
	};

	const memberToDelete = members.find((m) => m.id === deleteMemberId);

	return (
		<div className="flex flex-col gap-8">
			{/* Header */}
			<PageHeader title="Paramètres" description="Configurez votre application" />

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Main Settings Column */}
				<div className="flex flex-col gap-6" style={{ gridColumn: 'span 2' }}>
					{/* Profile */}
					<GlassCard padding="lg">
						<div className="flex flex-col gap-4">
							<div className="flex items-center gap-4 pb-2">
								<div
									className="flex items-center justify-center h-10 w-10 rounded-xl"
									style={{
										backgroundColor: 'hsl(var(--primary) / 0.1)',
										color: 'hsl(var(--primary))',
									}}
								>
									<User style={{ height: '1.25rem', width: '1.25rem' }} />
								</div>
								<div className="flex flex-col">
									<h3 className="text-lg font-medium tracking-tight">Profil</h3>
									<p className="text-sm text-muted-foreground">Vos informations personnelles</p>
								</div>
							</div>
							<ProfileForm />
							<div className="flex flex-col gap-2">
								<Label htmlFor="currency">Devise par défaut</Label>
								<Select defaultValue="eur">
									<SelectTrigger id="currency" style={{ width: '100%', maxWidth: '200px' }}>
										<SelectValue placeholder="Sélectionner" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="eur">EUR</SelectItem>
										<SelectItem value="usd">USD ($)</SelectItem>
										<SelectItem value="gbp">GBP</SelectItem>
										<SelectItem value="chf">CHF</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</GlassCard>

					{/* Members (Household) */}
					<GlassCard padding="lg">
						<div className="flex flex-col gap-4">
							<div className="flex justify-between items-center pb-2">
								<div className="flex items-center gap-4">
									<div
										className="flex items-center justify-center h-10 w-10 rounded-xl"
										style={{
											backgroundColor: 'hsl(var(--primary) / 0.1)',
											color: 'hsl(var(--primary))',
										}}
									>
										<Users style={{ height: '1.25rem', width: '1.25rem' }} />
									</div>
									<div className="flex flex-col">
										<h3 className="text-lg font-medium tracking-tight">Membres du foyer</h3>
										<p className="text-sm text-muted-foreground">
											Gérez les membres associés aux comptes
										</p>
									</div>
								</div>
								<Dialog open={showAddMember} onOpenChange={setShowAddMember}>
									<DialogTrigger asChild>
										<Button
											variant="outline"
											size="sm"
											iconLeft={<Plus style={{ height: '1rem', width: '1rem' }} />}
										>
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
											<div className="flex flex-col gap-2">
												<Label>Couleur</Label>
												<div className="flex flex-wrap gap-3">
													{MEMBER_COLORS.map((color) => (
														<button
															key={color.value}
															type="button"
															onClick={() => setNewMemberColor(color.value)}
															style={{
																borderRadius: '9999px',
																height: '2rem',
																width: '2rem',
																backgroundColor: color.value,
																transition: 'all 0.2s',
																outline:
																	newMemberColor === color.value
																		? '2px solid hsl(var(--primary))'
																		: 'none',
																outlineOffset: '2px',
																border: 'none',
																cursor: 'pointer',
															}}
															title={color.name}
														/>
													))}
												</div>
											</div>
											<div className="flex justify-end gap-3 pt-4">
												<Button variant="outline" onClick={() => setShowAddMember(false)}>
													Annuler
												</Button>
												<Button
													onClick={handleAddMember}
													disabled={savingMember || !newMemberName.trim()}
												>
													{savingMember ? 'Ajout...' : 'Ajouter'}
												</Button>
											</div>
										</div>
									</DialogContent>
								</Dialog>
							</div>
							<div className="flex flex-col gap-2">
								{loadingMembers ? (
									<>
										<MemberSkeleton />
										<MemberSkeleton />
										<MemberSkeleton />
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
										<div
											key={member.id}
											className="flex justify-between items-center p-4 rounded-xl"
											style={{
												backgroundColor: 'hsl(var(--background) / 0.5)',
												transition: 'background-color 0.2s',
											}}
										>
											<div className="flex items-center gap-4">
												<MemberAvatar
													member={{
														id: member.id,
														name: member.name,
														color: member.color,
														avatarUrl: member.avatarUrl,
													}}
													size="md"
												/>
												<div className="flex flex-col">
													<p className="font-medium">{member.name}</p>
													<p className="text-xs text-muted-foreground">
														{member.accountMembers.length} compte
														{member.accountMembers.length !== 1 ? 's' : ''}
													</p>
												</div>
											</div>
											<div className="flex items-center gap-3">
												<Dialog
													open={editingMember?.id === member.id}
													onOpenChange={(open) => !open && setEditingMember(null)}
												>
													<DialogTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															style={{ height: '2rem', width: '2rem' }}
															onClick={() => setEditingMember(member)}
														>
															<Pencil style={{ height: '1rem', width: '1rem' }} />
														</Button>
													</DialogTrigger>
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
																<div className="flex flex-col gap-2">
																	<Label>Couleur</Label>
																	<div className="flex flex-wrap gap-3">
																		{MEMBER_COLORS.map((color) => (
																			<button
																				key={color.value}
																				type="button"
																				onClick={() =>
																					setEditingMember({ ...editingMember, color: color.value })
																				}
																				style={{
																					borderRadius: '9999px',
																					height: '2rem',
																					width: '2rem',
																					backgroundColor: color.value,
																					transition: 'all 0.2s',
																					outline:
																						editingMember.color === color.value
																							? '2px solid hsl(var(--primary))'
																							: 'none',
																					outlineOffset: '2px',
																					border: 'none',
																					cursor: 'pointer',
																				}}
																				title={color.name}
																			/>
																		))}
																	</div>
																</div>
																<div className="flex justify-end gap-3 pt-4">
																	<Button variant="outline" onClick={() => setEditingMember(null)}>
																		Annuler
																	</Button>
																	<Button onClick={handleUpdateMember} disabled={savingMember}>
																		{savingMember ? 'Sauvegarde...' : 'Sauvegarder'}
																	</Button>
																</div>
															</div>
														)}
													</DialogContent>
												</Dialog>
												<Button
													variant="ghost"
													size="icon"
													style={{
														height: '2rem',
														width: '2rem',
														color: 'hsl(var(--destructive))',
													}}
													onClick={() => setDeleteMemberId(member.id)}
												>
													<Trash2 style={{ height: '1rem', width: '1rem' }} />
												</Button>
											</div>
										</div>
									))
								)}
							</div>
						</div>
					</GlassCard>

					{/* Appearance */}
					<GlassCard padding="lg">
						<div className="flex flex-col gap-6">
							<div className="flex items-center gap-4 pb-2">
								<div
									className="flex items-center justify-center h-10 w-10 rounded-xl"
									style={{
										backgroundColor: 'hsl(var(--primary) / 0.1)',
										color: 'hsl(var(--primary))',
									}}
								>
									<Palette style={{ height: '1.25rem', width: '1.25rem' }} />
								</div>
								<div className="flex flex-col">
									<h3 className="text-lg font-medium tracking-tight">Apparence</h3>
									<p className="text-sm text-muted-foreground">Personnalisez l&apos;interface</p>
								</div>
							</div>

							{/* Theme Selection */}
							<div className="flex flex-col gap-3">
								<Label>Thème</Label>
								<div className="grid grid-cols-3 gap-2">
									<button
										type="button"
										onClick={() => setTheme('light')}
										style={{
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'center',
											gap: '0.5rem',
											borderRadius: '0.75rem',
											padding: '1rem',
											border:
												mounted && theme === 'light'
													? '2px solid hsl(var(--primary))'
													: '2px solid hsl(var(--border) / 0.6)',
											backgroundColor:
												mounted && theme === 'light' ? 'hsl(var(--primary) / 0.05)' : 'transparent',
											transition: 'all 0.2s',
											cursor: 'pointer',
										}}
									>
										<Sun style={{ height: '1.25rem', width: '1.25rem' }} />
										<span className="text-sm font-medium">Clair</span>
									</button>
									<button
										type="button"
										onClick={() => setTheme('dark')}
										style={{
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'center',
											gap: '0.5rem',
											borderRadius: '0.75rem',
											padding: '1rem',
											border:
												mounted && theme === 'dark'
													? '2px solid hsl(var(--primary))'
													: '2px solid hsl(var(--border) / 0.6)',
											backgroundColor:
												mounted && theme === 'dark' ? 'hsl(var(--primary) / 0.05)' : 'transparent',
											transition: 'all 0.2s',
											cursor: 'pointer',
										}}
									>
										<Moon style={{ height: '1.25rem', width: '1.25rem' }} />
										<span className="text-sm font-medium">Sombre</span>
									</button>
									<button
										type="button"
										onClick={() => setTheme('system')}
										style={{
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'center',
											gap: '0.5rem',
											borderRadius: '0.75rem',
											padding: '1rem',
											border:
												mounted && theme === 'system'
													? '2px solid hsl(var(--primary))'
													: '2px solid hsl(var(--border) / 0.6)',
											backgroundColor:
												mounted && theme === 'system'
													? 'hsl(var(--primary) / 0.05)'
													: 'transparent',
											transition: 'all 0.2s',
											cursor: 'pointer',
										}}
									>
										<Globe style={{ height: '1.25rem', width: '1.25rem' }} />
										<span className="text-sm font-medium">Système</span>
									</button>
								</div>
							</div>

							<Separator />

							{/* Language */}
							<div className="flex flex-col gap-2">
								<Label htmlFor="language">Langue</Label>
								<Select defaultValue="fr">
									<SelectTrigger id="language" style={{ width: '100%', maxWidth: '200px' }}>
										<SelectValue placeholder="Sélectionner" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="fr">Français</SelectItem>
										<SelectItem value="en">English</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</GlassCard>

					{/* Data & Privacy */}
					<GlassCard padding="lg">
						<div className="flex flex-col gap-4">
							<div className="flex items-center gap-4 pb-2">
								<div
									className="flex items-center justify-center h-10 w-10 rounded-xl"
									style={{
										backgroundColor: 'hsl(var(--primary) / 0.1)',
										color: 'hsl(var(--primary))',
									}}
								>
									<Database style={{ height: '1.25rem', width: '1.25rem' }} />
								</div>
								<div className="flex flex-col">
									<h3 className="text-lg font-medium tracking-tight">Données</h3>
									<p className="text-sm text-muted-foreground">Export et sauvegarde</p>
								</div>
							</div>
							<div className="flex flex-col gap-3">
								<Button
									variant="outline"
									style={{ flex: 1 }}
									iconLeft={<Download style={{ height: '1rem', width: '1rem' }} />}
								>
									Exporter les données
								</Button>
								<Button
									variant="outline"
									style={{ flex: 1 }}
									iconLeft={<Upload style={{ height: '1rem', width: '1rem' }} />}
								>
									Importer une sauvegarde
								</Button>
							</div>
							<p className="text-xs text-muted-foreground">
								Vos données sont stockées localement sur votre serveur. Effectuez des sauvegardes
								régulières pour éviter toute perte de données.
							</p>
						</div>
					</GlassCard>
				</div>

				{/* Sidebar Settings */}
				<div className="flex flex-col gap-6">
					{/* Notifications */}
					<GlassCard padding="lg">
						<div className="flex flex-col gap-4">
							<div className="flex items-center gap-4 pb-2">
								<div
									className="flex items-center justify-center h-10 w-10 rounded-xl"
									style={{
										backgroundColor: 'hsl(var(--primary) / 0.1)',
										color: 'hsl(var(--primary))',
									}}
								>
									<Bell style={{ height: '1.25rem', width: '1.25rem' }} />
								</div>
								<h3 className="text-lg font-medium tracking-tight">Notifications</h3>
							</div>
							<div className="flex justify-between items-center">
								<div className="flex flex-col">
									<p className="font-medium">Alertes budget</p>
									<p className="text-xs text-muted-foreground">Dépassement de budget</p>
								</div>
								<Switch defaultChecked />
							</div>
							<Separator />
							<div className="flex justify-between items-center">
								<div className="flex flex-col">
									<p className="font-medium">Transactions</p>
									<p className="text-xs text-muted-foreground">Nouvelles transactions</p>
								</div>
								<Switch />
							</div>
							<Separator />
							<div className="flex justify-between items-center">
								<div className="flex flex-col">
									<p className="font-medium">Rappels</p>
									<p className="text-xs text-muted-foreground">Échéances de prêts</p>
								</div>
								<Switch defaultChecked />
							</div>
						</div>
					</GlassCard>

					{/* Security */}
					<GlassCard padding="lg">
						<div className="flex flex-col gap-4">
							<div className="flex items-center gap-4 pb-2">
								<div
									className="flex items-center justify-center h-10 w-10 rounded-xl"
									style={{
										backgroundColor: 'hsl(var(--primary) / 0.1)',
										color: 'hsl(var(--primary))',
									}}
								>
									<Shield style={{ height: '1.25rem', width: '1.25rem' }} />
								</div>
								<h3 className="text-lg font-medium tracking-tight">Sécurité</h3>
							</div>
							<Button
								variant="outline"
								style={{ width: '100%', justifyContent: 'flex-start' }}
								iconLeft={<Key style={{ height: '1rem', width: '1rem' }} />}
							>
								Changer le mot de passe
							</Button>
							<div className="flex justify-between items-center">
								<div className="flex flex-col">
									<p className="font-medium">2FA</p>
									<p className="text-xs text-muted-foreground">Authentification double facteur</p>
								</div>
								<Switch />
							</div>
							<Separator />
							<div className="flex justify-between items-center">
								<div className="flex flex-col">
									<p className="font-medium">Sessions</p>
									<p className="text-xs text-muted-foreground">Déconnexion automatique</p>
								</div>
								<Switch defaultChecked />
							</div>
						</div>
					</GlassCard>

					{/* App Info */}
					<GlassCard padding="lg" style={{ backgroundColor: 'hsl(var(--muted) / 0.2)' }}>
						<div className="flex flex-col items-center text-center">
							<p className="font-medium">Imanisa Finance</p>
							<p className="text-sm text-muted-foreground">Version 2.0.0</p>
							<p className="text-xs text-muted-foreground" style={{ marginTop: '1rem' }}>
								Application open source de gestion de patrimoine personnel
							</p>
							<a
								href="https://github.com/mbourmaud/imanisa-finance"
								target="_blank"
								rel="noopener noreferrer"
								style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'hsl(var(--primary))' }}
							>
								Voir sur GitHub
							</a>
						</div>
					</GlassCard>
				</div>
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
		</div>
	);
}
