<script lang="ts">
	/**
	 * PeriodFilter - Composant de sélection de période
	 * Permet de filtrer les données par période temporelle
	 */
	interface Props {
		value: string;
		onchange: (value: string) => void;
	}

	let { value, onchange }: Props = $props();

	const periods = [
		{ value: '1J', label: '1J' },
		{ value: '7J', label: '7J' },
		{ value: '1M', label: '1M' },
		{ value: 'YTD', label: 'YTD' },
		{ value: '1A', label: '1A' },
		{ value: 'ALL', label: 'TOUT' }
	];
</script>

<div class="period-filter">
	{#each periods as period}
		<button
			class="period-btn"
			class:active={value === period.value}
			onclick={() => onchange(period.value)}
		>
			{period.label}
		</button>
	{/each}
</div>

<style>
	.period-filter {
		display: flex;
		gap: var(--spacing-1);
		background: var(--color-bg-elevated);
		padding: var(--spacing-1);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
	}

	.period-btn {
		padding: var(--spacing-1-5) var(--spacing-3);
		border-radius: var(--radius-md);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-muted);
		background: transparent;
		transition: all var(--transition-fast);
	}

	.period-btn:hover {
		color: var(--color-text-secondary);
		background: var(--color-bg-subtle);
	}

	.period-btn.active {
		background: var(--color-bg-card);
		color: var(--color-primary-500);
	}

	@media (max-width: 640px) {
		.period-filter {
			flex-wrap: wrap;
		}

		.period-btn {
			padding: var(--spacing-1-5) var(--spacing-2);
		}
	}
</style>
