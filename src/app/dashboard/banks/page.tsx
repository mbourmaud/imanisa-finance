'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
	Button,
	ChevronDown,
	ChevronRight,
	ColorDot,
	ContentSkeleton,
	CreditCard,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	Flex,
	GlassCard,
	IconBox,
	Input,
	Label,
	Landmark,
	PageHeader,
	Plus,
	SectionHeader,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	StatCard,
	StatCardGrid,
	StatCardSkeleton,
	Textarea,
	TrendingUp,
	Wallet,
} from '@/components';
import { AccountTypeBadge } from '@/components/accounts/AccountCard';
import { BankLogo } from '@/components/banks/BankLogo';
import { MoneyDisplay } from '@/components/common/MoneyDisplay';
import { MemberAvatarGroup } from '@/components/members/MemberAvatar';
import { useCreateAccountMutation } from '@/features/accounts';

// =============================================================================
// TYPES
// =============================================================================

interface AccountMember {
	id: string;
	name: string;
	ownerShare: number;
	color?: string | null;
}

interface Account {
	id: string;
	name: string;
	balance: number;
	type: string;
	members: AccountMember[];
}

interface Bank {
	id: string;
	name: string;
	logo: string | null;
	color: string;
	description: string | null;
	type: 'BANK' | 'INVESTMENT';
	parserKey: string;
	accountCount: number;
	totalBalance: number;
	accounts: Account[];
}

interface Member {
	id: string;
	name: string;
	color: string | null;
}

interface BanksSummary {
	totalBanksUsed: number;
	totalBanksAvailable: number;
	totalAccounts: number;
	totalBalance: number;
}

interface BanksResponse {
	banks: Bank[];
	bankAccounts: Bank[];
	investmentAccounts: Bank[];
	usedBanks: Bank[];
	summary: BanksSummary;
}

// =============================================================================
// SKELETONS
// =============================================================================

function BankRowSkeleton() {
	return (
		<GlassCard padding="sm">
			<Flex direction="row" gap="md">
				<ContentSkeleton variant="icon" size="md" />
				<Flex direction="col" gap="sm" style={{ flex: 1 }}>
					<ContentSkeleton variant="title" size="sm" />
					<ContentSkeleton variant="text" size="sm" />
				</Flex>
				<ContentSkeleton variant="text" size="lg" />
			</Flex>
		</GlassCard>
	);
}

// =============================================================================
// BANK ROW COMPONENT
// =============================================================================

interface BankRowProps {
	bank: Bank;
	logo: string | null;
	onAddAccount: () => void;
	onLogoChange: (url: string) => void;
	animationDelay?: number;
}

