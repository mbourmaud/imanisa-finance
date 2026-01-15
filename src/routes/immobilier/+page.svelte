<script lang="ts">
	import { PropertyCard } from '$lib/components/real-estate';
	import type { PropertyWithLoan, RealEstateSummary } from '@lib/types/real-estate';

	interface PageData {
		summary: RealEstateSummary;
		properties: PropertyWithLoan[];
	}

	let { data }: { data: PageData } = $props();

	function formatCurrency(value: number): string {
		return value.toLocaleString('fr-FR', {
			style: 'currency',
			currency: 'EUR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		});
	}

	function formatFullDate(): string {
		return new Date().toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}
</script>

<div class="immobilier-page">
	<header class="page-header">
		<div class="header-left">
			<h1>Immobilier</h1>
			<span class="header-date">{formatFullDate()}</span>
		</div>
	</header>

	<section class="kpi-section">
		<div class="kpi-cards">
			<div class="kpi-card">
				<div class="kpi-icon gold">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
						<polyline points="9 22 9 12 15 12 15 22"/>
					</svg>
				</div>
				<div class="kpi-content">
					<span class="kpi-label">Valeur totale</span>
					<span class="kpi-value">{formatCurrency(data.summary.totalValue)}</span>
					<span class="kpi-sub">{data.summary.propertyCount} bien{data.summary.propertyCount > 1 ? 's' : ''}</span>
				</div>
			</div>

			<div class="kpi-card">
				<div class="kpi-icon danger">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M12 2v20M2 12h20"/>
					</svg>
				</div>
				<div class="kpi-content">
					<span class="kpi-label">Dette totale</span>
					<span class="kpi-value text-danger">-{formatCurrency(data.summary.totalDebt)}</span>
					<span class="kpi-sub">Capital restant dû</span>
				</div>
			</div>

			<div class="kpi-card highlight">
				<div class="kpi-icon success">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
						<polyline points="16 7 22 7 22 13"/>
					</svg>
				</div>
				<div class="kpi-content">
					<span class="kpi-label">Equity nette</span>
					<span class="kpi-value text-success">{formatCurrency(data.summary.netEquity)}</span>
					<span class="kpi-sub">Valeur - Dette</span>
				</div>
			</div>
		</div>
	</section>

	<section class="properties-section">
		<div class="section-header">
			<h2 class="section-title">Mes biens</h2>
			<span class="property-count">{data.properties.length} bien{data.properties.length > 1 ? 's' : ''}</span>
		</div>

		{#if data.properties.length > 0}
			<div class="properties-grid">
				{#each data.properties as property}
					<PropertyCard {property} />
				{/each}
			</div>
		{:else}
			<div class="empty-state">
				<div class="empty-icon">
					<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
						<polyline points="9 22 9 12 15 12 15 22"/>
					</svg>
				</div>
				<span class="empty-text">Aucun bien immobilier</span>
				<span class="empty-sub">Ajoutez votre premier bien pour commencer</span>
			</div>
		{/if}
	</section>
</div>

<style>
	.immobilier-page {
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

	.header-date {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	.kpi-section {
		animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s forwards;
		opacity: 0;
	}

	.kpi-cards {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--spacing-4);
	}

	.kpi-card {
		background: var(--color-bg-card);
		border-radius: var(--radius-xl);
		border: 1px solid var(--color-border);
		padding: var(--spacing-5);
		display: flex;
		align-items: flex-start;
		gap: var(--spacing-4);
		transition:
			background-color var(--transition-fast),
			border-color var(--transition-fast);
	}

	.kpi-card:hover {
		background: var(--color-bg-card-hover);
		border-color: var(--color-border-hover);
	}

	.kpi-card.highlight {
		background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%);
		border-color: rgba(16, 185, 129, 0.2);
	}

	.kpi-icon {
		width: 48px;
		height: 48px;
		border-radius: var(--radius-lg);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.kpi-icon.gold {
		background: rgba(212, 168, 83, 0.1);
		color: var(--color-gold-500);
	}

	.kpi-icon.danger {
		background: var(--color-danger-50);
		color: var(--color-danger-500);
	}

	.kpi-icon.success {
		background: rgba(16, 185, 129, 0.1);
		color: var(--color-success-500);
	}

	.kpi-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-1);
	}

	.kpi-label {
		font-size: var(--font-size-sm);
		color: var(--color-text-tertiary);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-caps);
	}

	.kpi-value {
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-primary);
	}

	.kpi-sub {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	.text-danger {
		color: var(--color-danger-500);
	}

	.text-success {
		color: var(--color-success-500);
	}

	.properties-section {
		animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s forwards;
		opacity: 0;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-4);
	}

	.section-title {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.property-count {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		background: var(--color-bg-subtle);
		padding: var(--spacing-1) var(--spacing-3);
		border-radius: var(--radius-full);
	}

	.properties-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
		gap: var(--spacing-4);
	}

	.empty-state {
		background: var(--color-bg-card);
		border-radius: var(--radius-xl);
		border: 1px dashed var(--color-border);
		padding: var(--spacing-12);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-3);
	}

	.empty-icon {
		color: var(--color-text-muted);
		opacity: 0.5;
	}

	.empty-text {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-secondary);
	}

	.empty-sub {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	@media (max-width: 1024px) {
		.kpi-cards {
			grid-template-columns: repeat(2, 1fr);
		}

		.kpi-card:last-child {
			grid-column: span 2;
		}
	}

	@media (max-width: 768px) {
		.immobilier-page {
			gap: var(--spacing-6);
		}

		.page-header h1 {
			font-size: var(--font-size-2xl);
		}

		.kpi-cards {
			grid-template-columns: 1fr;
			gap: var(--spacing-3);
		}

		.kpi-card:last-child {
			grid-column: auto;
		}

		.kpi-card {
			padding: var(--spacing-4);
		}

		.kpi-icon {
			width: 40px;
			height: 40px;
		}

		.kpi-value {
			font-size: var(--font-size-xl);
		}

		.section-title {
			font-size: var(--font-size-base);
		}

		.properties-grid {
			grid-template-columns: 1fr;
		}

		.empty-state {
			padding: var(--spacing-8);
		}
	}

	@media (max-width: 375px) {
		.kpi-icon {
			width: 36px;
			height: 36px;
		}

		.kpi-value {
			font-size: var(--font-size-lg);
		}

		.kpi-label {
			font-size: var(--font-size-xs);
		}
	}
</style>
