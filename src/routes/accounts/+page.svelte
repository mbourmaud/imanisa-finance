<script lang="ts">
	interface Owner {
		id: string;
		name: string;
		type: string;
	}

	interface Account {
		id: string;
		owner_id: string;
		name: string;
		account_number: string | null;
		bank: string;
		type: string;
		balance: number;
		owner?: Owner;
	}

	interface Bank {
		name: string;
		accounts: Account[];
		total: number;
	}

	let { data } = $props<{
		user: { name: string } | null;
		accounts: Account[];
		banks: Bank[];
		totalBalance: number;
	}>();

	let selectedOwner = $state<'all' | 'owner-mathieu' | 'owner-ninon' | 'owner-joint' | 'owner-isaac'>('all');

	const ownerOptions = [
		{ id: 'all' as const, label: 'Tous', color: 'var(--color-text-muted)' },
		{ id: 'owner-mathieu' as const, label: 'Mathieu', color: 'var(--color-owner-mathieu)' },
		{ id: 'owner-ninon' as const, label: 'Ninon', color: 'var(--color-owner-ninon)' },
		{ id: 'owner-joint' as const, label: 'Commun', color: 'var(--color-owner-joint)' },
		{ id: 'owner-isaac' as const, label: 'Isaac', color: 'var(--color-owner-isaac)' }
	];

	function getOwnerColor(ownerId: string | undefined): string {
		switch (ownerId) {
			case 'owner-mathieu': return 'var(--color-owner-mathieu)';
			case 'owner-ninon': return 'var(--color-owner-ninon)';
			case 'owner-joint': return 'var(--color-owner-joint)';
			case 'owner-sci-imanisa': return 'var(--color-owner-sci)';
			case 'owner-isaac': return 'var(--color-owner-isaac)';
			default: return 'var(--color-text-muted)';
		}
	}

	function getOwnerInitial(ownerId: string | undefined): string {
		switch (ownerId) {
			case 'owner-mathieu': return 'M';
			case 'owner-ninon': return 'N';
			case 'owner-joint': return 'C';
			case 'owner-sci-imanisa': return 'S';
			case 'owner-isaac': return 'I';
			default: return '?';
		}
	}

	function getBankLogo(bankName: string): string | null {
		const normalized = bankName.toLowerCase();
		if (normalized.includes('caisse') && normalized.includes('épargne')) return '/logos/caisse-epargne.webp';
		if (normalized.includes('crédit mutuel') || normalized.includes('credit mutuel')) return '/logos/credit-mutuel-new.jpg';
		if (normalized.includes('bourse direct')) return '/logos/bourse-direct.webp';
		if (normalized.includes('linxea')) return '/logos/linxea-new.png';
		if (normalized.includes('binance')) return '/logos/binance-new.png';
		if (normalized.includes('bourso')) return '/logos/boursobank.png';
		if (normalized.includes('erwan') || normalized.includes('familial')) return '/logos/family.svg';
		return null;
	}

	function getAccountTypeIcon(type: string): { icon: string; label: string } {
		switch (type) {
			case 'checking':
				return { icon: 'card', label: 'Compte courant' };
			case 'savings':
				return { icon: 'piggy', label: 'Livret' };
			case 'investment':
				return { icon: 'chart', label: 'Investissement' };
			case 'pea':
				return { icon: 'pea', label: 'PEA' };
			case 'crypto':
				return { icon: 'crypto', label: 'Crypto' };
			case 'life_insurance':
				return { icon: 'shield', label: 'Assurance Vie' };
			default:
				return { icon: 'wallet', label: 'Compte' };
		}
	}

	function formatCurrency(value: number): string {
		return value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
	}

	function filterBanksByOwner(banks: Bank[], owner: string): Bank[] {
		if (owner === 'all') return banks;
		return banks
			.map((bank) => {
				const filteredAccounts = bank.accounts.filter((acc) => acc.owner_id === owner);
				return {
					...bank,
					accounts: filteredAccounts,
					total: filteredAccounts.reduce((sum, acc) => sum + acc.balance, 0)
				};
			})
			.filter((bank) => bank.accounts.length > 0);
	}

	const filteredBanks = $derived(filterBanksByOwner(data.banks, selectedOwner));

	const filteredTotalBalance = $derived(
		selectedOwner === 'all'
			? data.totalBalance
			: data.accounts
					.filter((acc: Account) => acc.owner_id === selectedOwner)
					.reduce((sum: number, acc: Account) => sum + acc.balance, 0)
	);

	const totalAccountsCount = $derived(
		selectedOwner === 'all'
			? data.accounts.length
			: data.accounts.filter((acc: Account) => acc.owner_id === selectedOwner).length
	);

	// Disable staggered animations for large lists (>50 items) to improve performance
	const useStaggeredAnimations = $derived(data.accounts.length <= 50);
