<script lang="ts">
	interface Owner {
		id: string;
		name: string;
		type: string;
	}

	interface Transaction {
		id: string;
		account_id: string;
		date: string;
		description: string;
		amount: number;
		type: 'income' | 'expense';
		category: string | null;
		owner_id?: string;
		owner?: Owner;
		accountName?: string;
		bank?: string;
	}

	let { data } = $props<{
		user: { name: string } | null;
		transactions: Transaction[];
		totalCount: number;
		page: number;
		totalPages: number;
		monthlyIncome: number;
		monthlyExpense: number;
		monthlyBalance: number;
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

	function formatCurrency(value: number): string {
		return value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
	}

	function formatDate(dateStr: string): string {
		const date = new Date(dateStr);
		return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
	}

	const filteredTransactions = $derived(
		selectedOwner === 'all'
			? data.transactions
			: data.transactions.filter((tx: Transaction) => tx.owner_id === selectedOwner)
	);

	const filteredCount = $derived(
		selectedOwner === 'all' ? data.totalCount : filteredTransactions.length
	);
</script>

<div class="transactions-page">
	<header class="page-header">
		<div class="header-left">
			<h1>Transactions</h1>
			<div class="header-stats">
				<span class="stat-value">{filteredCount}</span>
				<span class="stat-label">transaction{filteredCount > 1 ? 's' : ''}</span>
				<span class="stat-separator">|</span>
				<span class="stat-label">Page {data.page} sur {data.totalPages}</span>
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

	<div class="summary-cards">
		<div class="summary-card income">
			<div class="summary-icon">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
					<polyline points="17 6 23 6 23 12"/>
				</svg>
			</div>
			<div class="summary-content">
				<span class="summary-label">Revenus du mois</span>
				<span class="summary-value">{formatCurrency(data.monthlyIncome)}</span>
			</div>
		</div>
		<div class="summary-card expense">
			<div class="summary-icon">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
					<polyline points="17 18 23 18 23 12"/>
				</svg>
			</div>
			<div class="summary-content">
				<span class="summary-label">Dépenses du mois</span>
				<span class="summary-value">{formatCurrency(Math.abs(data.monthlyExpense))}</span>
			</div>
		</div>
		<div class="summary-card balance" class:positive={data.monthlyBalance >= 0} class:negative={data.monthlyBalance < 0}>
			<div class="summary-icon">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="10"/>
					<path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
					<path d="M12 18V6"/>
				</svg>
			</div>
			<div class="summary-content">
				<span class="summary-label">Solde du mois</span>
				<span class="summary-value">{formatCurrency(data.monthlyBalance)}</span>
			</div>
		</div>
	</div>

	{#if filteredTransactions.length === 0}
		<div class="empty-state">
			<div class="empty-icon">
				<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<rect x="2" y="4" width="20" height="16" rx="2"/>
					<path d="M7 15h0M2 9h20"/>
				</svg>
			</div>
			<h3>Aucune transaction</h3>
			<p>Les transactions apparaîtront ici une fois synchronisées.</p>
		</div>
	{:else}
		<div class="transactions-card">
			<div class="transactions-list">
				{#each filteredTransactions as tx, i}
					<div class="transaction-row" style="animation-delay: {i * 0.02}s">
						<span class="transaction-date">{formatDate(tx.date)}</span>
						
						<div class="transaction-details">
							<span class="transaction-description">{tx.description}</span>
							{#if tx.category}
								<span class="transaction-category">{tx.category}</span>
							{/if}
						</div>
						
						<span class="owner-badge" style="background: {getOwnerColor(tx.owner_id)}" title={tx.owner?.name}>
							{getOwnerInitial(tx.owner_id)}
						</span>
						
						<span class="transaction-amount" class:income={tx.type === 'income'} class:expense={tx.type === 'expense'}>
							{tx.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
						</span>
					</div>
				{/each}
			</div>
		</div>

		<nav class="pagination">
			{#if data.page > 1}
				<a href="/transactions?page={data.page - 1}" class="pagination-btn">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="15 18 9 12 15 6"/>
					</svg>
					Précédent
				</a>
			{:else}
				<span class="pagination-btn disabled">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="15 18 9 12 15 6"/>
					</svg>
					Précédent
				</span>
			{/if}

			<span class="pagination-info">Page {data.page} sur {data.totalPages}</span>

			{#if data.page < data.totalPages}
				<a href="/transactions?page={data.page + 1}" class="pagination-btn">
					Suivant
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="9 18 15 12 9 6"/>
					</svg>
				</a>
			{:else}
				<span class="pagination-btn disabled">
					Suivant
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="9 18 15 12 9 6"/>
					</svg>
				</span>
			{/if}
		</nav>
	{/if}
</div>

<style>
	.transactions-page {
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
		gap: var(--spacing-2);
	}

	.stat-value {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-primary-500);
	}

	.stat-label {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	.stat-separator {
		color: var(--color-border-hover);
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
		transition: all var(--transition-fast);
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

	.summary-cards {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--spacing-4);
		animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s forwards;
		opacity: 0;
	}

	.summary-card {
		background: var(--color-bg-card);
		border-radius: var(--radius-2xl);
		border: 1px solid var(--color-border);
		padding: var(--spacing-5);
		display: flex;
		align-items: center;
		gap: var(--spacing-4);
	}

	.summary-icon {
		width: 44px;
		height: 44px;
		border-radius: var(--radius-xl);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.summary-card.income .summary-icon {
		background: var(--color-success-50);
		color: var(--color-success-500);
	}

	.summary-card.expense .summary-icon {
		background: var(--color-danger-50);
		color: var(--color-danger-500);
	}

	.summary-card.balance .summary-icon {
		background: var(--gradient-accent-soft);
		color: var(--color-primary-500);
	}

	.summary-card.balance.positive .summary-icon {
		background: var(--color-success-50);
		color: var(--color-success-500);
	}

	.summary-card.balance.negative .summary-icon {
		background: var(--color-danger-50);
		color: var(--color-danger-500);
	}

	.summary-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-1);
		min-width: 0;
	}

	.summary-label {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-caps);
	}

	.summary-value {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-primary);
		letter-spacing: var(--letter-spacing-tight);
	}

	.summary-card.income .summary-value {
		color: var(--color-success-500);
	}

	.summary-card.expense .summary-value {
		color: var(--color-danger-500);
	}

	.summary-card.balance.positive .summary-value {
		color: var(--color-success-500);
	}

	.summary-card.balance.negative .summary-value {
		color: var(--color-danger-500);
	}

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

	.transactions-card {
		background: var(--color-bg-card);
		border-radius: var(--radius-2xl);
		border: 1px solid var(--color-border);
		overflow: hidden;
		animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s forwards;
		opacity: 0;
	}

	.transactions-list {
		display: flex;
		flex-direction: column;
	}

	.transaction-row {
		display: flex;
		align-items: center;
		gap: var(--spacing-4);
		padding: var(--spacing-4) var(--spacing-6);
		transition: background var(--transition-fast);
		animation: fadeInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
		opacity: 0;
	}

	.transaction-row:hover {
		background: var(--color-bg-card-hover);
	}

	.transaction-row:not(:last-child) {
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.transaction-date {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		min-width: 60px;
		flex-shrink: 0;
	}

	.transaction-details {
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: center;
		gap: var(--spacing-3);
	}

	.transaction-description {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.transaction-category {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		background: var(--color-bg-subtle);
		padding: var(--spacing-0-5) var(--spacing-2);
		border-radius: var(--radius-sm);
		flex-shrink: 0;
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

	.transaction-amount {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		min-width: 120px;
		text-align: right;
		flex-shrink: 0;
	}

	.transaction-amount.income {
		color: var(--color-success-500);
	}

	.transaction-amount.expense {
		color: var(--color-danger-500);
	}

	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: var(--spacing-4);
		animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s forwards;
		opacity: 0;
	}

	.pagination-btn {
		display: flex;
		align-items: center;
		gap: var(--spacing-2);
		padding: var(--spacing-3) var(--spacing-5);
		border-radius: var(--radius-lg);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-secondary);
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		text-decoration: none;
		transition: all var(--transition-fast);
	}

	.pagination-btn:hover:not(.disabled) {
		color: var(--color-text-primary);
		background: var(--color-bg-card-hover);
		border-color: var(--color-border-hover);
	}

	.pagination-btn.disabled {
		color: var(--color-text-disabled);
		cursor: not-allowed;
		opacity: 0.5;
	}

	.pagination-info {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

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

	@media (max-width: 768px) {
		.transactions-page {
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

		.summary-cards {
			grid-template-columns: 1fr;
			gap: var(--spacing-3);
		}

		.summary-card {
			padding: var(--spacing-4);
			border-radius: var(--radius-xl);
		}

		.transactions-card {
			border-radius: var(--radius-xl);
		}

		.transaction-row {
			flex-wrap: wrap;
			gap: var(--spacing-2);
			padding: var(--spacing-3) var(--spacing-4);
		}

		.transaction-date {
			order: 1;
			min-width: auto;
			font-size: var(--font-size-xs);
		}

		.transaction-details {
			order: 2;
			flex: 1 1 calc(100% - 80px);
		}

		.owner-badge {
			order: 0;
		}

		.transaction-amount {
			order: 3;
			flex: 1 1 100%;
			text-align: left;
			margin-left: 34px;
			margin-top: calc(var(--spacing-1) * -1);
		}

		.pagination {
			flex-direction: row;
			flex-wrap: wrap;
			justify-content: center;
			gap: var(--spacing-2);
		}

		.pagination-btn {
			padding: var(--spacing-2) var(--spacing-4);
			font-size: var(--font-size-xs);
		}

		.pagination-info {
			flex: 1 1 100%;
			text-align: center;
			order: -1;
			margin-bottom: var(--spacing-2);
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

		.transaction-category {
			display: none;
		}

		.summary-icon {
			width: 40px;
			height: 40px;
		}

		.summary-value {
			font-size: var(--font-size-lg);
		}

		.transaction-description {
			font-size: var(--font-size-sm);
		}
	}

	@media (max-width: 375px) {
		.transaction-row {
			padding: var(--spacing-3);
		}

		.owner-badge {
			width: 24px;
			height: 24px;
			font-size: 10px;
		}

		.transaction-amount {
			margin-left: 32px;
		}

		.summary-icon {
			width: 36px;
			height: 36px;
		}
	}
</style>