function BankRow({ bank, logo, onAddAccount, onLogoChange, animationDelay = 0 }: BankRowProps) {
	const hasAccounts = bank.accountCount > 0;

	const animationStyles = {
		borderLeftColor: bank.color,
		animationDelay: `${animationDelay}ms`,
		animationFillMode: 'backwards' as const,
	};

	const contentMarkup = (
		<>
			{/* Bank header */}
			<Flex direction="row" gap="md" style={{ padding: '0.75rem' }}>
				<BankLogo
					bankId={bank.id}
					bankName={bank.name}
					bankColor={bank.color}
					logo={logo}
					size="lg"
					onLogoChange={onLogoChange}
				/>
				<Flex direction="col" gap="xs" style={{ flex: 1, minWidth: 0 }}>
					<Flex direction="row" gap="sm">
						<h3
							className={`text-lg font-bold tracking-tight ${!hasAccounts ? 'text-muted-foreground' : ''}`}
						>
							{bank.name}
						</h3>
						{hasAccounts ? (
							<span
								className="text-xs"
								style={{
									padding: '0.125rem 0.5rem',
									borderRadius: '9999px',
									backgroundColor: 'hsl(var(--muted))',
									color: 'hsl(var(--muted-foreground))',
								}}
							>
								{bank.accountCount} compte{bank.accountCount > 1 ? 's' : ''}
							</span>
						) : (
							<span className="text-xs text-muted-foreground italic">
								Aucun compte
							</span>
						)}
					</Flex>
					{bank.description && (
						<p className="text-sm text-muted-foreground" style={{ marginTop: '0.125rem' }}>
							{bank.description}
						</p>
					)}
				</Flex>
				{hasAccounts ? (
					<>
						<MoneyDisplay amount={bank.totalBalance} size="lg" weight="semibold" />
						<Button
							variant="ghost"
							size="sm"
							iconLeft={<Plus style={{ height: '1rem', width: '1rem' }} />}
							onClick={(e) => {
								e.stopPropagation();
								onAddAccount();
							}}
						>
							Ajouter
						</Button>
					</>
				) : (
					<Button
						variant="default"
						size="sm"
						iconLeft={<Plus style={{ height: '1rem', width: '1rem' }} />}
						onClick={(e) => {
							e.stopPropagation();
							onAddAccount();
						}}
					>
						Ajouter un compte
					</Button>
				)}
			</Flex>

			{/* Accounts list */}
			{bank.accounts.length > 0 && (
				<Flex
					direction="col"
					gap="sm"
					style={{
						paddingLeft: '1rem',
						paddingRight: '1rem',
						paddingBottom: '1rem',
						marginLeft: '4rem',
					}}
				>
					{bank.accounts.map((account) => (
						<AccountRowLink key={account.id} account={account} />
					))}
				</Flex>
			)}
		</>
	);

	// Return different markup based on whether bank row is clickable
	if (!hasAccounts) {
		return (
			<button
				type="button"
				onClick={onAddAccount}
				style={{
					...animationStyles,
					padding: 0,
					borderLeft: `4px solid ${bank.color}`,
					backgroundColor: 'hsl(var(--muted) / 0.2)',
					border: '2px dashed hsl(var(--border) / 0.4)',
					cursor: 'pointer',
					textAlign: 'left',
					width: '100%',
					borderRadius: '0.75rem',
				}}
			>
				{contentMarkup}
			</button>
		);
	}

	return (
		<GlassCard
			style={{
				...animationStyles,
				padding: 0,
				borderLeft: `4px solid ${bank.color}`,
				transition: 'all 0.2s',
			}}
		>
			{contentMarkup}
		</GlassCard>
	);
}

// =============================================================================
// ACCOUNT ROW LINK COMPONENT
// =============================================================================

interface AccountRowLinkProps {
	account: Account;
}

function AccountRowLink({ account }: AccountRowLinkProps) {
	// Map member data for MemberAvatarGroup
	const memberData = account.members.map((m) => ({
		id: m.id,
		name: m.name,
		color: m.color || undefined,
	}));

	return (
		<Link
			href={`/dashboard/accounts/${account.id}`}
			style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				cursor: 'pointer',
				transition: 'all 0.2s',
				padding: '0.5rem',
				borderRadius: '0.75rem',
				backgroundColor: 'hsl(var(--card) / 0.5)',
				backdropFilter: 'blur(8px)',
			}}
		>
			<Flex direction="row" gap="sm">
				<Flex direction="col" gap="xs">
					<Flex direction="row" gap="sm">
						<span className="text-sm font-medium">
							{account.name}
						</span>
						<AccountTypeBadge
							type={account.type as 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'LOAN'}
							variant="subtle"
							style={{ fontSize: '10px' }}
						/>
					</Flex>
					{account.members.length > 0 && (
						<div style={{ marginTop: '0.375rem' }}>
							<MemberAvatarGroup members={memberData} size="xs" max={4} spacing="normal" />
						</div>
					)}
				</Flex>
			</Flex>
			<Flex direction="row" gap="sm">
				<MoneyDisplay amount={account.balance} size="sm" weight="semibold" autoColor />
				<ChevronRight
					style={{
						height: '1rem',
						width: '1rem',
						color: 'hsl(var(--muted-foreground) / 0.4)',
						transition: 'all 0.2s',
					}}
				/>
			</Flex>
		</Link>
	);
}

// =============================================================================
// ADD BANK DROPDOWN
// =============================================================================

interface AddBankDropdownProps {
	banks: Bank[];
	onSelectBank: (bank: Bank) => void;
}

