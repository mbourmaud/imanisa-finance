<script lang="ts">
	import { enhance } from '$app/forms';
	import { BankTemplate, BankTemplateLabels } from '@domain/bank/BankTemplate';
	import { FormInput, FormSelect, Button } from '$lib/components/forms';

	let { form } = $props();

	let isSubmitting = $state(false);
	let nameValue = $state(form?.name ?? '');
	let templateValue = $state(form?.template ?? '');
	let nameInputRef: HTMLInputElement | null = $state(null);

	const templates = Object.entries(BankTemplateLabels).map(([value, label]) => ({
		value,
		label
	}));

	// Focus on first error after submit
	$effect(() => {
		if (form?.error && nameInputRef) {
			nameInputRef.focus();
		}
	});
</script>

<div class="container">
	<div class="page-header">
		<a href="/banks" class="back-link">← Retour</a>
		<h1>Ajouter une banque</h1>
	</div>

	<div class="form-card card">
		<form
			method="POST"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ update }) => {
					await update();
					isSubmitting = false;
				};
			}}
		>
			{#if form?.error}
				<div class="error-message" role="alert">{form.error}</div>
			{/if}

			<FormInput
				id="name"
				name="name"
				label="Nom de la banque"
				bind:value={nameValue}
				placeholder="ex: Ma Caisse d'Épargne"
				autocomplete="organization"
				required
				bind:inputRef={nameInputRef}
			/>

			<FormSelect
				id="template"
				name="template"
				label="Type de banque"
				bind:value={templateValue}
				options={templates}
				placeholder="Sélectionnez un type"
				required
			/>

			<div class="form-actions">
				<a href="/banks" class="btn btn-secondary">Annuler</a>
				<Button type="submit" variant="primary" loading={isSubmitting}>
					Créer
				</Button>
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
		transition:
			color var(--transition-fast),
			background-color var(--transition-fast);
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
