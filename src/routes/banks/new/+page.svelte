<script lang="ts">
	import { enhance } from '$app/forms';
	import { BankTemplate, BankTemplateLabels } from '@domain/bank/BankTemplate';

	let { form } = $props();

	const templates = Object.entries(BankTemplateLabels).map(([value, label]) => ({
		value,
		label
	}));
</script>

<div class="container">
	<div class="page-header">
		<a href="/banks" class="back-link">← Retour</a>
		<h1>Ajouter une banque</h1>
	</div>

	<div class="form-card card">
		<form method="POST" use:enhance>
			{#if form?.error}
				<div class="error-message">{form.error}</div>
			{/if}

			<div class="form-group">
				<label for="name" class="label">Nom de la banque</label>
				<input
					type="text"
					id="name"
					name="name"
					class="input"
					placeholder="ex: Ma Caisse d'Épargne"
					required
					value={form?.name ?? ''}
				/>
			</div>

			<div class="form-group">
				<label for="template" class="label">Type de banque</label>
				<select id="template" name="template" class="input" required>
					<option value="">Sélectionnez un type</option>
					{#each templates as template}
						<option value={template.value} selected={form?.template === template.value}>
							{template.label}
						</option>
					{/each}
				</select>
			</div>

			<div class="form-actions">
				<a href="/banks" class="btn btn-secondary">Annuler</a>
				<button type="submit" class="btn btn-primary">Créer</button>
			</div>
		</form>
	</div>
</div>

<style>
	.page-header {
		margin-bottom: var(--spacing-10);
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

	.form-card {
		max-width: 500px;
		animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s forwards;
		opacity: 0;
	}

	.form-group {
		margin-bottom: var(--spacing-6);
	}

	.form-actions {
		display: flex;
		gap: var(--spacing-3);
		justify-content: flex-end;
		margin-top: var(--spacing-8);
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

	select.input {
		cursor: pointer;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 16px center;
		padding-right: 40px;
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

	@media (max-width: 640px) {
		.page-header h1 {
			font-size: var(--font-size-2xl);
		}

		.form-actions {
			flex-direction: column-reverse;
		}

		.form-actions .btn {
			width: 100%;
		}
	}
</style>
