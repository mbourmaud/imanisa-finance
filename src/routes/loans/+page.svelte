<script lang="ts">
	interface Owner {
		id: string;
		name: string;
		type: string;
	}

	interface Property {
		id: string;
		name: string;
		address: string | null;
		city: string | null;
		current_value: number;
	}

	interface Loan {
		id: string;
		owner_id: string;
		name: string;
		bank: string;
		type: string;
		initial_amount: number;
		remaining_amount: number;
		rate: number;
		monthly_payment: number;
		start_date: string | null;
		end_date: string | null;
		owner?: Owner;
		property?: Property | null;
		progress: number;
		amountPaid: number;
	}

	interface PageData {
		user: { name: string } | null;
		loans: Loan[];
		totalDebt: number;
		totalMonthlyPayment: number;
		totalInitial: number;
		globalProgress: number;
	}

	let { data } = $props<{ data: PageData }>();
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

	function getLoanTypeLabel(type: string): string {
		switch (type) {
			case 'mortgage': return 'Prêt immobilier';
			case 'consumer': return 'Prêt conso';
			case 'student': return 'Prêt étudiant';
			case 'car': return 'Prêt auto';
			default: return 'Prêt';
		}
	}

	function formatCurrency(value: number): string {
		return value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
	}

	function formatCompactCurrency(value: number): string {
		return value.toLocaleString('fr-FR', {
			style: 'currency',
			currency: 'EUR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		});
	}

	function formatPercent(value: number): string {
		return value.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
	}

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '-';
		return new Date(dateStr).toLocaleDateString('fr-FR', {
			month: 'short',
			year: 'numeric'
		});
	}

	const filteredLoans = $derived(
		selectedOwner === 'all'
			? data.loans ?? []
			: (data.loans ?? []).filter((l: Loan) => l.owner_id === selectedOwner)
	);

	const filteredTotalDebt = $derived(
		filteredLoans.reduce((sum: number, l: Loan) => sum + l.remaining_amount, 0)
	);

	const filteredTotalMonthly = $derived(
		filteredLoans.reduce((sum: number, l: Loan) => sum + l.monthly_payment, 0)
	);

	const filteredTotalInitial = $derived(
		filteredLoans.reduce((sum: number, l: Loan) => sum + l.initial_amount, 0)
	);

	const filteredProgress = $derived(
		filteredTotalInitial > 0
			? ((filteredTotalInitial - filteredTotalDebt) / filteredTotalInitial) * 100
			: 0
	);
</script>

<div class="loans-page">
	<header class="page-header">
		<div class="header-left">
			<h1>Crédits</h1>
			<span class="header-subtitle">{filteredLoans.length} prêt{filteredLoans.length > 1 ? 's' : ''} en cours</span>
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

	<section class="summary-section">
		<div class="summary-cards">
			<div class="summary-card">
				<div class="summary-icon danger">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M12 2v20M2 12h20"/>
					</svg>
				</div>
				<div class="summary-content">
					<span class="summary-label">Capital restant dû</span>
					<span class="summary-value text-danger">{formatCompactCurrency(filteredTotalDebt)}</span>
				</div>
			</div>
			<div class="summary-card">
				<div class="summary-icon">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
						<line x1="16" y1="2" x2="16" y2="6"/>
						<line x1="8" y1="2" x2="8" y2="6"/>
						<line x1="3" y1="10" x2="21" y2="10"/>
					</svg>
				</div>
				<div class="summary-content">
					<span class="summary-label">Mensualités</span>
					<span class="summary-value">{formatCompactCurrency(filteredTotalMonthly)}/mois</span>
				</div>
			</div>
			<div class="summary-card">
				<div class="summary-icon success">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="20 6 9 17 4 12"/>
					</svg>
				</div>
				<div class="summary-content">
					<span class="summary-label">Déjà remboursé</span>
					<span class="summary-value text-success">{formatCompactCurrency(filteredTotalInitial - filteredTotalDebt)}</span>
				</div>
			</div>
			<div class="summary-card progress-card">
				<div class="summary-content full">
					<span class="summary-label">Progression globale</span>
					<div class="progress-container">
						<div class="progress-bar">
							<div class="progress-fill" style="width: {filteredProgress}%"></div>
						</div>
						<span class="progress-text">{formatPercent(filteredProgress)}</span>
					</div>
				</div>
			</div>
		</div>
	</section>

	<section class="loans-section">
		{#if filteredLoans.length === 0}
			<div class="empty-state">
				<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<path d="M12 2v20M2 12h20"/>
				</svg>
				<p>Aucun crédit en cours</p>
			</div>
		{:else}
			<div class="loans-list">
				{#each filteredLoans as loan}
					<div class="loan-card">
						<div class="loan-header">
							<div class="loan-info">
								<span class="owner-badge" style="background: {getOwnerColor(loan.owner_id)}">
									{getOwnerInitial(loan.owner_id)}
								</span>
								<div class="loan-details">
									<span class="loan-name">{loan.name}</span>
									<span class="loan-meta">
										{getLoanTypeLabel(loan.type)} • {loan.bank}
										{#if loan.property}
											• {loan.property.name}
										{/if}
									</span>
								</div>
							</div>
							<div class="loan-rate">
								<span class="rate-value">{formatPercent(loan.rate)}</span>
								<span class="rate-label">Taux</span>
							</div>
						</div>

						<div class="loan-progress">
							<div class="progress-bar large">
								<div class="progress-fill" style="width: {loan.progress}%"></div>
							</div>
							<div class="progress-labels">
								<span class="progress-paid">{formatCompactCurrency(loan.amountPaid)} remboursé</span>
								<span class="progress-remaining">{formatCompactCurrency(loan.remaining_amount)} restant</span>
							</div>
						</div>

						<div class="loan-footer">
							<div class="loan-stat">
								<span class="stat-label">Capital initial</span>
								<span class="stat-value">{formatCompactCurrency(loan.initial_amount)}</span>
							</div>
							<div class="loan-stat">
								<span class="stat-label">Mensualité</span>
								<span class="stat-value">{formatCurrency(loan.monthly_payment)}</span>
							</div>
							<div class="loan-stat">
								<span class="stat-label">Progression</span>
								<span class="stat-value text-success">{formatPercent(loan.progress)}</span>
							</div>
							{#if loan.end_date}
								<div class="loan-stat">
									<span class="stat-label">Fin prévue</span>
									<span class="stat-value">{formatDate(loan.end_date)}</span>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</section>
</div>

<style>
	.loans-page {
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
		gap: var(--spacing-1);
	}

	.page-header h1 {
		font-size: var(--font-size-3xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-primary);
		letter-spacing: var(--letter-spacing-tight);
	}

	.header-subtitle {
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

	.summary-section {
		animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s forwards;
		opacity: 0;
	}

	.summary-cards {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--spacing-4);
	}

	.summary-card {
		background: var(--color-bg-card);
		border-radius: var(--radius-xl);
		border: 1px solid var(--color-border);
		padding: var(--spacing-5);
		display: flex;
		align-items: center;
		gap: var(--spacing-4);
	}

	.summary-icon {
		width: 44px;
		height: 44px;
		border-radius: var(--radius-lg);
		background: var(--color-bg-subtle);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-tertiary);
		flex-shrink: 0;
	}

	.summary-icon.danger {
		background: var(--color-danger-50);
		color: var(--color-danger-500);
	}

	.summary-icon.success {
		background: var(--color-success-50);
		color: var(--color-success-500);
	}

	.summary-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-1);
		min-width: 0;
	}

	.summary-content.full {
		width: 100%;
	}

	.summary-label {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-caps);
	}

	.summary-value {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-primary);
	}

	.progress-card {
		flex-direction: column;
		align-items: stretch;
	}

	.progress-container {
		display: flex;
		align-items: center;
		gap: var(--spacing-3);
		margin-top: var(--spacing-2);
	}

	.progress-bar {
		flex: 1;
		height: 8px;
		background: var(--color-bg-subtle);
		border-radius: var(--radius-full);
		overflow: hidden;
	}

	.progress-bar.large {
		height: 12px;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--color-success-500), var(--color-success-400));
		border-radius: var(--radius-full);
		transition: width 0.5s ease;
	}

	.progress-text {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-bold);
		color: var(--color-success-500);
		min-width: 60px;
		text-align: right;
	}

	.loans-section {
		animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s forwards;
		opacity: 0;
	}

	.loans-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-4);
	}

	.loan-card {
		background: var(--color-bg-card);
		border-radius: var(--radius-xl);
		border: 1px solid var(--color-border);
		padding: var(--spacing-6);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-5);
		transition:
			background-color var(--transition-fast),
			border-color var(--transition-fast);
	}

	.loan-card:hover {
		background: var(--color-bg-card-hover);
		border-color: var(--color-border-hover);
	}

	.loan-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--spacing-4);
	}

	.loan-info {
		display: flex;
		align-items: center;
		gap: var(--spacing-3);
	}

	.owner-badge {
		width: 36px;
		height: 36px;
		border-radius: var(--radius-full);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-bold);
		color: white;
		flex-shrink: 0;
	}

	.loan-details {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-1);
	}

	.loan-name {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.loan-meta {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	.loan-rate {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: var(--spacing-0-5);
	}

	.rate-value {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-primary-500);
	}

	.rate-label {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-caps);
	}

	.loan-progress {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2);
	}

	.progress-labels {
		display: flex;
		justify-content: space-between;
		font-size: var(--font-size-sm);
	}

	.progress-paid {
		color: var(--color-success-500);
	}

	.progress-remaining {
		color: var(--color-text-muted);
	}

	.loan-footer {
		display: flex;
		gap: var(--spacing-6);
		padding-top: var(--spacing-4);
		border-top: 1px solid var(--color-border);
	}

	.loan-stat {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-1);
	}

	.stat-label {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
	}

	.stat-value {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-16);
		color: var(--color-text-muted);
		gap: var(--spacing-4);
	}

	.empty-state p {
		font-size: var(--font-size-lg);
	}

	.text-danger { color: var(--color-danger-500); }
	.text-success { color: var(--color-success-500); }

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 1024px) {
		.summary-cards {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 768px) {
		.loans-page {
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
			border-radius: var(--radius-lg);
		}

		.loan-card {
			padding: var(--spacing-4);
			border-radius: var(--radius-xl);
			gap: var(--spacing-4);
		}

		.loan-header {
			flex-direction: column;
			gap: var(--spacing-3);
		}

		.loan-rate {
			align-items: flex-start;
		}

		.loan-footer {
			flex-wrap: wrap;
			gap: var(--spacing-3);
			padding-top: var(--spacing-3);
		}

		.loan-stat {
			min-width: calc(50% - var(--spacing-2));
		}

		.progress-labels {
			flex-direction: column;
			gap: var(--spacing-1);
			font-size: var(--font-size-xs);
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

		.summary-icon {
			width: 40px;
			height: 40px;
		}

		.summary-value {
			font-size: var(--font-size-base);
		}

		.loan-name {
			font-size: var(--font-size-base);
		}

		.loan-meta {
			font-size: var(--font-size-xs);
		}

		.rate-value {
			font-size: var(--font-size-lg);
		}

		.owner-badge {
			width: 32px;
			height: 32px;
			font-size: var(--font-size-xs);
		}
	}

	@media (max-width: 375px) {
		.summary-card {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-2);
		}

		.loan-stat {
			min-width: 100%;
		}

		.stat-value {
			font-size: var(--font-size-sm);
		}
	}
</style>
