<script lang="ts">
	let { data } = $props();
</script>

<div class="container">
	<div class="page-header">
		<h1>Vos banques</h1>
		<a href="/banks/new" class="btn btn-primary">Ajouter une banque</a>
	</div>

	{#if data.banks.length === 0}
		<div class="empty-state card">
			<div class="empty-icon">🏦</div>
			<h2>Aucune banque</h2>
			<p>Ajoutez votre première banque pour commencer.</p>
			<a href="/banks/new" class="btn btn-primary">Ajouter une banque</a>
		</div>
	{:else}
		<div class="banks-grid">
			{#each data.banks as bank}
				<a href="/banks/{bank.id}" class="bank-card card">
					<div class="bank-name">{bank.name}</div>
					<div class="bank-template">{bank.templateLabel}</div>
					<div class="bank-accounts">{bank.accountsCount} compte{bank.accountsCount > 1 ? 's' : ''}</div>
					<div class="bank-balance {bank.totalBalance >= 0 ? 'positive' : 'negative'}">
						{bank.totalBalance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--spacing-10);
		flex-wrap: wrap;
		gap: var(--spacing-4);
		animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
	}

	.page-header h1 {
		font-size: var(--font-size-3xl);
		font-weight: var(--font-weight-bold);
		letter-spacing: -0.03em;
		background: linear-gradient(135deg, var(--color-gray-900) 0%, var(--color-gray-700) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.empty-state {
		text-align: center;
		padding: var(--spacing-16);
		animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s forwards;
		opacity: 0;
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: var(--spacing-6);
		filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));
	}

	.empty-state h2 {
		margin-bottom: var(--spacing-3);
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-gray-800);
	}

	.empty-state p {
		color: var(--color-gray-500);
		margin-bottom: var(--spacing-8);
		font-size: var(--font-size-lg);
	}

	.banks-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: var(--spacing-5);
		animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s forwards;
		opacity: 0;
	}

	.bank-card {
		display: block;
		text-decoration: none;
		color: inherit;
		background: var(--glass-bg);
		backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturation));
		-webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturation));
		border-radius: var(--radius-2xl);
		padding: var(--spacing-6);
		box-shadow: var(--shadow-glass);
		border: 1px solid var(--glass-border);
		transition: 
			transform var(--transition-normal),
			box-shadow var(--transition-normal),
			background var(--transition-fast);
	}

	.bank-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-glass-hover);
		background: var(--glass-bg-hover);
		color: inherit;
	}

	.bank-card:active {
		transform: translateY(-2px) scale(0.99);
	}

	.bank-name {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		margin-bottom: var(--spacing-1);
		color: var(--color-gray-900);
		letter-spacing: -0.01em;
	}

	.bank-template {
		font-size: var(--font-size-sm);
		color: var(--color-gray-500);
		margin-bottom: var(--spacing-4);
	}

	.bank-accounts {
		font-size: var(--font-size-sm);
		color: var(--color-gray-600);
		display: flex;
		align-items: center;
		gap: var(--spacing-2);
	}

	.bank-accounts::before {
		content: '';
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--color-primary-400);
	}

	.bank-balance {
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-bold);
		margin-top: var(--spacing-4);
		letter-spacing: -0.02em;
	}

	.bank-balance.positive {
		color: var(--color-success-600);
	}

	.bank-balance.negative {
		color: var(--color-danger-600);
	}

	@media (max-width: 768px) {
		.page-header {
			margin-bottom: var(--spacing-6);
		}

		.page-header h1 {
			font-size: var(--font-size-2xl);
		}

		.banks-grid {
			grid-template-columns: 1fr;
			gap: var(--spacing-3);
		}

		.bank-card {
			padding: var(--spacing-4);
			border-radius: var(--radius-xl);
		}

		.empty-state {
			padding: var(--spacing-10);
		}
	}

	@media (max-width: 375px) {
		.bank-card {
			padding: var(--spacing-3);
		}

		.bank-balance {
			font-size: var(--font-size-xl);
		}
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(16px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
