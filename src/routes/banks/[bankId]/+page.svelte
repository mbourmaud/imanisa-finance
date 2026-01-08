<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();
	let showDeleteModal = $state(false);
	let showAddAccountModal = $state(false);
</script>

<div class="container">
	<div class="page-header">
		<div>
			<a href="/banks" class="back-link">← Retour aux banques</a>
			<h1>{data.bank.name}</h1>
			<p class="bank-template">{data.bank.templateLabel}</p>
		</div>
		<div class="header-actions">
			<button class="btn btn-primary" onclick={() => showAddAccountModal = true}>
				Ajouter un compte
			</button>
			<button class="btn btn-danger" onclick={() => showDeleteModal = true}>
				Supprimer
			</button>
		</div>
	</div>

	<div class="stats-grid">
		<div class="stat-card">
			<div class="stat-label">Solde total</div>
			<div class="stat-value {data.bank.totalBalance >= 0 ? 'positive' : 'negative'}">
				{data.bank.totalBalance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
			</div>
		</div>
		<div class="stat-card">
			<div class="stat-label">Comptes</div>
			<div class="stat-value">{data.accounts.length}</div>
		</div>
	</div>

	{#if data.accounts.length === 0}
		<div class="empty-state card">
			<div class="empty-icon">💳</div>
			<h2>Aucun compte</h2>
			<p>Ajoutez votre premier compte pour cette banque.</p>
			<button class="btn btn-primary" onclick={() => showAddAccountModal = true}>
				Ajouter un compte
			</button>
		</div>
	{:else}
		<div class="accounts-grid">
			{#each data.accounts as account}
				<a href="/banks/{data.bank.id}/accounts/{account.id}" class="account-card card">
					<div class="account-type-badge">{account.typeLabel}</div>
					<div class="account-name">{account.name}</div>
					<div class="account-balance {account.balance >= 0 ? 'positive' : 'negative'}">
						{account.balance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
					</div>
					<div class="account-transactions">{account.transactionsCount} transactions</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

{#if showDeleteModal}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions a11y_no_noninteractive_element_interactions -->
	<div class="modal-overlay" role="presentation" onclick={() => showDeleteModal = false}>
		<div class="modal card" role="dialog" aria-modal="true" tabindex="-1" onclick={(e) => e.stopPropagation()}>
			<h2>Supprimer cette banque ?</h2>
			<p>Cette action supprimera également tous les comptes et transactions associés.</p>
			<form method="POST" action="?/deleteBank" use:enhance>
				<div class="modal-actions">
					<button type="button" class="btn btn-secondary" onclick={() => showDeleteModal = false}>
						Annuler
					</button>
					<button type="submit" class="btn btn-danger">Supprimer</button>
				</div>
			</form>
		</div>
	</div>
{/if}

{#if showAddAccountModal}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions a11y_no_noninteractive_element_interactions -->
	<div class="modal-overlay" role="presentation" onclick={() => showAddAccountModal = false}>
		<div class="modal card" role="dialog" aria-modal="true" tabindex="-1" onclick={(e) => e.stopPropagation()}>
			<h2>Ajouter un compte</h2>
			<form method="POST" action="?/addAccount" use:enhance>
				{#if form?.accountError}
					<div class="error-message">{form.accountError}</div>
				{/if}
				<div class="form-group">
					<label for="accountName" class="label">Nom du compte</label>
					<input
						type="text"
						id="accountName"
						name="name"
						class="input"
						placeholder="ex: Compte courant"
						required
					/>
				</div>
				<div class="form-group">
					<label for="accountType" class="label">Type de compte</label>
					<select id="accountType" name="type" class="input" required>
						<option value="">Sélectionnez un type</option>
						{#each data.accountTypes as type}
							<option value={type.value}>{type.label}</option>
						{/each}
					</select>
				</div>
				<div class="form-group">
					<label for="initialBalance" class="label">Solde initial (optionnel)</label>
					<input
						type="number"
						id="initialBalance"
						name="initialBalance"
						class="input"
						placeholder="0.00"
						step="0.01"
					/>
				</div>
				<div class="modal-actions">
					<button type="button" class="btn btn-secondary" onclick={() => showAddAccountModal = false}>
						Annuler
					</button>
					<button type="submit" class="btn btn-primary">Créer</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
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

	.back-link {
		font-size: var(--font-size-sm);
		color: var(--color-gray-500);
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-1);
		margin-bottom: var(--spacing-3);
		padding: var(--spacing-2) var(--spacing-3);
		border-radius: var(--radius-lg);
		transition: all var(--transition-fast);
	}

	.back-link:hover {
		color: var(--color-primary-600);
		background: rgba(250, 128, 114, 0.1);
	}

	.bank-template {
		color: var(--color-gray-500);
		font-size: var(--font-size-lg);
		margin-top: var(--spacing-1);
	}

	.header-actions {
		display: flex;
		gap: var(--spacing-3);
		flex-wrap: wrap;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--spacing-5);
		margin-bottom: var(--spacing-10);
		animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s forwards;
		opacity: 0;
	}

	.stat-card {
		background: var(--glass-bg);
		backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturation));
		-webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturation));
		border-radius: var(--radius-2xl);
		padding: var(--spacing-6);
		box-shadow: var(--shadow-glass);
		border: 1px solid var(--glass-border);
		transition: 
			transform var(--transition-normal),
			box-shadow var(--transition-normal);
	}

	.stat-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-glass-hover);
	}

	.stat-label {
		font-size: var(--font-size-sm);
		color: var(--color-gray-500);
		margin-bottom: var(--spacing-2);
		font-weight: var(--font-weight-medium);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.stat-value {
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-bold);
		letter-spacing: -0.02em;
	}

	.stat-value.positive {
		color: var(--color-success-600);
	}

	.stat-value.negative {
		color: var(--color-danger-600);
	}

	.empty-state {
		text-align: center;
		padding: var(--spacing-16);
		animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s forwards;
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

	.accounts-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: var(--spacing-5);
		animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s forwards;
		opacity: 0;
	}

	.account-card {
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

	.account-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-glass-hover);
		background: var(--glass-bg-hover);
		color: inherit;
	}

	.account-card:active {
		transform: translateY(-2px) scale(0.99);
	}

	.account-type-badge {
		display: inline-block;
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		background: linear-gradient(135deg, rgba(250, 128, 114, 0.15) 0%, rgba(255, 127, 107, 0.15) 100%);
		color: var(--color-primary-600);
		padding: var(--spacing-1) var(--spacing-3);
		border-radius: var(--radius-full);
		margin-bottom: var(--spacing-3);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.account-name {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		margin-bottom: var(--spacing-3);
		color: var(--color-gray-900);
		letter-spacing: -0.01em;
	}

	.account-balance {
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-bold);
		letter-spacing: -0.02em;
	}

	.account-balance.positive {
		color: var(--color-success-600);
	}

	.account-balance.negative {
		color: var(--color-danger-600);
	}

	.account-transactions {
		font-size: var(--font-size-sm);
		color: var(--color-gray-500);
		margin-top: var(--spacing-3);
		display: flex;
		align-items: center;
		gap: var(--spacing-2);
	}

	.account-transactions::before {
		content: '';
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--color-gray-400);
	}

	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: var(--spacing-4);
		animation: fadeIn 0.2s ease forwards;
	}

	.modal {
		width: 100%;
		max-width: 480px;
		animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
	}

	.modal h2 {
		margin-bottom: var(--spacing-4);
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-semibold);
	}

	.modal p {
		color: var(--color-gray-600);
		margin-bottom: var(--spacing-6);
	}

	.modal-actions {
		display: flex;
		gap: var(--spacing-3);
		justify-content: flex-end;
		margin-top: var(--spacing-8);
	}

	.form-group {
		margin-bottom: var(--spacing-5);
	}

	.error-message {
		background: rgba(248, 113, 113, 0.15);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		color: var(--color-danger-600);
		padding: var(--spacing-4);
		border-radius: var(--radius-xl);
		margin-bottom: var(--spacing-5);
		border: 1px solid rgba(239, 68, 68, 0.2);
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

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes scaleIn {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@media (max-width: 768px) {
		.page-header h1 {
			font-size: var(--font-size-2xl);
		}

		.header-actions {
			width: 100%;
			justify-content: flex-start;
		}

		.accounts-grid {
			grid-template-columns: 1fr;
		}

		.modal-actions {
			flex-direction: column-reverse;
		}

		.modal-actions .btn {
			width: 100%;
		}
	}
</style>
