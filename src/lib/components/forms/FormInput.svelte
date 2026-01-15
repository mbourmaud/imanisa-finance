<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	type AutocompleteValue = HTMLInputAttributes['autocomplete'];

	interface Props {
		/** Unique identifier for the input */
		id: string;
		/** Input name attribute */
		name: string;
		/** Label text */
		label: string;
		/** Current value */
		value?: string | number;
		/** Input type */
		type?: 'text' | 'email' | 'tel' | 'number' | 'password' | 'url' | 'search';
		/** Placeholder text with format example */
		placeholder?: string;
		/** Autocomplete attribute */
		autocomplete?: AutocompleteValue;
		/** Input mode for mobile keyboards */
		inputmode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
		/** Validation error message */
		error?: string | null;
		/** Help text shown below input */
		hint?: string;
		/** Is the input required */
		required?: boolean;
		/** Is the input disabled */
		disabled?: boolean;
		/** Minimum value (for number inputs) */
		min?: number | string;
		/** Maximum value (for number inputs) */
		max?: number | string;
		/** Step value (for number inputs) */
		step?: number | string;
		/** Pattern for validation */
		pattern?: string;
		/** Minimum length */
		minlength?: number;
		/** Maximum length */
		maxlength?: number;
		/** Reference to the input element */
		inputRef?: HTMLInputElement | null;
	}

	let {
		id,
		name,
		label,
		value = $bindable(''),
		type = 'text',
		placeholder = '',
		autocomplete,
		inputmode,
		error = null,
		hint,
		required = false,
		disabled = false,
		min,
		max,
		step,
		pattern,
		minlength,
		maxlength,
		inputRef = $bindable(null),
		...restProps
	}: Props = $props();

	// Common field names to autocomplete mappings
	const autoMap: Record<string, AutocompleteValue> = {
		'email': 'email',
		'phone': 'tel',
		'tel': 'tel',
		'name': 'name',
		'firstName': 'given-name',
		'lastName': 'family-name',
		'password': 'current-password',
		'newPassword': 'new-password',
		'username': 'username',
		'address': 'street-address',
		'city': 'address-level2',
		'zip': 'postal-code',
		'country': 'country-name',
	};

	// Determine appropriate inputmode based on type if not specified
	const computedInputmode = $derived.by(() => {
		if (inputmode) return inputmode;
		switch (type) {
			case 'email': return 'email';
			case 'tel': return 'tel';
			case 'url': return 'url';
			case 'number': return 'decimal';
			case 'search': return 'search';
			default: return 'text';
		}
	});

	// Determine appropriate autocomplete based on type/name if not specified
	const computedAutocomplete = $derived.by((): AutocompleteValue => {
		if (autocomplete) return autocomplete;
		return autoMap[name] ?? 'off';
	});

	const hasError = $derived(!!error);
	const inputId = id;
	const errorId = `${id}-error`;
	const hintId = hint ? `${id}-hint` : undefined;
</script>

<div class="form-group" class:has-error={hasError}>
	<label for={inputId} class="label">
		{label}
		{#if required}
			<span class="required" aria-hidden="true">*</span>
		{/if}
	</label>

	<input
		bind:this={inputRef}
		{id}
		{name}
		{type}
		bind:value
		placeholder={placeholder ? `${placeholder}…` : undefined}
		autocomplete={computedAutocomplete}
		inputmode={computedInputmode}
		{required}
		{disabled}
		{min}
		{max}
		{step}
		{pattern}
		{minlength}
		{maxlength}
		class="input"
		class:input-error={hasError}
		aria-invalid={hasError}
		aria-describedby={hasError ? errorId : hintId}
		{...restProps}
	/>

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
		/* Make label + input same hit target when clicking */
	}

	.required {
		color: var(--color-danger-500);
		margin-left: var(--spacing-1);
	}

	.input {
		width: 100%;
		padding: var(--spacing-3) var(--spacing-4);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		background: var(--color-bg-elevated);
		color: var(--color-text-primary);
		transition:
			border-color var(--transition-fast),
			box-shadow var(--transition-fast);
		min-height: var(--touch-target-min, 44px);
		font-size: max(16px, 1rem);
		touch-action: manipulation;
	}

	.input::placeholder {
		color: var(--color-text-muted);
	}

	.input:focus {
		outline: none;
		border-color: var(--color-primary-500);
		box-shadow: 0 0 0 3px rgba(250, 128, 114, 0.15);
	}

	.input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background: var(--color-bg-muted);
	}

	.input-error {
		border-color: var(--color-danger-500);
	}

	.input-error:focus {
		border-color: var(--color-danger-500);
		box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
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

	/* Focus state for has-error class (parent highlight) */
	.has-error .label {
		color: var(--color-danger-500);
	}
</style>
