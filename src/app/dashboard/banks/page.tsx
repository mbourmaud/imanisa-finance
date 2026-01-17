'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
	ChevronRight,
	CreditCard,
	Landmark,
	Plus,
	TrendingUp,
	Users,
	Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
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
import { Skeleton } from '@/components/ui/skeleton';
import { BankLogo } from '@/components/banks/BankLogo';

interface AccountMember {
	id: string;
	name: string;
	ownerShare: number;
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

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'EUR',
	}).format(amount);
}

// Skeleton for the stats cards
function StatsCardsSkeleton() {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
			{[1, 2, 3].map((i) => (
				<Card key={i} className="py-4">
					<CardContent className="flex items-center gap-4 px-4">
						<Skeleton className="h-10 w-10 rounded-lg" />
						<div className="flex-1">
							<Skeleton className="h-3 w-16 mb-2" />
							<Skeleton className="h-6 w-20" />
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

// Skeleton for bank card
function BankRowSkeleton() {
	return (
		<div className="bg-card rounded-lg border border-border/60 p-4 border-l-4 border-l-muted-foreground/20">
			<div className="flex items-center gap-4">
				<Skeleton className="h-10 w-10 rounded-lg" />
				<div className="flex-1">
					<Skeleton className="h-5 w-32 mb-1" />
					<Skeleton className="h-4 w-20" />
				</div>
				<Skeleton className="h-6 w-24" />
				<Skeleton className="h-9 w-24 rounded-md" />
			</div>
		</div>
	);
}

// Account type labels
const ACCOUNT_TYPE_LABELS: Record<string, string> = {
	CHECKING: 'Compte courant',
	SAVINGS: 'Épargne',
	INVESTMENT: 'Investissement',
	LOAN: 'Prêt',
};

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
			prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId],
		);
	};

	return (
		<div className="max-w-4xl">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-2xl font-semibold text-foreground">Banques</h1>
				<p className="text-muted-foreground mt-1">
					Gérez vos établissements et importez vos données
				</p>
			</div>

			{/* Stats Cards */}
			{loading ? (
				<StatsCardsSkeleton />
			) : error ? (
				<div className="py-6 text-destructive">{error}</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					{/* Banks Card */}
					<Card className="py-4 bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-800/30">
						<CardContent className="flex items-center gap-4 px-4">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
								<Landmark className="h-5 w-5 text-amber-600 dark:text-amber-400" />
							</div>
							<div>
								<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
									Banques
								</p>
								<p className="text-2xl font-semibold tabular-nums">
									{data?.summary.totalBanksUsed ?? 0}
									<span className="text-sm font-normal text-muted-foreground ml-1">
										/ {data?.summary.totalBanksAvailable ?? 0}
									</span>
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Accounts Card */}
					<Card className="py-4 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/30">
						<CardContent className="flex items-center gap-4 px-4">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
								<CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
							</div>
							<div>
								<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
									Comptes actifs
								</p>
								<p className="text-2xl font-semibold tabular-nums">
									{data?.summary.totalAccounts ?? 0}
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Balance Card */}
					<Card className="py-4 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/30">
						<CardContent className="flex items-center gap-4 px-4">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
								<Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
							</div>
							<div>
								<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
									Solde total
								</p>
								<p className="text-2xl font-semibold tabular-nums">
									{formatCurrency(data?.summary.totalBalance ?? 0)}
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Supported Banks - Bank accounts */}
			<div className="mt-8">
				<div className="flex items-center gap-2 mb-4">
					<Landmark className="h-4 w-4 text-muted-foreground" />
					<h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
						Comptes bancaires
					</h2>
				</div>

				{loading ? (
					<div className="space-y-3">
						<BankRowSkeleton />
						<BankRowSkeleton />
						<BankRowSkeleton />
					</div>
				) : (
					<div className="space-y-3">
						{data?.bankAccounts.map((bank) => (
							<div
								key={bank.id}
								className="bg-card rounded-lg border border-border/60 p-4 border-l-4"
								style={{ borderLeftColor: bank.color }}
							>
								{/* Bank header */}
								<div className="flex items-center gap-4">
									<BankLogo
										bankId={bank.id}
										bankName={bank.name}
										bankColor={bank.color}
										logo={bankLogos[bank.id] ?? bank.logo}
										size="md"
										onLogoChange={(url) => handleLogoChange(bank.id, url)}
									/>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<p className="font-medium">{bank.name}</p>
											{bank.accountCount > 0 && (
												<span className="text-xs text-muted-foreground">
													{bank.accountCount} compte{bank.accountCount > 1 ? 's' : ''}
												</span>
											)}
										</div>
										{bank.description && (
											<p className="text-sm text-muted-foreground">
												{bank.description}
											</p>
										)}
									</div>
									{bank.accountCount > 0 && (
										<p className="font-semibold tabular-nums mr-4">
											{formatCurrency(bank.totalBalance)}
										</p>
									)}
									<Button
										variant="outline"
										size="sm"
										className="gap-1"
										onClick={() => handleAddAccountClick(bank)}
									>
										<Plus className="h-4 w-4" />
										Ajouter
									</Button>
								</div>

								{/* Accounts list */}
								{bank.accounts.length > 0 && (
									<div className="mt-4 ml-14 space-y-2">
										{bank.accounts.map((account) => (
											<Link
												key={account.id}
												href={`/dashboard/accounts/${account.id}`}
												className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group cursor-pointer"
											>
												<div className="flex items-center gap-3">
													<div>
														<p className="font-medium text-sm">{account.name}</p>
														<div className="flex items-center gap-2 text-xs text-muted-foreground">
															<span>{ACCOUNT_TYPE_LABELS[account.type] || account.type}</span>
															{account.members.length > 0 && (
																<>
																	<span>·</span>
																	<span className="flex items-center gap-1">
																		<Users className="h-3 w-3" />
																		{account.members.map((m) => m.name).join(', ')}
																	</span>
																</>
															)}
														</div>
													</div>
												</div>
												<div className="flex items-center gap-2">
													<p className="font-medium tabular-nums text-sm">
														{formatCurrency(account.balance)}
													</p>
													<ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
												</div>
											</Link>
										))}
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</div>

			{/* Investments */}
			<div className="mt-8">
				<div className="flex items-center gap-2 mb-4">
					<TrendingUp className="h-4 w-4 text-muted-foreground" />
					<h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
						Investissements
					</h2>
				</div>

				{loading ? (
					<div className="space-y-3">
						<BankRowSkeleton />
						<BankRowSkeleton />
					</div>
				) : (
					<div className="space-y-3">
						{data?.investmentAccounts.map((bank) => (
							<div
								key={bank.id}
								className="bg-card rounded-lg border border-border/60 p-4 border-l-4"
								style={{ borderLeftColor: bank.color }}
							>
								{/* Bank header */}
								<div className="flex items-center gap-4">
									<BankLogo
										bankId={bank.id}
										bankName={bank.name}
										bankColor={bank.color}
										logo={bankLogos[bank.id] ?? bank.logo}
										size="md"
										onLogoChange={(url) => handleLogoChange(bank.id, url)}
									/>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<p className="font-medium">{bank.name}</p>
											{bank.accountCount > 0 && (
												<span className="text-xs text-muted-foreground">
													{bank.accountCount} compte{bank.accountCount > 1 ? 's' : ''}
												</span>
											)}
										</div>
										{bank.description && (
											<p className="text-sm text-muted-foreground">
												{bank.description}
											</p>
										)}
									</div>
									{bank.accountCount > 0 && (
										<p className="font-semibold tabular-nums mr-4">
											{formatCurrency(bank.totalBalance)}
										</p>
									)}
									<Button
										variant="outline"
										size="sm"
										className="gap-1"
										onClick={() => handleAddAccountClick(bank)}
									>
										<Plus className="h-4 w-4" />
										Ajouter
									</Button>
								</div>

								{/* Accounts list */}
								{bank.accounts.length > 0 && (
									<div className="mt-4 ml-14 space-y-2">
										{bank.accounts.map((account) => (
											<Link
												key={account.id}
												href={`/dashboard/accounts/${account.id}`}
												className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group cursor-pointer"
											>
												<div className="flex items-center gap-3">
													<div>
														<p className="font-medium text-sm">{account.name}</p>
														<div className="flex items-center gap-2 text-xs text-muted-foreground">
															<span>{ACCOUNT_TYPE_LABELS[account.type] || account.type}</span>
															{account.members.length > 0 && (
																<>
																	<span>·</span>
																	<span className="flex items-center gap-1">
																		<Users className="h-3 w-3" />
																		{account.members.map((m) => m.name).join(', ')}
																	</span>
																</>
															)}
														</div>
													</div>
												</div>
												<div className="flex items-center gap-2">
													<p className="font-medium tabular-nums text-sm">
														{formatCurrency(account.balance)}
													</p>
													<ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
												</div>
											</Link>
										))}
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</div>

			{/* Add Account Dialog */}
			<Dialog open={showAddAccount} onOpenChange={setShowAddAccount}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Nouveau compte</DialogTitle>
						<DialogDescription>
							{selectedBank?.name}
						</DialogDescription>
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
							<Label htmlFor="accountName" className="text-sm font-medium text-muted-foreground">
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
							<Label htmlFor="accountDescription" className="text-sm font-medium text-muted-foreground">
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
							<Label htmlFor="accountType" className="text-sm font-medium text-muted-foreground">
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
							<Label htmlFor="accountExportUrl" className="text-sm font-medium text-muted-foreground">
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
							<div className="flex flex-wrap gap-2">
								{members.map((member) => (
									<button
										key={member.id}
										type="button"
										onClick={() => toggleMember(member.id)}
										className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-150 cursor-pointer border ${
											newAccountMembers.includes(member.id)
												? 'bg-primary/10 text-primary border-primary/30'
												: 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground'
										}`}
									>
										<span
											className="w-2.5 h-2.5 rounded-full"
											style={{ backgroundColor: member.color || '#6b7280' }}
										/>
										{member.name}
									</button>
								))}
							</div>
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