</script>

<div class="accounts-page">
	<header class="page-header">
		<div class="header-left">
			<h1>Comptes</h1>
			<div class="header-stats">
				<span class="stat-value">{formatCurrency(filteredTotalBalance)}</span>
				<span class="stat-label">{totalAccountsCount} compte{totalAccountsCount > 1 ? 's' : ''}</span>
			</div>
		</div>
		<div class="owner-filter">
			{#each ownerOptions as option}
				<button
					class="owner-pill"
					class:active={selectedOwner === option.id}
					onclick={() => selectedOwner = option.id}
					style="--owner-color: {option.color}"
				>
					<span class="owner-dot"></span>
					<span class="owner-label">{option.label}</span>
				</button>
			{/each}
		</div>
	</header>

	{#if filteredBanks.length === 0}
		<div class="empty-state">
			<div class="empty-icon">
				<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<path d="m3 11 9-9 9 9"/>
					<path d="M12 2v7"/>
					<rect x="4" y="11" width="16" height="10" rx="2"/>
					<path d="M9 21v-4a3 3 0 0 1 6 0v4"/>
				</svg>
			</div>
			<h3>Aucun compte</h3>
			<p>Commencez par ajouter une banque pour voir vos comptes ici.</p>
			<a href="/banks/new" class="btn btn-primary">Ajouter une banque</a>
		</div>
	{:else}
		<div class="banks-list">
			{#each filteredBanks as bank, bankIndex}
				<div class="bank-section" style={useStaggeredAnimations ? `animation-delay: ${bankIndex * 0.05}s` : ''}>
					<div class="bank-header">
						<div class="bank-identity">
							{#if getBankLogo(bank.name)}
								<img
									src={getBankLogo(bank.name)}
									alt={bank.name}
									class="bank-logo"
									width="40"
									height="40"
									loading="lazy"
								/>
							{:else}
								<div class="bank-icon-placeholder">
									<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="m3 11 9-9 9 9"/>
										<rect x="4" y="11" width="16" height="10" rx="2"/>
									</svg>
								</div>
							{/if}
							<div class="bank-info">
								<span class="bank-name">{bank.name}</span>
								<span class="bank-count">{bank.accounts.length} compte{bank.accounts.length > 1 ? 's' : ''}</span>
							</div>
						</div>
						<span class="bank-total" class:positive={bank.total >= 0} class:negative={bank.total < 0}>
							{formatCurrency(bank.total)}
						</span>
					</div>

					<div class="accounts-list">
						{#each bank.accounts as account, accountIndex}
							{@const typeInfo = getAccountTypeIcon(account.type)}
							<div class="account-row" style={useStaggeredAnimations ? `animation-delay: ${(bankIndex * 0.05) + (accountIndex * 0.03)}s` : ''}>
								<div class="account-type-icon" class:checking={account.type === 'checking'} class:savings={account.type === 'savings'} class:investment={account.type === 'investment'} class:pea={account.type === 'pea'} class:crypto={account.type === 'crypto'} class:life_insurance={account.type === 'life_insurance'}>
									{#if typeInfo.icon === 'card'}
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<rect x="2" y="5" width="20" height="14" rx="2"/>
											<path d="M2 10h20"/>
										</svg>
									{:else if typeInfo.icon === 'piggy'}
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5z"/>
											<path d="M2 9v1c0 1.1.9 2 2 2h1"/>
											<path d="M16 11h0"/>
										</svg>
									{:else if typeInfo.icon === 'chart'}
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
											<polyline points="16 7 22 7 22 13"/>
										</svg>
									{:else if typeInfo.icon === 'pea'}
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<path d="M12 2v20"/>
											<path d="M2 12h20"/>
											<circle cx="12" cy="12" r="10"/>
											<path d="m4.93 4.93 14.14 14.14"/>
										</svg>
									{:else if typeInfo.icon === 'crypto'}
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<path d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.29 4.26m5.908 1.042.348-1.97M7.48 20.364l3.126-17.727"/>
										</svg>
									{:else if typeInfo.icon === 'shield'}
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
											<path d="m9 12 2 2 4-4"/>
										</svg>
									{:else}
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
											<path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
											<path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
										</svg>
									{/if}
								</div>

								<div class="account-details">
									<div class="account-main">
										<span class="account-name">{account.name}</span>
										<span class="account-type-label">{typeInfo.label}</span>
									</div>
									{#if account.account_number}
										<span class="account-number">•••• {account.account_number.slice(-4)}</span>
									{/if}
								</div>

								<span class="owner-badge" style="background: {getOwnerColor(account.owner_id)}" title={account.owner?.name}>
									{getOwnerInitial(account.owner_id)}
								</span>

								<span class="account-balance" class:positive={account.balance >= 0} class:negative={account.balance < 0}>
									{formatCurrency(account.balance)}
								</span>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.accounts-page {
		max-width: var(--content-max-width);
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-8);
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		flex-wrap: wrap;
		gap: var(--spacing-4);
		animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
	}

	.header-left {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2);
	}

	.page-header h1 {
		font-size: var(--font-size-3xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-primary);
		letter-spacing: var(--letter-spacing-tight);
		margin: 0;
	}

	.header-stats {
		display: flex;
		align-items: baseline;
		gap: var(--spacing-3);
	}

	.stat-value {
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-primary-500);
		letter-spacing: var(--letter-spacing-tight);
	}

	.stat-label {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	.owner-filter {
		display: flex;
		gap: var(--spacing-2);
		background: var(--color-bg-elevated);
		padding: var(--spacing-1);
		border-radius: var(--radius-full);
		border: 1px solid var(--color-border);
	}

	.owner-pill {
		display: flex;
		align-items: center;
		gap: var(--spacing-2);
		padding: var(--spacing-2) var(--spacing-4);
		border-radius: var(--radius-full);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-tertiary);
		background: transparent;
		border: none;
		cursor: pointer;
		transition:
			color var(--transition-fast),
			background-color var(--transition-fast);
		white-space: nowrap;
		flex-shrink: 0;
		min-height: 44px;
	}

	.owner-pill:hover {
		color: var(--color-text-secondary);
		background: var(--color-bg-subtle);
	}

	.owner-pill.active {
		color: var(--color-text-primary);
		background: var(--color-bg-subtle);
	}

	.owner-dot {
		width: 8px;
		height: 8px;
		border-radius: var(--radius-full);
		background: var(--owner-color);
		flex-shrink: 0;
	}

	/* Empty State */
	.empty-state {
		background: var(--color-bg-card);
		border-radius: var(--radius-2xl);
		border: 1px solid var(--color-border);
		padding: var(--spacing-16);
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-4);
		animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s forwards;
		opacity: 0;
	}

	.empty-icon {
		width: 80px;
		height: 80px;
		border-radius: var(--radius-2xl);
		background: var(--gradient-accent-soft);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-primary-500);
		margin-bottom: var(--spacing-2);
	}

	.empty-state h3 {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		margin: 0;
	}

	.empty-state p {
		color: var(--color-text-tertiary);
		margin: 0;
		max-width: 320px;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-2);
		padding: var(--spacing-3) var(--spacing-6);
		border-radius: var(--radius-lg);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		transition:
			background-color var(--transition-fast),
			transform var(--transition-fast),
			box-shadow var(--transition-fast);
		text-decoration: none;
		border: none;
		cursor: pointer;
	}

	.btn-primary {
		background: var(--gradient-accent);
		color: white;
		box-shadow: var(--glow-coral);
	}

	.btn-primary:hover {
		transform: translateY(-1px);
		box-shadow: var(--glow-coral-intense);
	}

	/* Banks List */
	.banks-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-6);
	}

	.bank-section {
		background: var(--color-bg-card);
		border-radius: var(--radius-2xl);
		border: 1px solid var(--color-border);
		overflow: hidden;
		animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
		opacity: 0;
	}

	.bank-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-5) var(--spacing-6);
		background: var(--gradient-card);
		border-bottom: 1px solid var(--color-border);
	}

	.bank-identity {
		display: flex;
		align-items: center;
		gap: var(--spacing-4);
	}

	.bank-logo {
		width: 40px;
		height: 40px;
		border-radius: var(--radius-lg);
		object-fit: contain;
	}

	.bank-icon-placeholder {
		width: 40px;
		height: 40px;
		border-radius: var(--radius-lg);
		background: var(--color-bg-subtle);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-muted);
	}

	.bank-info {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-0-5);
	}

	.bank-name {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.bank-count {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
	}

	.bank-total {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-primary);
	}

	.bank-total.positive {
		color: var(--color-success-500);
	}

	.bank-total.negative {
		color: var(--color-danger-500);
	}

	/* Accounts List */
	.accounts-list {
		display: flex;
		flex-direction: column;
	}

	.account-row {
		display: flex;
		align-items: center;
		gap: var(--spacing-4);
		padding: var(--spacing-4) var(--spacing-6);
		transition: background var(--transition-fast);
		animation: fadeInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
		opacity: 0;
	}

	.account-row:hover {
		background: var(--color-bg-card-hover);
	}

	.account-row:not(:last-child) {
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.account-type-icon {
		width: 40px;
		height: 40px;
		border-radius: var(--radius-lg);
		background: var(--color-bg-subtle);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-tertiary);
		flex-shrink: 0;
		transition:
			background-color var(--transition-fast),
			color var(--transition-fast);
	}

	.account-type-icon.checking {
		background: rgba(59, 130, 246, 0.1);
		color: #3B82F6;
	}

	.account-type-icon.savings {
		background: var(--color-success-50);
		color: var(--color-success-500);
	}

	.account-type-icon.investment {
		background: rgba(250, 128, 114, 0.1);
		color: var(--color-primary-500);
	}

	.account-type-icon.pea {
		background: rgba(139, 92, 246, 0.1);
		color: #8B5CF6;
	}

	.account-type-icon.crypto {
		background: rgba(245, 158, 11, 0.1);
		color: #F59E0B;
	}

	.account-type-icon.life_insurance {
		background: rgba(6, 182, 212, 0.1);
		color: #06B6D4;
	}

	.account-details {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-0-5);
	}

	.account-main {
		display: flex;
		align-items: baseline;
		gap: var(--spacing-2);
	}

	.account-name {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.account-type-label {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		background: var(--color-bg-subtle);
		padding: var(--spacing-0-5) var(--spacing-2);
		border-radius: var(--radius-sm);
	}

	.account-number {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		font-family: var(--font-family-mono);
	}

	.owner-badge {
		width: 26px;
		height: 26px;
		border-radius: var(--radius-full);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 11px;
		font-weight: var(--font-weight-bold);
		color: white;
		flex-shrink: 0;
	}

	.account-balance {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		min-width: 120px;
		text-align: right;
	}

	.account-balance.positive {
		color: var(--color-success-500);
	}

	.account-balance.negative {
		color: var(--color-danger-500);
	}

	.positive {
		color: var(--color-success-500);
	}

	.negative {
		color: var(--color-danger-500);
	}

	/* Animations */
	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Responsive */
	@media (max-width: 768px) {
		.accounts-page {
			gap: var(--spacing-6);
		}

		.page-header {
			flex-direction: column;
			align-items: stretch;
			gap: var(--spacing-3);
		}

		.owner-filter {
			width: calc(100% + var(--spacing-4) * 2);
			margin: 0 calc(var(--spacing-4) * -1);
			padding: var(--spacing-1) var(--spacing-4);
			overflow-x: auto;
			scrollbar-width: none;
			-webkit-overflow-scrolling: touch;
			justify-content: flex-start;
			border-radius: 0;
			border-left: none;
			border-right: none;
			background: transparent;
			border: none;
		}

		.owner-filter::-webkit-scrollbar {
			display: none;
		}

		.page-header h1 {
			font-size: var(--font-size-2xl);
		}

		.stat-value {
			font-size: var(--font-size-xl);
		}

		.bank-section {
			border-radius: var(--radius-xl);
		}

		.bank-header {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-3);
			padding: var(--spacing-4);
		}

		.bank-total {
			font-size: var(--font-size-lg);
		}

		.account-row {
			flex-wrap: wrap;
			gap: var(--spacing-3);
			padding: var(--spacing-4);
		}

		.account-type-icon {
			width: 36px;
			height: 36px;
		}

		.account-details {
			flex: 1 1 calc(100% - 100px);
		}

		.account-balance {
			flex: 1 1 100%;
			text-align: left;
			margin-left: 48px;
			margin-top: calc(var(--spacing-1) * -1);
		}

		.owner-badge {
			order: -1;
		}
	}

	@media (max-width: 640px) {
		.owner-pill {
			padding: var(--spacing-2) var(--spacing-3);
			min-height: 40px;
		}

		.owner-label {
			display: none;
		}

		.bank-header,
		.account-row {
			padding: var(--spacing-3);
		}

		.account-type-label {
			display: none;
		}

		.account-name {
			font-size: var(--font-size-sm);
		}

		.account-balance {
			margin-left: 44px;
		}
	}

	@media (max-width: 375px) {
		.bank-logo,
		.bank-icon-placeholder {
			width: 32px;
			height: 32px;
		}

		.account-type-icon {
			width: 32px;
			height: 32px;
		}

		.account-balance {
			margin-left: 40px;
		}
	}
</style>
