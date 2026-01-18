'use client';

/**
 * Settings Page
 *
 * User settings including profile, members, appearance, and data management.
 * Uses the new component library with glassmorphism styling.
 */

import { useEffect, useState } from 'react';
import {
	Bell,
	Database,
	Download,
	Globe,
	Key,
	Moon,
	Palette,
	Plus,
	Shield,
	Sun,
	Upload,
	User,
	Users,
	Pencil,
	Trash2,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { MemberAvatar } from '@/components/members/MemberAvatar';

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
		<div className="flex items-center justify-between rounded-xl bg-muted/30 p-4">
			<div className="flex items-center gap-3">
				<Skeleton className="h-10 w-10 rounded-lg" />
				<div>
					<Skeleton className="h-5 w-24 mb-1" />
					<Skeleton className="h-4 w-16" />
				</div>
			</div>
			<Skeleton className="h-8 w-8" />
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
		<div className="space-y-8">
			{/* Header */}
			<PageHeader
				title="Paramètres"
				description="Configurez votre application"
			/>

			<div className="grid gap-6 lg:grid-cols-3">
				{/* Main Settings Column */}
				<div className="space-y-6 lg:col-span-2">
					{/* Profile */}
					<div className="glass-card p-6 space-y-4">
						<div className="flex items-center gap-3 pb-2">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
								<User className="h-5 w-5" />
							</div>
							<div>
								<h3 className="text-lg font-medium">Profil</h3>
								<p className="text-sm text-muted-foreground">Vos informations personnelles</p>
							</div>
						</div>
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="name">Nom</Label>
								<Input id="name" placeholder="Votre nom" defaultValue="Utilisateur" />
							</div>
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input id="email" type="email" placeholder="votre@email.com" />
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="currency">Devise par défaut</Label>
							<Select defaultValue="eur">
								<SelectTrigger id="currency" className="w-full sm:w-[200px]">
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

					{/* Members (Household) */}
					<div className="glass-card p-6 space-y-4">
						<div className="flex items-center justify-between pb-2">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
									<Users className="h-5 w-5" />
								</div>
								<div>
									<h3 className="text-lg font-medium">Membres du foyer</h3>
									<p className="text-sm text-muted-foreground">
										Gérez les membres associés aux comptes
									</p>
								</div>
							</div>
							<Dialog open={showAddMember} onOpenChange={setShowAddMember}>
								<DialogTrigger asChild>
									<Button variant="outline" size="sm" className="gap-2">
										<Plus className="h-4 w-4" />
										Ajouter
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Ajouter un membre</DialogTitle>
									</DialogHeader>
									<div className="space-y-4 pt-4">
										<div className="space-y-2">
											<Label htmlFor="memberName">Nom</Label>
											<Input
												id="memberName"
												placeholder="Prénom"
												value={newMemberName}
												onChange={(e) => setNewMemberName(e.target.value)}
											/>
										</div>
										<div className="space-y-2">
											<Label>Couleur</Label>
											<div className="flex gap-2 flex-wrap">
												{MEMBER_COLORS.map((color) => (
													<button
														key={color.value}
														type="button"
														onClick={() => setNewMemberColor(color.value)}
														className={`h-8 w-8 rounded-full transition-all ${
															newMemberColor === color.value
																? 'ring-2 ring-offset-2 ring-primary'
																: 'hover:scale-110'
														}`}
														style={{ backgroundColor: color.value }}
														title={color.name}
													/>
												))}
											</div>
										</div>
										<div className="flex justify-end gap-2 pt-4">
											<Button variant="outline" onClick={() => setShowAddMember(false)}>
												Annuler
											</Button>
											<Button onClick={handleAddMember} disabled={savingMember || !newMemberName.trim()}>
												{savingMember ? 'Ajout...' : 'Ajouter'}
											</Button>
										</div>
									</div>
								</DialogContent>
							</Dialog>
						</div>
						<div className="space-y-2">
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
										className="flex items-center justify-between rounded-xl bg-white/50 dark:bg-white/5 p-4 transition-colors hover:bg-white/80 dark:hover:bg-white/10"
									>
										<div className="flex items-center gap-3">
											<MemberAvatar
												member={{
													id: member.id,
													name: member.name,
													color: member.color,
													avatarUrl: member.avatarUrl,
												}}
												size="md"
											/>
											<div>
												<p className="font-medium">{member.name}</p>
												<p className="text-xs text-muted-foreground">
													{member.accountMembers.length} compte{member.accountMembers.length !== 1 ? 's' : ''}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Dialog open={editingMember?.id === member.id} onOpenChange={(open) => !open && setEditingMember(null)}>
												<DialogTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8"
														onClick={() => setEditingMember(member)}
													>
														<Pencil className="h-4 w-4" />
													</Button>
												</DialogTrigger>
												<DialogContent>
													<DialogHeader>
														<DialogTitle>Modifier le membre</DialogTitle>
													</DialogHeader>
													{editingMember && (
														<div className="space-y-4 pt-4">
															<div className="space-y-2">
																<Label htmlFor="editMemberName">Nom</Label>
																<Input
																	id="editMemberName"
																	value={editingMember.name}
																	onChange={(e) =>
																		setEditingMember({ ...editingMember, name: e.target.value })
																	}
																/>
															</div>
															<div className="space-y-2">
																<Label>Couleur</Label>
																<div className="flex gap-2 flex-wrap">
																	{MEMBER_COLORS.map((color) => (
																		<button
																			key={color.value}
																			type="button"
																			onClick={() =>
																				setEditingMember({ ...editingMember, color: color.value })
																			}
																			className={`h-8 w-8 rounded-full transition-all ${
																				editingMember.color === color.value
																					? 'ring-2 ring-offset-2 ring-primary'
																					: 'hover:scale-110'
																			}`}
																			style={{ backgroundColor: color.value }}
																			title={color.name}
																		/>
																	))}
																</div>
															</div>
															<div className="flex justify-end gap-2 pt-4">
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
												className="h-8 w-8 text-destructive hover:text-destructive"
												onClick={() => setDeleteMemberId(member.id)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
								))
							)}
						</div>
					</div>

					{/* Appearance */}
					<div className="glass-card p-6 space-y-6">
						<div className="flex items-center gap-3 pb-2">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
								<Palette className="h-5 w-5" />
							</div>
							<div>
								<h3 className="text-lg font-medium">Apparence</h3>
								<p className="text-sm text-muted-foreground">Personnalisez l&apos;interface</p>
							</div>
						</div>

						{/* Theme Selection */}
						<div className="space-y-3">
							<Label>Thème</Label>
							<div className="grid grid-cols-3 gap-3">
								<button
									type="button"
									onClick={() => setTheme('light')}
									className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors ${
										mounted && theme === 'light'
											? 'border-primary bg-primary/5'
											: 'border-border/60 hover:border-border'
									}`}
								>
									<Sun className="h-5 w-5" />
									<span className="text-sm font-medium">Clair</span>
								</button>
								<button
									type="button"
									onClick={() => setTheme('dark')}
									className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors ${
										mounted && theme === 'dark'
											? 'border-primary bg-primary/5'
											: 'border-border/60 hover:border-border'
									}`}
								>
									<Moon className="h-5 w-5" />
									<span className="text-sm font-medium">Sombre</span>
								</button>
								<button
									type="button"
									onClick={() => setTheme('system')}
									className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors ${
										mounted && theme === 'system'
											? 'border-primary bg-primary/5'
											: 'border-border/60 hover:border-border'
									}`}
								>
									<Globe className="h-5 w-5" />
									<span className="text-sm font-medium">Système</span>
								</button>
							</div>
						</div>

						<Separator />

						{/* Language */}
						<div className="space-y-2">
							<Label htmlFor="language">Langue</Label>
							<Select defaultValue="fr">
								<SelectTrigger id="language" className="w-full sm:w-[200px]">
									<SelectValue placeholder="Sélectionner" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="fr">Français</SelectItem>
									<SelectItem value="en">English</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Data & Privacy */}
					<div className="glass-card p-6 space-y-4">
						<div className="flex items-center gap-3 pb-2">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
								<Database className="h-5 w-5" />
							</div>
							<div>
								<h3 className="text-lg font-medium">Données</h3>
								<p className="text-sm text-muted-foreground">Export et sauvegarde</p>
							</div>
						</div>
						<div className="flex flex-col sm:flex-row gap-3">
							<Button variant="outline" className="flex-1 gap-2">
								<Download className="h-4 w-4" />
								Exporter les données
							</Button>
							<Button variant="outline" className="flex-1 gap-2">
								<Upload className="h-4 w-4" />
								Importer une sauvegarde
							</Button>
						</div>
						<p className="text-xs text-muted-foreground">
							Vos données sont stockées localement sur votre serveur. Effectuez des sauvegardes
							régulières pour éviter toute perte de données.
						</p>
					</div>
				</div>

				{/* Sidebar Settings */}
				<div className="space-y-6">
					{/* Notifications */}
					<div className="glass-card p-6 space-y-4">
						<div className="flex items-center gap-3 pb-2">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
								<Bell className="h-5 w-5" />
							</div>
							<h3 className="text-lg font-medium">Notifications</h3>
						</div>
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium">Alertes budget</p>
								<p className="text-xs text-muted-foreground">Dépassement de budget</p>
							</div>
							<Switch defaultChecked />
						</div>
						<Separator />
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium">Transactions</p>
								<p className="text-xs text-muted-foreground">Nouvelles transactions</p>
							</div>
							<Switch />
						</div>
						<Separator />
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium">Rappels</p>
								<p className="text-xs text-muted-foreground">Échéances de prêts</p>
							</div>
							<Switch defaultChecked />
						</div>
					</div>

					{/* Security */}
					<div className="glass-card p-6 space-y-4">
						<div className="flex items-center gap-3 pb-2">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
								<Shield className="h-5 w-5" />
							</div>
							<h3 className="text-lg font-medium">Sécurité</h3>
						</div>
						<Button variant="outline" className="w-full justify-start gap-2">
							<Key className="h-4 w-4" />
							Changer le mot de passe
						</Button>
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium">2FA</p>
								<p className="text-xs text-muted-foreground">Authentification double facteur</p>
							</div>
							<Switch />
						</div>
						<Separator />
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium">Sessions</p>
								<p className="text-xs text-muted-foreground">Déconnexion automatique</p>
							</div>
							<Switch defaultChecked />
						</div>
					</div>

					{/* App Info */}
					<div className="glass-card p-6 bg-muted/20">
						<div className="text-center">
							<p className="font-medium">Imanisa Finance</p>
							<p className="text-sm text-muted-foreground">Version 2.0.0</p>
							<p className="mt-4 text-xs text-muted-foreground">
								Application open source de gestion de patrimoine personnel
							</p>
							<a
								href="https://github.com/mbourmaud/imanisa-finance"
								target="_blank"
								rel="noopener noreferrer"
								className="mt-2 text-xs text-primary hover:underline inline-block"
							>
								Voir sur GitHub
							</a>
						</div>
					</div>
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
