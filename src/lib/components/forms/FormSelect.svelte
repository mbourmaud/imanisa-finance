<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';

	interface SelectOption {
		value: string;
		label: string;
		disabled?: boolean;
	}

	interface Props extends Omit<HTMLSelectAttributes, 'value'> {
		/** Unique identifier for the select */
		id: string;
		/** Select name attribute */
		name: string;
		/** Label text */
		label: string;
		/** Current value */
		value?: string;
		/** Options to display */
		options: SelectOption[];
		/** Placeholder text (first disabled option) */
		placeholder?: string;
		/** Validation error message */
		error?: string | null;
		/** Help text shown below select */
		hint?: string;
		/** Is the select required */
		required?: boolean;
		/** Is the select disabled */
		disabled?: boolean;
		/** Reference to the select element */
		selectRef?: HTMLSelectElement | null;
	}

	let {
		id,
		name,
		label,
		value = $bindable(''),
		options,
		placeholder = 'Sélectionnez une option',
		error = null,
		hint,
		required = false,
		disabled = false,
		selectRef = $bindable(null),
		...restProps
	}: Props = $props();

	const hasError = $derived(!!error);
	const errorId = `${id}-error`;
	const hintId = hint ? `${id}-hint` : undefined;
</script>

<div class="form-group" class:has-error={hasError}>
	<label for={id} class="label">
		{label}
		{#if required}
			<span class="required" aria-hidden="true">*</span>
		{/if}
	</label>

	<select
		bind:this={selectRef}
		{id}
		{name}
		bind:value
		{required}
		{disabled}
		class="select"
		class:select-error={hasError}
		aria-invalid={hasError}
		aria-describedby={hasError ? errorId : hintId}
		{...restProps}
	>
		{#if placeholder}
			<option value="" disabled>{placeholder}…</option>
		{/if}
		{#each options as option}
			<option value={option.value} disabled={option.disabled}>
				{option.label}
			</option>
		{/each}
	</select>

	{#if error}
		<div id={errorId} class="error-text" role="alert">
			<svg class="error-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
				<path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 10.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zm.75-3.25a.75.75 0 0 1-1.5 0v-3a.75.75 0 0 1 1.5 0v3z"/>
			</svg>
			{error}
		</div>
	{:else if hint}
		<div id={hintId} class="hint-text">
			{hint}
		</div>
	{/if}
</div>

<style>
	.form-group {
		margin-bottom: var(--spacing-5);
	}

	.label {
		display: block;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-tertiary);
		margin-bottom: var(--spacing-2);
		cursor: pointer;
	}

	.required {
		color: var(--color-danger-500);
		margin-left: var(--spacing-1);
	}

	.select {
		width: 100%;
		padding: var(--spacing-3) var(--spacing-4);
		padding-right: 40px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		background-color: var(--color-bg-elevated);
		color: var(--color-text-primary);
		transition:
			border-color var(--transition-fast),
			box-shadow var(--transition-fast);
		min-height: var(--touch-target-min, 44px);
		font-size: max(16px, 1rem);
		touch-action: manipulation;
		cursor: pointer;
		appearance: none;
		/* Custom dropdown arrow */
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 16px center;
	}

	.select:focus {
		outline: none;
		border-color: var(--color-primary-500);
		box-shadow: 0 0 0 3px rgba(250, 128, 114, 0.15);
	}

	.select:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background-color: var(--color-bg-muted);
	}

	.select-error {
		border-color: var(--color-danger-500);
	}

	.select-error:focus {
		border-color: var(--color-danger-500);
		box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
	}

	/* Style option elements (for Windows compatibility) */
	.select option {
		background-color: var(--color-bg-elevated);
		color: var(--color-text-primary);
	}

	.error-text {
		display: flex;
		align-items: center;
		gap: var(--spacing-2);
		margin-top: var(--spacing-2);
		font-size: var(--font-size-sm);
		color: var(--color-danger-500);
	}

	.error-icon {
		width: 14px;
		height: 14px;
		flex-shrink: 0;
	}

	.hint-text {
		margin-top: var(--spacing-2);
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	.has-error .label {
		color: var(--color-danger-500);
	}
</style>
