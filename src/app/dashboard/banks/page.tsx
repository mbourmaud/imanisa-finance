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
} from '@/components';
import { Button } from '@/components';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components';
import { Input } from '@/components';
import { Label } from '@/components';
import { Textarea } from '@/components';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components';
import { BankLogo } from '@/components/banks/BankLogo';
import { PageHeader } from '@/components';
import { StatCard, StatCardGrid, StatCardSkeleton } from '@/components';
import { MemberAvatarGroup } from '@/components/members/MemberAvatar';
import { AccountTypeBadge } from '@/components/accounts/AccountCard';
import { MoneyDisplay } from '@/components/common/MoneyDisplay';
import { Box } from '@/components';
import { VStack, HStack } from '@/components';
import { Flex } from '@/components';
import { Text, Heading } from '@/components';
import { GlassCard } from '@/components';

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
			<HStack gap="md" align="center">
				<Box rounded="xl" bg="muted" className="h-12 w-12 animate-pulse" />
				<Flex direction="col" gap="xs" grow>
					<Box rounded="md" bg="muted" className="h-5 w-32 animate-pulse" />
					<Box rounded="md" bg="muted" className="h-4 w-20 animate-pulse" />
				</Flex>
				<Box rounded="md" bg="muted" className="h-6 w-24 animate-pulse" />
			</HStack>
		</GlassCard>
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
		<HStack justify="between" align="center" className="mb-4">
			<HStack gap="sm" align="center">
				<Flex
					align="center"
					justify="center"
					className={`h-6 w-6 rounded-md ${iconBgClass}`}
				>
					{icon}
				</Flex>
				<Heading level={2} size="sm" weight="semibold">
					{title}
				</Heading>
				<Box grow className="ml-3 h-px bg-border/50" />
			</HStack>
			{action}
		</HStack>
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

	const animationStyles = {
		borderLeftColor: bank.color,
		animationDelay: `${animationDelay}ms`,
		animationFillMode: 'backwards' as const,
	};

	const contentMarkup = (
		<>
			{/* Bank header */}
			<HStack gap="md" align="center" p="sm">
				<BankLogo
					bankId={bank.id}
					bankName={bank.name}
					bankColor={bank.color}
					logo={logo}
					size="lg"
					onLogoChange={onLogoChange}
				/>
				<Flex direction="col" grow minW0>
					<HStack gap="sm" align="center">
						<Heading
							level={3}
							size="lg"
							weight="semibold"
							color={!hasAccounts ? 'muted' : 'default'}
						>
							{bank.name}
						</Heading>
						{hasAccounts ? (
							<Text as="span" size="xs" className="badge-fun badge-default">
								{bank.accountCount} compte{bank.accountCount > 1 ? 's' : ''}
							</Text>
						) : (
							<Text as="span" size="xs" color="muted" italic>
								Aucun compte
							</Text>
						)}
					</HStack>
					{bank.description && (
						<Text size="sm" color="muted" className="mt-0.5">
							{bank.description}
						</Text>
					)}
				</Flex>
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
							iconLeft={<Plus className="h-4 w-4" />}
							onClick={(e) => {
								e.stopPropagation();
								onAddAccount();
							}}
						>
							<Text as="span" className="hidden sm:inline">Ajouter</Text>
						</Button>
					</>
				) : (
					<Button
						variant="default"
						size="sm"
						iconLeft={<Plus className="h-4 w-4" />}
						onClick={(e) => {
							e.stopPropagation();
							onAddAccount();
						}}
					>
						Ajouter un compte
					</Button>
				)}
			</HStack>

			{/* Accounts list */}
			{bank.accounts.length > 0 && (
				<VStack gap="sm" className="px-4 pb-4 ml-16">
					{bank.accounts.map((account) => (
						<AccountRowLink key={account.id} account={account} />
					))}
				</VStack>
			)}
		</>
	);

	// Return different markup based on whether bank row is clickable
	if (!hasAccounts) {
		return (
			<button
				type="button"
				className="glass-card border-l-4 transition-all duration-200 animate-in fade-in-0 slide-in-from-bottom-2 bg-muted/20 border-2 border-dashed border-border/40 hover:border-border/60 hover:bg-muted/30 cursor-pointer text-left w-full"
				style={animationStyles}
				onClick={onAddAccount}
			>
				{contentMarkup}
			</button>
		);
	}

	return (
		<Box
			className="glass-card border-l-4 transition-all duration-200 animate-in fade-in-0 slide-in-from-bottom-2 hover:shadow-sm"
			style={animationStyles}
		>
			{contentMarkup}
		</Box>
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
			<HStack gap="sm" align="center">
				<VStack gap="none">
					<HStack gap="sm" align="center">
						<Text as="span" size="sm" weight="medium" className="group-hover:text-foreground">
							{account.name}
						</Text>
						<AccountTypeBadge
							type={account.type as 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'LOAN'}
							variant="subtle"
							className="text-[10px]"
						/>
					</HStack>
					{account.members.length > 0 && (
						<Box className="mt-1.5">
							<MemberAvatarGroup
								members={memberData}
								size="xs"
								max={4}
								spacing="normal"
							/>
						</Box>
					)}
				</VStack>
			</HStack>
			<HStack gap="sm" align="center">
				<MoneyDisplay
					amount={account.balance}
					size="sm"
					weight="semibold"
					autoColor
				/>
				<ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all duration-200" />
			</HStack>
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
					<Plus className="h-3.5 w-3.5" />
					<Text as="span" size="xs">Ajouter</Text>
					<ChevronDown className="h-3 w-3 opacity-50" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48">
				{banks.map((bank) => (
					<DropdownMenuItem
						key={bank.id}
						onClick={() => onSelectBank(bank)}
					>
						<HStack gap="sm" align="center">
							<Box
								rounded="full"
								className="w-2 h-2"
								style={{ backgroundColor: bank.color }}
							/>
							<Text as="span">{bank.name}</Text>
						</HStack>
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
		<Flex wrap="wrap" gap="sm">
			{members.map((member) => {
				const isSelected = selectedIds.includes(member.id);
				return (
					<button
						key={member.id}
						type="button"
						onClick={() => onToggle(member.id)}
						className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-150 cursor-pointer border ${
							isSelected
								? 'bg-primary/10 text-primary border-primary/30'
								: 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground'
						}`}
					>
						<Box
							rounded="full"
							className="w-2.5 h-2.5"
							style={{ backgroundColor: member.color || '#6b7280' }}
						/>
						<Text as="span">{member.name}</Text>
					</button>
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
		<Box className="max-w-4xl">
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
				<Box py="lg">
					<Text color="danger">{error}</Text>
				</Box>
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
			<Box mt="xl">
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
					<VStack gap="sm">
						<BankRowSkeleton />
						<BankRowSkeleton />
						<BankRowSkeleton />
					</VStack>
				) : (
					<VStack gap="sm">
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
					</VStack>
				)}
			</Box>

			{/* Investments section */}
			<Box mt="xl">
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
					<VStack gap="sm">
						<BankRowSkeleton />
						<BankRowSkeleton />
					</VStack>
				) : (
					<VStack gap="sm">
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
					</VStack>
				)}
			</Box>

			{/* Add Account Dialog */}
			<Dialog open={showAddAccount} onOpenChange={setShowAddAccount}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Nouveau compte</DialogTitle>
						<DialogDescription>{selectedBank?.name}</DialogDescription>
					</DialogHeader>

					<VStack gap="lg">
						{/* Error message */}
						{formError && (
							<Box rounded="md" bg="destructive" p="sm" border="default" className="bg-destructive/10 border-destructive/20">
								<Text size="sm" color="danger">{formError}</Text>
							</Box>
						)}

						{/* Account name */}
						<VStack gap="sm">
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
						</VStack>

						{/* Description (optional) */}
						<VStack gap="sm">
							<Label
								htmlFor="accountDescription"
								className="text-sm font-medium text-muted-foreground"
							>
								Description
								<Text as="span" size="xs" weight="normal" className="ml-1">(optionnel)</Text>
							</Label>
							<Textarea
								id="accountDescription"
								placeholder="Notes ou contexte sur ce compte..."
								value={newAccountDescription}
								onChange={(e) => setNewAccountDescription(e.target.value)}
								className="min-h-[80px] resize-none"
							/>
						</VStack>

						{/* Account type */}
						<VStack gap="sm">
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
						</VStack>

						{/* Export URL (optional) */}
						<VStack gap="sm">
							<Label
								htmlFor="accountExportUrl"
								className="text-sm font-medium text-muted-foreground"
							>
								Lien d'export
								<Text as="span" size="xs" weight="normal" className="ml-1">(optionnel)</Text>
							</Label>
							<Input
								id="accountExportUrl"
								type="url"
								placeholder="https://..."
								value={newAccountExportUrl}
								onChange={(e) => setNewAccountExportUrl(e.target.value)}
								className="h-10"
							/>
							<Text size="xs" color="muted">
								URL vers l'espace client pour exporter les relevés
							</Text>
						</VStack>

						{/* Member selection */}
						<VStack gap="sm">
							<Label className="text-sm font-medium text-muted-foreground">
								Titulaires
							</Label>
							<MemberSelectorChips
								members={members}
								selectedIds={newAccountMembers}
								onToggle={toggleMember}
							/>
						</VStack>
					</VStack>

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
		</Box>
	);
}
