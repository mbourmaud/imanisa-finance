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
	Flex,
	GlassCard,
	Globe,
	Grid,
	Heading,
	HStack,
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
	Text,
	Trash2,
	Upload,
	User,
	Users,
	VStack,
} from '@/components';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
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
		<HStack
			justify="between"
			align="center"
			p="md"
			style={{ borderRadius: '0.75rem', backgroundColor: 'hsl(var(--muted) / 0.3)' }}
		>
			<HStack gap="md" align="center">
				<Skeleton style={{ height: '2.5rem', width: '2.5rem', borderRadius: '0.5rem' }} />
				<VStack gap="xs">
					<Skeleton style={{ height: '1.25rem', width: '6rem' }} />
					<Skeleton style={{ height: '1rem', width: '4rem' }} />
				</VStack>
			</HStack>
			<Skeleton style={{ height: '2rem', width: '2rem' }} />
		</HStack>
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
		<VStack gap="xl">
			{/* Header */}
			<PageHeader title="Paramètres" description="Configurez votre application" />

			<Grid cols={1} colsLg={3} gap="lg">
				{/* Main Settings Column */}
				<VStack gap="lg" style={{ gridColumn: 'span 2' }}>
					{/* Profile */}
					<GlassCard padding="lg">
						<VStack gap="md">
							<HStack gap="md" align="center" style={{ paddingBottom: '0.5rem' }}>
								<Flex
									align="center"
									justify="center"
									style={{
										borderRadius: '0.75rem',
										height: '2.5rem',
										width: '2.5rem',
										backgroundColor: 'hsl(var(--primary) / 0.1)',
										color: 'hsl(var(--primary))',
									}}
								>
									<User style={{ height: '1.25rem', width: '1.25rem' }} />
								</Flex>
								<VStack gap="none">
									<Heading level={3} size="lg" weight="medium">
										Profil
									</Heading>
									<Text size="sm" color="muted">
										Vos informations personnelles
									</Text>
								</VStack>
							</HStack>
							<Grid cols={1} colsSm={2} gap="md">
								<VStack gap="xs">
									<Label htmlFor="name">Nom</Label>
									<Input id="name" placeholder="Votre nom" defaultValue="Utilisateur" />
								</VStack>
								<VStack gap="xs">
									<Label htmlFor="email">Email</Label>
									<Input id="email" type="email" placeholder="votre@email.com" />
								</VStack>
							</Grid>
							<VStack gap="xs">
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
							</VStack>
						</VStack>
					</GlassCard>

					{/* Members (Household) */}
					<GlassCard padding="lg">
						<VStack gap="md">
							<HStack justify="between" align="center" style={{ paddingBottom: '0.5rem' }}>
								<HStack gap="md" align="center">
									<Flex
										align="center"
										justify="center"
										style={{
											borderRadius: '0.75rem',
											height: '2.5rem',
											width: '2.5rem',
											backgroundColor: 'hsl(var(--primary) / 0.1)',
											color: 'hsl(var(--primary))',
										}}
									>
										<Users style={{ height: '1.25rem', width: '1.25rem' }} />
									</Flex>
									<VStack gap="none">
										<Heading level={3} size="lg" weight="medium">
											Membres du foyer
										</Heading>
										<Text size="sm" color="muted">
											Gérez les membres associés aux comptes
										</Text>
									</VStack>
								</HStack>
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
										<VStack gap="md" style={{ paddingTop: '1rem' }}>
											<VStack gap="xs">
												<Label htmlFor="memberName">Nom</Label>
												<Input
													id="memberName"
													placeholder="Prénom"
													value={newMemberName}
													onChange={(e) => setNewMemberName(e.target.value)}
												/>
											</VStack>
											<VStack gap="xs">
												<Label>Couleur</Label>
												<HStack gap="sm" style={{ flexWrap: 'wrap' }}>
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
												</HStack>
											</VStack>
											<HStack justify="end" gap="sm" style={{ paddingTop: '1rem' }}>
												<Button variant="outline" onClick={() => setShowAddMember(false)}>
													Annuler
												</Button>
												<Button
													onClick={handleAddMember}
													disabled={savingMember || !newMemberName.trim()}
												>
													{savingMember ? 'Ajout...' : 'Ajouter'}
												</Button>
											</HStack>
										</VStack>
									</DialogContent>
								</Dialog>
							</HStack>
							<VStack gap="xs">
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
										<HStack
											key={member.id}
											justify="between"
											align="center"
											p="md"
											style={{
												borderRadius: '0.75rem',
												backgroundColor: 'hsl(var(--background) / 0.5)',
												transition: 'background-color 0.2s',
											}}
										>
											<HStack gap="md" align="center">
												<MemberAvatar
													member={{
														id: member.id,
														name: member.name,
														color: member.color,
														avatarUrl: member.avatarUrl,
													}}
													size="md"
												/>
												<VStack gap="none">
													<Text weight="medium">{member.name}</Text>
													<Text size="xs" color="muted">
														{member.accountMembers.length} compte
														{member.accountMembers.length !== 1 ? 's' : ''}
													</Text>
												</VStack>
											</HStack>
											<HStack gap="sm" align="center">
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
															<VStack gap="md" style={{ paddingTop: '1rem' }}>
																<VStack gap="xs">
																	<Label htmlFor="editMemberName">Nom</Label>
																	<Input
																		id="editMemberName"
																		value={editingMember.name}
																		onChange={(e) =>
																			setEditingMember({ ...editingMember, name: e.target.value })
																		}
																	/>
																</VStack>
																<VStack gap="xs">
																	<Label>Couleur</Label>
																	<HStack gap="sm" style={{ flexWrap: 'wrap' }}>
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
																	</HStack>
																</VStack>
																<HStack justify="end" gap="sm" style={{ paddingTop: '1rem' }}>
																	<Button variant="outline" onClick={() => setEditingMember(null)}>
																		Annuler
																	</Button>
																	<Button onClick={handleUpdateMember} disabled={savingMember}>
																		{savingMember ? 'Sauvegarde...' : 'Sauvegarder'}
																	</Button>
																</HStack>
															</VStack>
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
											</HStack>
										</HStack>
									))
								)}
							</VStack>
						</VStack>
					</GlassCard>

					{/* Appearance */}
					<GlassCard padding="lg">
						<VStack gap="lg">
							<HStack gap="md" align="center" style={{ paddingBottom: '0.5rem' }}>
								<Flex
									align="center"
									justify="center"
									style={{
										borderRadius: '0.75rem',
										height: '2.5rem',
										width: '2.5rem',
										backgroundColor: 'hsl(var(--primary) / 0.1)',
										color: 'hsl(var(--primary))',
									}}
								>
									<Palette style={{ height: '1.25rem', width: '1.25rem' }} />
								</Flex>
								<VStack gap="none">
									<Heading level={3} size="lg" weight="medium">
										Apparence
									</Heading>
									<Text size="sm" color="muted">
										Personnalisez l&apos;interface
									</Text>
								</VStack>
							</HStack>

							{/* Theme Selection */}
							<VStack gap="sm">
								<Label>Thème</Label>
								<Grid cols={3} gap="sm">
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
										<Text size="sm" weight="medium">
											Clair
										</Text>
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
										<Text size="sm" weight="medium">
											Sombre
										</Text>
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
										<Text size="sm" weight="medium">
											Système
										</Text>
									</button>
								</Grid>
							</VStack>

							<Separator />

							{/* Language */}
							<VStack gap="xs">
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
							</VStack>
						</VStack>
					</GlassCard>

					{/* Data & Privacy */}
					<GlassCard padding="lg">
						<VStack gap="md">
							<HStack gap="md" align="center" style={{ paddingBottom: '0.5rem' }}>
								<Flex
									align="center"
									justify="center"
									style={{
										borderRadius: '0.75rem',
										height: '2.5rem',
										width: '2.5rem',
										backgroundColor: 'hsl(var(--primary) / 0.1)',
										color: 'hsl(var(--primary))',
									}}
								>
									<Database style={{ height: '1.25rem', width: '1.25rem' }} />
								</Flex>
								<VStack gap="none">
									<Heading level={3} size="lg" weight="medium">
										Données
									</Heading>
									<Text size="sm" color="muted">
										Export et sauvegarde
									</Text>
								</VStack>
							</HStack>
							<Flex gap="sm" style={{ flexDirection: 'column' }}>
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
							</Flex>
							<Text size="xs" color="muted">
								Vos données sont stockées localement sur votre serveur. Effectuez des sauvegardes
								régulières pour éviter toute perte de données.
							</Text>
						</VStack>
					</GlassCard>
				</VStack>

				{/* Sidebar Settings */}
				<VStack gap="lg">
					{/* Notifications */}
					<GlassCard padding="lg">
						<VStack gap="md">
							<HStack gap="md" align="center" style={{ paddingBottom: '0.5rem' }}>
								<Flex
									align="center"
									justify="center"
									style={{
										borderRadius: '0.75rem',
										height: '2.5rem',
										width: '2.5rem',
										backgroundColor: 'hsl(var(--primary) / 0.1)',
										color: 'hsl(var(--primary))',
									}}
								>
									<Bell style={{ height: '1.25rem', width: '1.25rem' }} />
								</Flex>
								<Heading level={3} size="lg" weight="medium">
									Notifications
								</Heading>
							</HStack>
							<HStack justify="between" align="center">
								<VStack gap="none">
									<Text weight="medium">Alertes budget</Text>
									<Text size="xs" color="muted">
										Dépassement de budget
									</Text>
								</VStack>
								<Switch defaultChecked />
							</HStack>
							<Separator />
							<HStack justify="between" align="center">
								<VStack gap="none">
									<Text weight="medium">Transactions</Text>
									<Text size="xs" color="muted">
										Nouvelles transactions
									</Text>
								</VStack>
								<Switch />
							</HStack>
							<Separator />
							<HStack justify="between" align="center">
								<VStack gap="none">
									<Text weight="medium">Rappels</Text>
									<Text size="xs" color="muted">
										Échéances de prêts
									</Text>
								</VStack>
								<Switch defaultChecked />
							</HStack>
						</VStack>
					</GlassCard>

					{/* Security */}
					<GlassCard padding="lg">
						<VStack gap="md">
							<HStack gap="md" align="center" style={{ paddingBottom: '0.5rem' }}>
								<Flex
									align="center"
									justify="center"
									style={{
										borderRadius: '0.75rem',
										height: '2.5rem',
										width: '2.5rem',
										backgroundColor: 'hsl(var(--primary) / 0.1)',
										color: 'hsl(var(--primary))',
									}}
								>
									<Shield style={{ height: '1.25rem', width: '1.25rem' }} />
								</Flex>
								<Heading level={3} size="lg" weight="medium">
									Sécurité
								</Heading>
							</HStack>
							<Button
								variant="outline"
								style={{ width: '100%', justifyContent: 'flex-start' }}
								iconLeft={<Key style={{ height: '1rem', width: '1rem' }} />}
							>
								Changer le mot de passe
							</Button>
							<HStack justify="between" align="center">
								<VStack gap="none">
									<Text weight="medium">2FA</Text>
									<Text size="xs" color="muted">
										Authentification double facteur
									</Text>
								</VStack>
								<Switch />
							</HStack>
							<Separator />
							<HStack justify="between" align="center">
								<VStack gap="none">
									<Text weight="medium">Sessions</Text>
									<Text size="xs" color="muted">
										Déconnexion automatique
									</Text>
								</VStack>
								<Switch defaultChecked />
							</HStack>
						</VStack>
					</GlassCard>

					{/* App Info */}
					<GlassCard padding="lg" style={{ backgroundColor: 'hsl(var(--muted) / 0.2)' }}>
						<Flex direction="col" align="center" style={{ textAlign: 'center' }}>
							<Text weight="medium">Imanisa Finance</Text>
							<Text size="sm" color="muted">
								Version 2.0.0
							</Text>
							<Text size="xs" color="muted" style={{ marginTop: '1rem' }}>
								Application open source de gestion de patrimoine personnel
							</Text>
							<a
								href="https://github.com/mbourmaud/imanisa-finance"
								target="_blank"
								rel="noopener noreferrer"
								style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'hsl(var(--primary))' }}
							>
								Voir sur GitHub
							</a>
						</Flex>
					</GlassCard>
				</VStack>
			</Grid>

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
		</VStack>
	);
}