function AddBankDropdown({ banks, onSelectBank }: AddBankDropdownProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm">
					<Plus style={{ height: '0.875rem', width: '0.875rem' }} />
					<span className="text-xs">Ajouter</span>
					<ChevronDown style={{ height: '0.75rem', width: '0.75rem', opacity: 0.5 }} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" style={{ width: '12rem' }}>
				{banks.map((bank) => (
					<DropdownMenuItem key={bank.id} onClick={() => onSelectBank(bank)}>
						<Flex direction="row" gap="sm">
							<ColorDot color={bank.color} size="sm" />
							<span>{bank.name}</span>
						</Flex>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

// =============================================================================
// MEMBER SELECTOR FOR DIALOG
// =============================================================================

interface MemberSelectorChipsProps {
	members: Member[];
	selectedIds: string[];
	onToggle: (id: string) => void;
}

function MemberSelectorChips({ members, selectedIds, onToggle }: MemberSelectorChipsProps) {
	return (
		<Flex direction="row" gap="sm" wrap="wrap">
			{members.map((member) => {
				const isSelected = selectedIds.includes(member.id);
				return (
					<Button
						key={member.id}
						variant="ghost"
						size="sm"
						onClick={() => onToggle(member.id)}
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '0.5rem',
							padding: '0.5rem 0.75rem',
							borderRadius: '9999px',
							fontSize: '0.875rem',
							fontWeight: 500,
							transition: 'all 0.15s',
							cursor: 'pointer',
							border: '1px solid',
							backgroundColor: isSelected ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--muted) / 0.5)',
							color: isSelected ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
							borderColor: isSelected ? 'hsl(var(--primary) / 0.3)' : 'transparent',
						}}
					>
						<ColorDot color={member.color || '#6b7280'} size="md" />
						<span>{member.name}</span>
					</Button>
				);
			})}
		</Flex>
	);
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function BanksPage() {
	const [data, setData] = useState<BanksResponse | null>(null);
	const [members, setMembers] = useState<Member[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Add account dialog state
	const [showAddAccount, setShowAddAccount] = useState(false);
	const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
	const [newAccountName, setNewAccountName] = useState('');
	const [newAccountDescription, setNewAccountDescription] = useState('');
	const [newAccountExportUrl, setNewAccountExportUrl] = useState('');
	const [newAccountType, setNewAccountType] = useState('CHECKING');
	const [newAccountMembers, setNewAccountMembers] = useState<string[]>([]);

	// Track bank logos separately so we can update them after upload
	const [bankLogos, setBankLogos] = useState<Record<string, string | null>>({});

	// Create account mutation
	const createAccountMutation = useCreateAccountMutation();

	// Handler for when a bank logo is updated
	const handleLogoChange = (bankId: string, newLogoUrl: string) => {
		setBankLogos((prev) => ({ ...prev, [bankId]: newLogoUrl }));
	};

	// Refresh data function
	const refreshData = async () => {
		const banksRes = await fetch('/api/banks');
		if (banksRes.ok) {
			setData(await banksRes.json());
		}
	};

	useEffect(() => {
		async function fetchData() {
			try {
				const [banksRes, membersRes] = await Promise.all([
					fetch('/api/banks'),
					fetch('/api/members'),
				]);

				if (!banksRes.ok) throw new Error('Failed to fetch banks');
				if (!membersRes.ok) throw new Error('Failed to fetch members');

				const banksData = await banksRes.json();
				const membersData = await membersRes.json();

				setData(banksData);
				setMembers(membersData.members || []);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'An error occurred');
			} finally {
				setLoading(false);
			}
		}

		fetchData();
	}, []);

	// Open add account dialog for a specific bank
	const handleAddAccountClick = (bank: Bank) => {
		setSelectedBank(bank);
		setNewAccountName('');
		setNewAccountDescription('');
		setNewAccountExportUrl('');
		setNewAccountType('CHECKING');
		setNewAccountMembers([]);
		createAccountMutation.reset();
		setShowAddAccount(true);
	};

	// Create new account using mutation
	const handleCreateAccount = async () => {
		if (!selectedBank || !newAccountName.trim()) return;

		try {
			await createAccountMutation.mutateAsync({
				name: newAccountName.trim(),
				description: newAccountDescription.trim() || undefined,
				exportUrl: newAccountExportUrl.trim() || undefined,
				bankId: selectedBank.id,
				type: newAccountType as 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'LOAN',
				memberIds: newAccountMembers.length > 0 ? newAccountMembers : undefined,
			});

			// Refresh data to show new account
			await refreshData();
			setShowAddAccount(false);
			toast.success('Compte créé avec succès');
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Erreur lors de la création du compte');
		}
	};

	// Toggle member selection
	const toggleMember = (memberId: string) => {
		setNewAccountMembers((prev) =>
			prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId],
		);
	};

	return (
		<div style={{ maxWidth: '56rem' }}>
			{/* Header */}
			<PageHeader
				title="Banques"
				description="Gérez vos établissements et importez vos données"
				size="sm"
			/>

			{/* Stats Cards */}
			{loading ? (
				<StatCardGrid columns={3}>
					<StatCardSkeleton variant="gold" />
					<StatCardSkeleton variant="teal" />
					<StatCardSkeleton variant="mint" />
				</StatCardGrid>
			) : error ? (
				<Flex direction="col" gap="lg" style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
					<span className="text-destructive">{error}</span>
				</Flex>
			) : (
				<StatCardGrid columns={3}>
					<StatCard
						variant="gold"
						icon={Landmark}
						label="Banques"
						value={data?.summary.totalBanksUsed ?? 0}
						description={`/ ${data?.summary.totalBanksAvailable ?? 0}`}
					/>
					<StatCard
						variant="teal"
						icon={CreditCard}
						label="Comptes actifs"
						value={data?.summary.totalAccounts ?? 0}
					/>
					<StatCard
						variant="mint"
						icon={Wallet}
						label="Solde total"
						value={new Intl.NumberFormat('fr-FR', {
							style: 'currency',
							currency: 'EUR',
						}).format(data?.summary.totalBalance ?? 0)}
					/>
				</StatCardGrid>
			)}

			{/* Bank accounts section */}
			<Flex direction="col" gap="sm" style={{ marginTop: '2rem' }}>
				<SectionHeader
					title="Comptes bancaires"
					size="sm"
					icon={
						<IconBox
							icon={Landmark}
							size="sm"
							variant="primary"
							rounded="md"
						/>
					}
					showLine
					action={
						data?.bankAccounts && (
							<AddBankDropdown banks={data.bankAccounts} onSelectBank={handleAddAccountClick} />
						)
					}
				/>

				{loading ? (
					<Flex direction="col" gap="sm">
						<BankRowSkeleton />
						<BankRowSkeleton />
						<BankRowSkeleton />
					</Flex>
				) : (
					<Flex direction="col" gap="sm">
						{data?.bankAccounts.map((bank, index) => (
							<BankRow
								key={bank.id}
								bank={bank}
								logo={bankLogos[bank.id] ?? bank.logo}
								onAddAccount={() => handleAddAccountClick(bank)}
								onLogoChange={(url) => handleLogoChange(bank.id, url)}
								animationDelay={index * 50}
							/>
						))}
					</Flex>
				)}
			</Flex>

			{/* Investments section */}
			<Flex direction="col" gap="sm" style={{ marginTop: '2rem' }}>
				<SectionHeader
					title="Investissements"
					size="sm"
					icon={
						<IconBox
							icon={TrendingUp}
							size="sm"
							variant="custom"
							bgColor="hsl(270 60% 95%)"
							iconColor="hsl(270 60% 50%)"
							rounded="md"
						/>
					}
					showLine
					action={
						data?.investmentAccounts && (
							<AddBankDropdown
								banks={data.investmentAccounts}
								onSelectBank={handleAddAccountClick}
							/>
						)
					}
				/>

				{loading ? (
					<Flex direction="col" gap="sm">
						<BankRowSkeleton />
						<BankRowSkeleton />
					</Flex>
				) : (
					<Flex direction="col" gap="sm">
						{data?.investmentAccounts.map((bank, index) => (
							<BankRow
								key={bank.id}
								bank={bank}
								logo={bankLogos[bank.id] ?? bank.logo}
								onAddAccount={() => handleAddAccountClick(bank)}
								onLogoChange={(url) => handleLogoChange(bank.id, url)}
								animationDelay={index * 50}
							/>
						))}
					</Flex>
				)}
			</Flex>

			{/* Add Account Dialog */}
			<Dialog open={showAddAccount} onOpenChange={setShowAddAccount}>
				<DialogContent style={{ maxWidth: '28rem' }}>
					<DialogHeader>
						<DialogTitle>Nouveau compte</DialogTitle>
						<DialogDescription>{selectedBank?.name}</DialogDescription>
					</DialogHeader>

					<Flex direction="col" gap="lg">
						{/* Error message */}
						{createAccountMutation.error && (
							<div
								style={{
									borderRadius: '0.375rem',
									padding: '0.75rem',
									backgroundColor: 'hsl(var(--destructive) / 0.1)',
									border: '1px solid hsl(var(--destructive) / 0.2)',
								}}
							>
								<span className="text-sm text-destructive">
									{createAccountMutation.error.message}
								</span>
							</div>
						)}

						{/* Account name */}
						<Flex direction="col" gap="sm">
							<Label
								htmlFor="accountName"
								style={{
									fontSize: '0.875rem',
									fontWeight: 500,
									color: 'hsl(var(--muted-foreground))',
								}}
							>
								Nom du compte
							</Label>
							<Input
								id="accountName"
								placeholder="ex: Compte Joint, Livret A..."
								value={newAccountName}
								onChange={(e) => setNewAccountName(e.target.value)}
								style={{ height: '2.5rem' }}
							/>
						</Flex>

						{/* Description (optional) */}
						<Flex direction="col" gap="sm">
							<Label
								htmlFor="accountDescription"
								style={{
									fontSize: '0.875rem',
									fontWeight: 500,
									color: 'hsl(var(--muted-foreground))',
								}}
							>
								Description
								<span className="text-xs font-normal" style={{ marginLeft: '0.25rem' }}>
									(optionnel)
								</span>
							</Label>
							<Textarea
								id="accountDescription"
								placeholder="Notes ou contexte sur ce compte..."
								value={newAccountDescription}
								onChange={(e) => setNewAccountDescription(e.target.value)}
								style={{ minHeight: '80px', resize: 'none' }}
							/>
						</Flex>

						{/* Account type */}
						<Flex direction="col" gap="sm">
							<Label
								htmlFor="accountType"
								style={{
									fontSize: '0.875rem',
									fontWeight: 500,
									color: 'hsl(var(--muted-foreground))',
								}}
							>
								Type de compte
							</Label>
							<Select value={newAccountType} onValueChange={setNewAccountType}>
								<SelectTrigger id="accountType" style={{ height: '2.5rem' }}>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="CHECKING">Compte courant</SelectItem>
									<SelectItem value="SAVINGS">Épargne</SelectItem>
									<SelectItem value="INVESTMENT">Investissement</SelectItem>
									<SelectItem value="LOAN">Prêt</SelectItem>
								</SelectContent>
							</Select>
						</Flex>

						{/* Export URL (optional) */}
						<Flex direction="col" gap="sm">
							<Label
								htmlFor="accountExportUrl"
								style={{
									fontSize: '0.875rem',
									fontWeight: 500,
									color: 'hsl(var(--muted-foreground))',
								}}
							>
								Lien d'export
								<span className="text-xs font-normal" style={{ marginLeft: '0.25rem' }}>
									(optionnel)
								</span>
							</Label>
							<Input
								id="accountExportUrl"
								type="url"
								placeholder="https://..."
								value={newAccountExportUrl}
								onChange={(e) => setNewAccountExportUrl(e.target.value)}
								style={{ height: '2.5rem' }}
							/>
							<span className="text-xs text-muted-foreground">
								URL vers l'espace client pour exporter les relevés
							</span>
						</Flex>

						{/* Member selection */}
						<Flex direction="col" gap="sm">
							<Label
								style={{
									fontSize: '0.875rem',
									fontWeight: 500,
									color: 'hsl(var(--muted-foreground))',
								}}
							>
								Titulaires
							</Label>
							<MemberSelectorChips
								members={members}
								selectedIds={newAccountMembers}
								onToggle={toggleMember}
							/>
						</Flex>
					</Flex>

					<DialogFooter style={{ paddingTop: '1rem' }}>
						<Button
							variant="outline"
							onClick={() => setShowAddAccount(false)}
							disabled={createAccountMutation.isPending}
						>
							Annuler
						</Button>
						<Button
							onClick={handleCreateAccount}
							disabled={createAccountMutation.isPending || !newAccountName.trim()}
						>
							{createAccountMutation.isPending ? 'Création...' : 'Créer le compte'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
