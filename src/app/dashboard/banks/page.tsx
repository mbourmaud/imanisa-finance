'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
	ChevronDown,
	ChevronRight,
	CreditCard,
	Landmark,
	Plus,
	TrendingUp,
	Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { BankLogo } from '@/components/banks/BankLogo';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard, StatCardGrid, StatCardSkeleton } from '@/components/ui/stat-card';
import { MemberAvatarGroup } from '@/components/members/MemberAvatar';
import { AccountTypeBadge } from '@/components/accounts/AccountCard';
import { MoneyDisplay } from '@/components/common/MoneyDisplay';
import { cn } from '@/lib/utils';

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
		<div className="glass-card p-4 animate-pulse">
			<div className="flex items-center gap-4">
				<div className="h-12 w-12 rounded-xl bg-muted" />
				<div className="flex-1 space-y-2">
					<div className="h-5 w-32 rounded bg-muted" />
					<div className="h-4 w-20 rounded bg-muted" />
				</div>
				<div className="h-6 w-24 rounded bg-muted" />
			</div>
		</div>
	);
}

// =============================================================================
// SECTION HEADER WITH ICON
// =============================================================================

interface SectionHeaderWithIconProps {
	icon: React.ReactNode;
	title: string;
	iconBgClass: string;
	action?: React.ReactNode;
}

