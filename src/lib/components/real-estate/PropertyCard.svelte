<script lang="ts">
	import type { PropertyWithLoan } from '@lib/types/real-estate';

	interface Props {
		property: PropertyWithLoan;
	}

	let { property }: Props = $props();

	function formatCurrency(value: number): string {
		return value.toLocaleString('fr-FR', {
			style: 'currency',
			currency: 'EUR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		});
	}

	function getPropertyTypeIcon(type: string): string {
		switch (type) {
			case 'apartment':
				return 'apartment';
			case 'house':
				return 'house';
			case 'parking':
				return 'parking';
			case 'land':
				return 'land';
			case 'commercial':
				return 'commercial';
			default:
				return 'apartment';
		}
	}

	function getPropertyTypeLabel(type: string): string {
		switch (type) {
			case 'apartment':
				return 'Appartement';
			case 'house':
				return 'Maison';
			case 'parking':
				return 'Parking';
			case 'land':
				return 'Terrain';
			case 'commercial':
				return 'Local commercial';
			default:
				return type;
		}
	}

	function getDPEColor(rating: string | null): string {
		switch (rating) {
			case 'A':
				return '#319834';
			case 'B':
				return '#33cc31';
			case 'C':
				return '#cbfc34';
			case 'D':
				return '#fbfe06';
			case 'E':
				return '#fbcc05';
			case 'F':
				return '#f99b03';
			case 'G':
				return '#f63001';
			default:
				return 'var(--color-text-muted)';
		}
	}
</script>

<a href="/immobilier/{property.id}" class="property-card">
	<div class="property-header">
		<div class="property-icon">
			{#if getPropertyTypeIcon(property.type) === 'apartment'}
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<rect x="4" y="2" width="16" height="20" rx="2"/>
					<path d="M9 22V12h6v10"/>
					<path d="M8 6h.01"/>
					<path d="M16 6h.01"/>
					<path d="M8 10h.01"/>
					<path d="M16 10h.01"/>
				</svg>
			{:else if getPropertyTypeIcon(property.type) === 'house'}
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
					<polyline points="9 22 9 12 15 12 15 22"/>
				</svg>
			{:else if getPropertyTypeIcon(property.type) === 'parking'}
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<rect x="3" y="3" width="18" height="18" rx="2"/>
					<path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>
				</svg>
			{:else}
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
					<polyline points="9 22 9 12 15 12 15 22"/>
				</svg>
			{/if}
		</div>
		<div class="property-info">
			<span class="property-name">{property.name}</span>
			<span class="property-address">{property.address}, {property.city}</span>
		</div>
	</div>

	<div class="property-details">
		<div class="detail-item">
			<span class="detail-label">Surface</span>
			<span class="detail-value">{property.surfaceM2} m²</span>
		</div>
		<div class="detail-item">
			<span class="detail-label">Pièces</span>
			<span class="detail-value">{property.rooms ?? '-'}</span>
		</div>
		{#if property.dpeRating}
			<div class="detail-item">
				<span class="detail-label">DPE</span>
				<span class="dpe-badge" style="background-color: {getDPEColor(property.dpeRating)}">
					{property.dpeRating}
				</span>
			</div>
		{/if}
	</div>

	<div class="property-footer">
		<div class="value-section">
			<span class="value-label">Valeur</span>
			<span class="value-amount">{formatCurrency(property.estimatedValue ?? property.purchasePrice ?? 0)}</span>
		</div>
		{#if property.loan}
			<div class="loan-section">
				<span class="loan-label">CRD</span>
				<span class="loan-amount">{formatCurrency(property.loan.currentBalance ?? 0)}</span>
			</div>
		{/if}
	</div>
</a>

<style>
	.property-card {
		background: var(--color-bg-card);
		border-radius: var(--radius-xl);
		border: 1px solid var(--color-border);
		padding: var(--spacing-5);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-4);
		transition: all var(--transition-fast);
		text-decoration: none;
		color: inherit;
	}

	.property-card:hover {
		background: var(--color-bg-card-hover);
		border-color: var(--color-border-hover);
		transform: translateY(-2px);
	}

	.property-header {
		display: flex;
		align-items: flex-start;
		gap: var(--spacing-4);
	}

	.property-icon {
		width: 48px;
		height: 48px;
		border-radius: var(--radius-lg);
		background: rgba(212, 168, 83, 0.1);
		color: var(--color-gold-500);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.property-info {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-1);
		min-width: 0;
		flex: 1;
	}

	.property-name {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.property-address {
		font-size: var(--font-size-sm);
		color: var(--color-text-tertiary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.property-details {
		display: flex;
		gap: var(--spacing-4);
		padding-top: var(--spacing-3);
		border-top: 1px solid var(--color-border);
	}

	.detail-item {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-1);
	}

	.detail-label {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-caps);
	}

	.detail-value {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-secondary);
	}

	.dpe-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		border-radius: var(--radius-md);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-bold);
		color: #000;
	}

	.property-footer {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		padding-top: var(--spacing-3);
		border-top: 1px solid var(--color-border);
	}

	.value-section,
	.loan-section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-1);
	}

	.value-label,
	.loan-label {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-caps);
	}

	.value-amount {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-primary);
	}

	.loan-amount {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-danger-500);
	}

	@media (max-width: 768px) {
		.property-card {
			padding: var(--spacing-4);
		}

		.property-icon {
			width: 40px;
			height: 40px;
		}

		.property-name {
			font-size: var(--font-size-sm);
		}

		.property-address {
			font-size: var(--font-size-xs);
		}

		.property-details {
			flex-wrap: wrap;
			gap: var(--spacing-3);
		}

		.value-amount {
			font-size: var(--font-size-base);
		}
	}
</style>
