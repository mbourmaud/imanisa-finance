<script lang="ts">
	import { enhance } from '$app/forms';
	import { format } from 'date-fns';
	import { fr } from 'date-fns/locale';
	import { Button } from '$lib/components/forms';

	let { data, form } = $props();
	let showDeleteModal = $state(false);
	let showImportModal = $state(false);
	let importing = $state(false);
	let isDeleting = $state(false);

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			if (showDeleteModal) showDeleteModal = false;
			if (showImportModal) showImportModal = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

<div class="container">
	<div class="page-header">
		<div>
			<a href="/banks/{data.bank.id}" class="back-link">← Retour à {data.bank.name}</a>
			<h1>{data.account.name}</h1>
			<p class="account-type">{data.account.typeLabel}</p>
		</div>
		<div class="header-actions">
			<Button variant="primary" onclick={() => showImportModal = true}>
				Importer CSV
			</Button>
			<Button variant="danger" onclick={() => showDeleteModal = true}>
				Supprimer
			</Button>
		</div>
	</div>

	<div class="stats-grid">
		<div class="stat-card">
			<div class="stat-label">Solde</div>
			<div class="stat-value {data.account.balance >= 0 ? 'positive' : 'negative'}">
				{data.account.balance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
			</div>
		</div>
		<div class="stat-card">
			<div class="stat-label">Transactions</div>
			<div class="stat-value">{data.transactions.length}</div>
		</div>
	</div>

	{#if data.transactions.length === 0}
		<div class="empty-state card">
			<div class="empty-icon">📄</div>
			<h2>Aucune transaction</h2>
			<p>Importez vos transactions depuis un fichier CSV.</p>
			<Button variant="primary" onclick={() => showImportModal = true}>
				Importer CSV
			</Button>
		</div>
	{:else}
		<div class="transactions-card card">
			<h2>Transactions</h2>
			<div class="transactions-list">
				{#each data.transactions as tx}
					<div class="transaction-row">
						<div class="transaction-date">
							{format(new Date(tx.date), 'dd MMM yyyy', { locale: fr })}
						</div>
						<div class="transaction-description">{tx.description}</div>
						<div class="transaction-amount {tx.type === 'INCOME' ? 'positive' : 'negative'}">
							{tx.type === 'INCOME' ? '+' : '-'}{tx.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

{#if showDeleteModal}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions a11y_no_noninteractive_element_interactions -->
	<div class="modal-overlay" role="presentation" onclick={() => showDeleteModal = false}>
		<div class="modal card" role="dialog" aria-modal="true" aria-labelledby="delete-account-modal-title" tabindex="-1" onclick={(e) => e.stopPropagation()}>
			<h2 id="delete-account-modal-title">Supprimer ce compte ?</h2>
			<p>Cette action supprimera également toutes les transactions associées.</p>
			<form
				method="POST"
				action="?/deleteAccount"
				use:enhance={() => {
					isDeleting = true;
					return async ({ update }) => {
						await update();
						isDeleting = false;
					};
				}}
			>
				<div class="modal-actions">
					<Button type="button" variant="secondary" onclick={() => showDeleteModal = false}>
						Annuler
					</Button>
					<Button type="submit" variant="danger" loading={isDeleting}>
						Supprimer
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}

{#if showImportModal}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions a11y_no_noninteractive_element_interactions -->
	<div class="modal-overlay" role="presentation" onclick={() => showImportModal = false}>
		<div class="modal card" role="dialog" aria-modal="true" aria-labelledby="import-modal-title" tabindex="-1" onclick={(e) => e.stopPropagation()}>
			<h2 id="import-modal-title">Importer des transactions</h2>
			<p>Sélectionnez un fichier CSV exporté depuis {data.bank.templateLabel}.</p>
			<form
				method="POST"
				action="?/importCsv"
				enctype="multipart/form-data"
				use:enhance={() => {
					importing = true;
					return async ({ update }) => {
						importing = false;
						await update();
						if (!form?.importError) {
							showImportModal = false;
						}
					};
				}}
			>
				{#if form?.importError}
					<div class="error-message" role="alert">{form.importError}</div>
				{/if}
				{#if form?.importSuccess}
					<div class="success-message" role="status">{form.importSuccess}</div>
				{/if}
				<div class="form-group">
					<label for="csvFile" class="label">Fichier CSV</label>
					<input
						type="file"
						id="csvFile"
						name="file"
						accept=".csv"
						class="input"
						required
					/>
				</div>
				<div class="modal-actions">
					<Button type="button" variant="secondary" onclick={() => showImportModal = false}>
						Annuler
					</Button>
					<Button type="submit" variant="primary" loading={importing}>
						Importer
					</Button>
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

	.account-type {
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

	.transactions-card {
		animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s forwards;
		opacity: 0;
	}

	.transactions-card h2 {
		margin-bottom: var(--spacing-6);
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-gray-800);
	}

	.transactions-list {
		display: flex;
		flex-direction: column;
	}

	.transaction-row {
		display: grid;
		grid-template-columns: 110px 1fr auto;
		gap: var(--spacing-4);
		padding: var(--spacing-4);
		margin: 0 calc(-1 * var(--spacing-4));
		border-radius: var(--radius-xl);
		align-items: center;
		transition: background var(--transition-fast);
	}

	.transaction-row:hover {
		background: rgba(250, 128, 114, 0.05);
	}

	.transaction-row + .transaction-row {
		border-top: 1px solid rgba(0, 0, 0, 0.04);
	}

	.transaction-date {
		font-size: var(--font-size-sm);
		color: var(--color-gray-500);
		font-weight: var(--font-weight-medium);
	}

	.transaction-description {
		font-size: var(--font-size-sm);
		color: var(--color-gray-700);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.transaction-amount {
		font-weight: var(--font-weight-semibold);
		text-align: right;
		font-size: var(--font-size-base);
	}

	.transaction-amount.positive {
		color: var(--color-success-600);
	}

	.transaction-amount.negative {
		color: var(--color-danger-600);
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
		margin-bottom: var(--spacing-3);
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

	.success-message {
		background: rgba(52, 211, 153, 0.15);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		color: var(--color-success-600);
		padding: var(--spacing-4);
		border-radius: var(--radius-xl);
		margin-bottom: var(--spacing-5);
		border: 1px solid rgba(16, 185, 129, 0.2);
	}

	input[type="file"] {
		padding: var(--spacing-3);
	}

	input[type="file"]::file-selector-button {
		background: var(--gradient-accent);
		color: white;
		border: none;
		padding: var(--spacing-2) var(--spacing-4);
		border-radius: var(--radius-lg);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		margin-right: var(--spacing-3);
		transition: all var(--transition-fast);
	}

	input[type="file"]::file-selector-button:hover {
		filter: brightness(1.05);
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

		.modal-actions {
			flex-direction: column-reverse;
		}

		.modal-actions :global(button) {
			width: 100%;
		}
	}

	@media (max-width: 640px) {
		.transaction-row {
			grid-template-columns: 1fr auto;
			padding: var(--spacing-3) var(--spacing-4);
		}

		.transaction-date {
			grid-column: 1 / -1;
			margin-bottom: var(--spacing-1);
			font-size: var(--font-size-xs);
		}

		.transaction-description {
			font-size: var(--font-size-sm);
		}

		.transaction-amount {
			font-size: var(--font-size-sm);
		}
	}
</style>