function SectionHeaderWithIcon({
	icon,
	title,
	iconBgClass,
	action,
}: SectionHeaderWithIconProps) {
	return (
		<div className="flex items-center justify-between mb-4">
			<div className="flex items-center gap-2">
				<div
					className={cn(
						'flex h-6 w-6 items-center justify-center rounded-md',
						iconBgClass
					)}
				>
					{icon}
				</div>
				<h2 className="text-sm font-semibold text-foreground">{title}</h2>
				<div className="flex-1 ml-3 h-px bg-border/50" />
			</div>
			{action}
		</div>
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

function BankRow({
	bank,
	logo,
	onAddAccount,
	onLogoChange,
	animationDelay = 0,
}: BankRowProps) {
	const hasAccounts = bank.accountCount > 0;

	const baseStyles = cn(
		'glass-card border-l-4 transition-all duration-200 animate-in fade-in-0 slide-in-from-bottom-2'
	);

	const animationStyles = {
		borderLeftColor: bank.color,
		animationDelay: `${animationDelay}ms`,
		animationFillMode: 'backwards' as const,
	};

	const contentMarkup = (
		<>
			{/* Bank header */}
			<div className="flex items-center gap-4 p-4">
				<BankLogo
					bankId={bank.id}
					bankName={bank.name}
					bankColor={bank.color}
					logo={logo}
					size="lg"
					onLogoChange={onLogoChange}
				/>
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<h3
							className={cn(
								'text-lg font-semibold',
								!hasAccounts && 'text-muted-foreground'
							)}
						>
							{bank.name}
						</h3>
						{hasAccounts ? (
							<span className="badge-fun badge-default text-xs">
								{bank.accountCount} compte{bank.accountCount > 1 ? 's' : ''}
							</span>
						) : (
							<span className="text-xs text-muted-foreground italic">
								Aucun compte
							</span>
						)}
					</div>
					{bank.description && (
						<p className="text-sm text-muted-foreground mt-0.5">
							{bank.description}
						</p>
					)}
				</div>
				{hasAccounts ? (
					<>
						<MoneyDisplay
							amount={bank.totalBalance}
							size="lg"
							weight="semibold"
						/>
						<Button
							variant="ghost"
							size="sm"
							className="gap-1 text-muted-foreground hover:text-foreground"
							onClick={(e) => {
								e.stopPropagation();
								onAddAccount();
							}}
						>
							<Plus className="h-4 w-4" />
							<span className="hidden sm:inline">Ajouter</span>
						</Button>
					</>
				) : (
					<Button
						variant="default"
						size="sm"
						className="gap-1"
						onClick={(e) => {
							e.stopPropagation();
							onAddAccount();
						}}
					>
						<Plus className="h-4 w-4" />
						Ajouter un compte
					</Button>
				)}
			</div>

			{/* Accounts list */}
			{bank.accounts.length > 0 && (
				<div className="px-4 pb-4 ml-16 space-y-2">
					{bank.accounts.map((account) => (
						<AccountRowLink key={account.id} account={account} />
					))}
				</div>
			)}
		</>
	);

	// Return different markup based on whether bank row is clickable
	if (!hasAccounts) {
		return (
			<button
				type="button"
				className={cn(
					baseStyles,
					'bg-muted/20 border-2 border-dashed border-border/40 hover:border-border/60 hover:bg-muted/30 cursor-pointer text-left w-full'
				)}
				style={animationStyles}
				onClick={onAddAccount}
			>
				{contentMarkup}
			</button>
		);
	}

	return (
		<div
			className={cn(baseStyles, 'hover:shadow-sm')}
			style={animationStyles}
		>
			{contentMarkup}
		</div>
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
			className="glass-card p-3 flex items-center justify-between group hover:bg-muted/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
		>
			<div className="flex items-center gap-3">
				<div>
					<div className="flex items-center gap-2">
						<p className="font-medium text-sm group-hover:text-foreground">
							{account.name}
						</p>
						<AccountTypeBadge
							type={account.type as 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'LOAN'}
							variant="subtle"
							className="text-[10px]"
						/>
					</div>
					{account.members.length > 0 && (
						<div className="mt-1.5">
							<MemberAvatarGroup
								members={memberData}
								size="xs"
								max={4}
								spacing="normal"
							/>
						</div>
					)}
				</div>
			</div>
			<div className="flex items-center gap-3">
				<MoneyDisplay
					amount={account.balance}
					size="sm"
					weight="semibold"
					autoColor
				/>
				<ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all duration-200" />
			</div>
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
				<Button variant="outline" size="sm" className="gap-1 text-xs">
					<Plus className="h-3.5 w-3.5" />
					Ajouter
					<ChevronDown className="h-3 w-3 opacity-50" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48">
				{banks.map((bank) => (
					<DropdownMenuItem
						key={bank.id}
						onClick={() => onSelectBank(bank)}
						className="gap-2"
					>
						<span
							className="w-2 h-2 rounded-full"
							style={{ backgroundColor: bank.color }}
						/>
						{bank.name}
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

function MemberSelectorChips({
	members,
	selectedIds,
	onToggle,
}: MemberSelectorChipsProps) {
	return (
		<div className="flex flex-wrap gap-2">
			{members.map((member) => (
				<button
					key={member.id}
					type="button"
					onClick={() => onToggle(member.id)}
					className={cn(
						'flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-150 cursor-pointer border',
						selectedIds.includes(member.id)
							? 'bg-primary/10 text-primary border-primary/30'
							: 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground'
					)}
				>
					<span
						className="w-2.5 h-2.5 rounded-full"
						style={{ backgroundColor: member.color || '#6b7280' }}
					/>
					{member.name}
				</button>
			))}
		</div>
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
	const [savingAccount, setSavingAccount] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	// Track bank logos separately so we can update them after upload
	const [bankLogos, setBankLogos] = useState<Record<string, string | null>>({});

	// Handler for when a bank logo is updated
	const handleLogoChange = (bankId: string, newLogoUrl: string) => {
		setBankLogos((prev) => ({ ...prev, [bankId]: newLogoUrl }));
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
		setFormError(null);
		setShowAddAccount(true);
	};

	// Create new account
	const handleCreateAccount = async () => {
		if (!selectedBank || !newAccountName.trim()) return;

		setFormError(null);
		setSavingAccount(true);
		try {
			const response = await fetch('/api/accounts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: newAccountName.trim(),
					description: newAccountDescription.trim() || undefined,
					exportUrl: newAccountExportUrl.trim() || undefined,
					bankId: selectedBank.id,
					type: newAccountType,
					memberIds: newAccountMembers.length > 0 ? newAccountMembers : undefined,
				}),
			});

			if (response.ok) {
				// Refresh data
				const banksRes = await fetch('/api/banks');
				if (banksRes.ok) {
					setData(await banksRes.json());
				}
				setShowAddAccount(false);
			} else {
				const errData = await response.json();
				setFormError(errData.error || 'Erreur lors de la création du compte');
			}
		} catch (err) {
			console.error('Error creating account:', err);
			setFormError('Une erreur est survenue. Veuillez réessayer.');
		} finally {
			setSavingAccount(false);
		}
	};

	// Toggle member selection
	const toggleMember = (memberId: string) => {
		setNewAccountMembers((prev) =>
			prev.includes(memberId)
				? prev.filter((id) => id !== memberId)
				: [...prev, memberId]
		);
	};

	return (
		<div className="max-w-4xl">
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
				<div className="py-6 text-destructive">{error}</div>
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
			<div className="mt-8">
				<SectionHeaderWithIcon
					icon={<Landmark className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
					iconBgClass="bg-blue-100 dark:bg-blue-900/50"
					title="Comptes bancaires"
					action={
						data?.bankAccounts && (
							<AddBankDropdown
								banks={data.bankAccounts}
								onSelectBank={handleAddAccountClick}
							/>
						)
					}
				/>

				{loading ? (
					<div className="space-y-3">
						<BankRowSkeleton />
						<BankRowSkeleton />
						<BankRowSkeleton />
					</div>
				) : (
					<div className="space-y-3">
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
					</div>
				)}
			</div>

			{/* Investments section */}
			<div className="mt-8">
				<SectionHeaderWithIcon
					icon={<TrendingUp className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />}
					iconBgClass="bg-purple-100 dark:bg-purple-900/50"
					title="Investissements"
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
					<div className="space-y-3">
						<BankRowSkeleton />
						<BankRowSkeleton />
					</div>
				) : (
					<div className="space-y-3">
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
					</div>
				)}
			</div>

			{/* Add Account Dialog */}
			<Dialog open={showAddAccount} onOpenChange={setShowAddAccount}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Nouveau compte</DialogTitle>
						<DialogDescription>{selectedBank?.name}</DialogDescription>
					</DialogHeader>

					<div className="space-y-5">
						{/* Error message */}
						{formError && (
							<div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3">
								<p className="text-sm text-destructive">{formError}</p>
							</div>
						)}

						{/* Account name */}
						<div className="space-y-2">
							<Label
								htmlFor="accountName"
								className="text-sm font-medium text-muted-foreground"
							>
								Nom du compte
							</Label>
							<Input
								id="accountName"
								placeholder="ex: Compte Joint, Livret A..."
								value={newAccountName}
								onChange={(e) => setNewAccountName(e.target.value)}
								className="h-10"
							/>
						</div>

						{/* Description (optional) */}
						<div className="space-y-2">
							<Label
								htmlFor="accountDescription"
								className="text-sm font-medium text-muted-foreground"
							>
								Description
								<span className="ml-1 text-xs font-normal">(optionnel)</span>
							</Label>
							<Textarea
								id="accountDescription"
								placeholder="Notes ou contexte sur ce compte..."
								value={newAccountDescription}
								onChange={(e) => setNewAccountDescription(e.target.value)}
								className="min-h-[80px] resize-none"
							/>
						</div>

						{/* Account type */}
						<div className="space-y-2">
							<Label
								htmlFor="accountType"
								className="text-sm font-medium text-muted-foreground"
							>
								Type de compte
							</Label>
							<Select value={newAccountType} onValueChange={setNewAccountType}>
								<SelectTrigger id="accountType" className="h-10">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="CHECKING">Compte courant</SelectItem>
									<SelectItem value="SAVINGS">Épargne</SelectItem>
									<SelectItem value="INVESTMENT">Investissement</SelectItem>
									<SelectItem value="LOAN">Prêt</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Export URL (optional) */}
						<div className="space-y-2">
							<Label
								htmlFor="accountExportUrl"
								className="text-sm font-medium text-muted-foreground"
							>
								Lien d'export
								<span className="ml-1 text-xs font-normal">(optionnel)</span>
							</Label>
							<Input
								id="accountExportUrl"
								type="url"
								placeholder="https://..."
								value={newAccountExportUrl}
								onChange={(e) => setNewAccountExportUrl(e.target.value)}
								className="h-10"
							/>
							<p className="text-xs text-muted-foreground">
								URL vers l'espace client pour exporter les relevés
							</p>
						</div>

						{/* Member selection */}
						<div className="space-y-3">
							<Label className="text-sm font-medium text-muted-foreground">
								Titulaires
							</Label>
							<MemberSelectorChips
								members={members}
								selectedIds={newAccountMembers}
								onToggle={toggleMember}
							/>
						</div>
					</div>

					<DialogFooter className="pt-4">
						<Button
							variant="outline"
							onClick={() => setShowAddAccount(false)}
							disabled={savingAccount}
						>
							Annuler
						</Button>
						<Button
							onClick={handleCreateAccount}
							disabled={savingAccount || !newAccountName.trim()}
						>
							{savingAccount ? 'Création...' : 'Créer le compte'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
