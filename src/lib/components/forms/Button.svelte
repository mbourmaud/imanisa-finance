<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	interface Props extends HTMLButtonAttributes {
		/** Button variant */
		variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
		/** Is the button in loading state */
		loading?: boolean;
		/** Loading text (shown with spinner during loading) */
		loadingText?: string;
		/** Button type */
		type?: 'button' | 'submit' | 'reset';
		/** Is the button disabled */
		disabled?: boolean;
		/** Button content */
		children?: Snippet;
		/** Icon slot (shown before text) */
		icon?: Snippet;
		/** Reference to the button element */
		buttonRef?: HTMLButtonElement | null;
	}

	let {
		variant = 'primary',
		loading = false,
		loadingText,
		type = 'button',
		disabled = false,
		children,
		icon,
		buttonRef = $bindable(null),
		...restProps
	}: Props = $props();

	const isDisabled = $derived(disabled || loading);
</script>

<button
	bind:this={buttonRef}
	{type}
	class="btn btn-{variant}"
	class:loading
	disabled={isDisabled}
	aria-busy={loading}
	{...restProps}
>
	{#if loading}
		<svg class="spinner" viewBox="0 0 24 24" aria-hidden="true">
			<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round">
				<animate attributeName="stroke-dasharray" values="0 63;32 63;63 63;63 63" dur="1s" repeatCount="indefinite"/>
				<animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
			</circle>
		</svg>
		<span class="btn-text">{loadingText || ''}{@render children?.()}</span>
	{:else}
		{#if icon}
			<span class="btn-icon" aria-hidden="true">
				{@render icon()}
			</span>
		{/if}
		{#if children}
			<span class="btn-text">{@render children()}</span>
		{/if}
	{/if}
</button>

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-2);
		padding: var(--spacing-3) var(--spacing-5);
		font-weight: var(--font-weight-semibold);
		font-size: var(--font-size-sm);
		border-radius: var(--radius-xl);
		border: none;
		cursor: pointer;
		transition:
			background-color var(--transition-fast),
			border-color var(--transition-fast),
			box-shadow var(--transition-fast),
			transform var(--transition-fast),
			opacity var(--transition-fast);
		min-height: var(--touch-target-min, 44px);
		min-width: var(--touch-target-min, 44px);
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
		-webkit-user-select: none;
		user-select: none;
		white-space: nowrap;
	}

	.btn:focus-visible {
		outline: 2px solid var(--color-primary-500);
		outline-offset: 2px;
	}

	.btn:active:not(:disabled) {
		transform: scale(0.97);
	}

	@media (prefers-reduced-motion: reduce) {
		.btn:active:not(:disabled) {
			transform: none;
		}
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Variants */
	.btn-primary {
		background: var(--gradient-accent);
		color: white;
		box-shadow: var(--glow-coral);
	}

	.btn-primary:hover:not(:disabled) {
		box-shadow: var(--glow-coral-intense);
		transform: translateY(-1px);
	}

	.btn-secondary {
		background: var(--color-bg-subtle);
		color: var(--color-text-secondary);
		border: 1px solid var(--color-border);
	}

	.btn-secondary:hover:not(:disabled) {
		background: var(--color-bg-muted);
		color: var(--color-text-primary);
		border-color: var(--color-border-hover);
	}

	.btn-danger {
		background: linear-gradient(135deg, #F87171 0%, #EF4444 100%);
		color: white;
	}

	.btn-danger:hover:not(:disabled) {
		box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
		transform: translateY(-1px);
	}

	.btn-ghost {
		background: transparent;
		color: var(--color-text-tertiary);
		padding: var(--spacing-2) var(--spacing-4);
	}

	.btn-ghost:hover:not(:disabled) {
		color: var(--color-text-primary);
		background: var(--color-bg-subtle);
	}

	/* Loading state */
	.loading {
		pointer-events: none;
	}

	.spinner {
		width: 18px;
		height: 18px;
		flex-shrink: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.spinner {
			animation: none;
		}
		.spinner circle {
			stroke-dasharray: 32 63;
		}
	}

	.btn-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		flex-shrink: 0;
	}

	.btn-icon :global(svg) {
		width: 100%;
		height: 100%;
	}

</style>
