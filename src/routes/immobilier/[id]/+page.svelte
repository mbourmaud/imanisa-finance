<script lang="ts">
	import type { PropertyWithDetails, Entity } from '@lib/types/real-estate';
	import { AmortizationTable } from '@lib/components/real-estate';
	import { calculateAmortizationSchedule, getCurrentMonthIndex } from '@lib/utils/loan-calculator';

	interface PageData {
		property: PropertyWithDetails;
	}

	let { data }: { data: PageData } = $props();

	// Collapsible section states for mobile
	let expandedSections = $state<Record<string, boolean>>({
		info: true,
		value: true,
		loan: false,
		amortization: false,
		owners: false
	});

	function toggleSection(section: string) {
		expandedSections[section] = !expandedSections[section];
	}

	// Check if on mobile (for conditional rendering)
	let isMobile = $state(false);

	$effect(() => {
		if (typeof window !== 'undefined') {
			const checkMobile = () => {
				isMobile = window.innerWidth < 769;
			};
			checkMobile();
			window.addEventListener('resize', checkMobile);
			return () => window.removeEventListener('resize', checkMobile);
		}
	});

	function formatCurrency(value: number | null): string {
		if (value === null) return '-';
		return value.toLocaleString('fr-FR', {
			style: 'currency',
			currency: 'EUR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		});
	}

	function formatCurrencyWithDecimals(value: number | null): string {
		if (value === null) return '-';
		return value.toLocaleString('fr-FR', {
			style: 'currency',
			currency: 'EUR',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
	}

	function formatPercent(value: number | null): string {
		if (value === null) return '-';
		return value.toLocaleString('fr-FR', {
			style: 'percent',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
	}

	function formatRate(value: number | null): string {
		if (value === null) return '-';
		return (value / 100).toLocaleString('fr-FR', {
			style: 'percent',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
	}

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '-';
		return new Date(dateStr).toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}

	function getDPEColor(rating: string | null): string {
		switch (rating) {
			case 'A': return '#319834';
			case 'B': return '#33cc31';
			case 'C': return '#cbfc34';
			case 'D': return '#fbfe06';
			case 'E': return '#fbcc05';
			case 'F': return '#f99b03';
			case 'G': return '#f63001';
			default: return 'var(--color-text-muted)';
		}
	}

	function getPropertyTypeLabel(type: string): string {
		switch (type) {
			case 'apartment': return 'Appartement';
			case 'house': return 'Maison';
			case 'parking': return 'Parking';
			case 'land': return 'Terrain';
			case 'commercial': return 'Local commercial';
			default: return type;
		}
	}

	function getCategoryLabel(category: string): string {
		switch (category) {
			case 'primary_residence': return 'Résidence principale';
			case 'rental_furnished': return 'Location meublée';
			case 'rental_unfurnished': return 'Location nue';
			case 'secondary': return 'Résidence secondaire';
			case 'sci': return 'SCI';
			default: return category;
		}
	}

	function getAcquisitionTypeLabel(type: string | null): string {
		switch (type) {
			case 'purchase': return 'Achat';
			case 'inheritance': return 'Héritage';
			case 'donation': return 'Donation';
			case 'partition': return 'Partage';
			default: return type ?? '-';
		}
	}

	function getEntityColor(entity: Entity): string {
		return entity.color ?? 'var(--color-primary-500)';
	}

	// Calculate gain/loss
	const purchasePrice = $derived(data.property.purchasePrice ?? 0);
	const estimatedValue = $derived(data.property.estimatedValue ?? 0);
	const gainLoss = $derived(estimatedValue - purchasePrice);
	const gainLossPercent = $derived(purchasePrice > 0 ? (gainLoss / purchasePrice) : 0);

	// Calculate loan progress
	const loan = $derived(data.property.loan);
	const amountRepaid = $derived(loan ? loan.principalAmount - (loan.currentBalance ?? 0) : 0);
	const repaidPercent = $derived(loan ? (amountRepaid / loan.principalAmount) : 0);

	// Calculate amortization schedule
	const amortizationSchedule = $derived(loan ? calculateAmortizationSchedule(loan) : []);
	const currentMonthIndex = $derived(loan ? getCurrentMonthIndex(amortizationSchedule) : -1);
</script>

<div class="property-detail-page">
	<header class="page-header">
		<a href="/immobilier" class="back-button">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="m15 18-6-6 6-6"/>
			</svg>
			<span>Retour</span>
		</a>
		<div class="header-content">
			<h1>{data.property.name}</h1>
			<span class="property-category">{getCategoryLabel(data.property.category)}</span>
		</div>
	</header>

	<!-- Section Informations -->
	<section class="card info-section" class:collapsed={isMobile && !expandedSections.info}>
		<button
			class="section-title"
			class:collapsible={isMobile}
			onclick={() => isMobile && toggleSection('info')}
			aria-expanded={!isMobile || expandedSections.info}
		>
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<circle cx="12" cy="12" r="10"/>
				<path d="M12 16v-4"/>
				<path d="M12 8h.01"/>
			</svg>
			<span>Informations</span>
			{#if isMobile}
				<svg class="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="m6 9 6 6 6-6"/>
				</svg>
			{/if}
		</button>
		<div class="section-content" class:hidden={isMobile && !expandedSections.info}>
		<div class="info-grid">
			<div class="info-item">
				<span class="info-label">Type</span>
				<span class="info-value">{getPropertyTypeLabel(data.property.type)}</span>
			</div>
			<div class="info-item">
				<span class="info-label">Adresse</span>
				<span class="info-value">{data.property.address}</span>
			</div>
			<div class="info-item">
				<span class="info-label">Ville</span>
				<span class="info-value">{data.property.postalCode} {data.property.city}</span>
			</div>
			<div class="info-item">
				<span class="info-label">Surface</span>
				<span class="info-value">{data.property.surfaceM2 ?? '-'} m²</span>
			</div>
			<div class="info-item">
				<span class="info-label">Pièces</span>
				<span class="info-value">{data.property.rooms ?? '-'}</span>
			</div>
			{#if data.property.floor !== null}
				<div class="info-item">
					<span class="info-label">Étage</span>
					<span class="info-value">{data.property.floor === 0 ? 'RDC' : data.property.floor + 'e'}</span>
				</div>
			{/if}
			{#if data.property.dpeRating}
				<div class="info-item">
					<span class="info-label">DPE</span>
					<span class="dpe-badge" style="background-color: {getDPEColor(data.property.dpeRating)}">
						{data.property.dpeRating}
					</span>
				</div>
			{/if}
		</div>

		{#if data.property.coproName}
			<div class="copro-section">
				<h3 class="subsection-title">Copropriété</h3>
				<div class="info-grid">
					<div class="info-item">
						<span class="info-label">Nom</span>
						<span class="info-value">{data.property.coproName}</span>
					</div>
					{#if data.property.coproLots && data.property.coproLots.length > 0}
						<div class="info-item">
							<span class="info-label">Lots</span>
							<span class="info-value">{data.property.coproLots.join(', ')}</span>
						</div>
					{/if}
					{#if data.property.coproTantiemes}
						<div class="info-item">
							<span class="info-label">Tantièmes</span>
							<span class="info-value">{data.property.coproTantiemes.toLocaleString('fr-FR')}</span>
						</div>
					{/if}
					{#if data.property.syndicName}
						<div class="info-item">
							<span class="info-label">Syndic</span>
							<span class="info-value">{data.property.syndicName}</span>
						</div>
					{/if}
				</div>
			</div>
		{/if}
		</div>
	</section>

	<!-- Section Valeur -->
	<section class="card value-section" class:collapsed={isMobile && !expandedSections.value}>
		<button
			class="section-title"
			class:collapsible={isMobile}
			onclick={() => isMobile && toggleSection('value')}
			aria-expanded={!isMobile || expandedSections.value}
		>
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<line x1="12" y1="1" x2="12" y2="23"/>
				<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
			</svg>
			<span>Valeur</span>
			{#if isMobile}
				<svg class="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="m6 9 6 6 6-6"/>
				</svg>
			{/if}
		</button>
		<div class="section-content" class:hidden={isMobile && !expandedSections.value}>
		<div class="value-cards">
			<div class="value-card">
				<span class="value-label">Prix d'achat</span>
				<span class="value-amount">{formatCurrency(data.property.purchasePrice)}</span>
				{#if data.property.purchaseDate}
					<span class="value-date">{formatDate(data.property.purchaseDate)}</span>
				{/if}
			</div>
			<div class="value-card highlight">
				<span class="value-label">Valeur estimée</span>
				<span class="value-amount">{formatCurrency(data.property.estimatedValue)}</span>
				{#if data.property.estimatedValueDate}
					<span class="value-date">Au {formatDate(data.property.estimatedValueDate)}</span>
				{/if}
			</div>
			<div class="value-card {gainLoss >= 0 ? 'positive' : 'negative'}">
				<span class="value-label">{gainLoss >= 0 ? 'Plus-value' : 'Moins-value'}</span>
				<span class="value-amount {gainLoss >= 0 ? 'text-success' : 'text-danger'}">
					{gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)}
				</span>
				<span class="value-percent {gainLoss >= 0 ? 'text-success' : 'text-danger'}">
					{gainLoss >= 0 ? '+' : ''}{formatPercent(gainLossPercent)}
				</span>
			</div>
		</div>

		{#if data.property.notaryFees || data.property.agencyFees || data.property.renovationCosts}
			<div class="acquisition-costs">
				<h3 class="subsection-title">Frais d'acquisition</h3>
				<div class="costs-grid">
					{#if data.property.notaryFees}
						<div class="cost-item">
							<span class="cost-label">Frais de notaire</span>
							<span class="cost-value">{formatCurrency(data.property.notaryFees)}</span>
						</div>
					{/if}
					{#if data.property.agencyFees}
						<div class="cost-item">
							<span class="cost-label">Frais d'agence</span>
							<span class="cost-value">{formatCurrency(data.property.agencyFees)}</span>
						</div>
					{/if}
					{#if data.property.renovationCosts}
						<div class="cost-item">
							<span class="cost-label">Travaux</span>
							<span class="cost-value">{formatCurrency(data.property.renovationCosts)}</span>
						</div>
					{/if}
				</div>
			</div>
		{/if}
		</div>
	</section>

	<!-- Section Prêt -->
	{#if loan}
		<section class="card loan-section" class:collapsed={isMobile && !expandedSections.loan}>
			<button
				class="section-title"
				class:collapsible={isMobile}
				onclick={() => isMobile && toggleSection('loan')}
				aria-expanded={!isMobile || expandedSections.loan}
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<rect x="2" y="4" width="20" height="16" rx="2"/>
					<path d="M12 12h.01"/>
				</svg>
				<span>Prêt immobilier</span>
				{#if isMobile}
					<svg class="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="m6 9 6 6 6-6"/>
					</svg>
				{/if}
			</button>
			<div class="section-content" class:hidden={isMobile && !expandedSections.loan}>
			<div class="loan-header">
				<div class="loan-name">{loan.name}</div>
				<div class="loan-bank">{loan.bankName}</div>
			</div>

			<div class="loan-progress-section">
				<div class="progress-header">
					<span class="progress-label">Remboursement</span>
					<span class="progress-percent">{formatPercent(repaidPercent)}</span>
				</div>
				<div class="progress-bar">
					<div class="progress-fill" style="width: {repaidPercent * 100}%"></div>
				</div>
				<div class="progress-values">
					<span class="progress-repaid">{formatCurrency(amountRepaid)} remboursé</span>
					<span class="progress-remaining">{formatCurrency(loan.currentBalance)} restant</span>
				</div>
			</div>

			<div class="loan-details">
				<div class="loan-grid">
					<div class="loan-item">
						<span class="loan-label">Montant emprunté</span>
						<span class="loan-value">{formatCurrency(loan.principalAmount)}</span>
					</div>
					<div class="loan-item">
						<span class="loan-label">Taux nominal</span>
						<span class="loan-value">{formatRate(loan.interestRate)}</span>
					</div>
					<div class="loan-item">
						<span class="loan-label">Durée</span>
						<span class="loan-value">{Math.floor(loan.durationMonths / 12)} ans ({loan.durationMonths} mois)</span>
					</div>
					<div class="loan-item">
						<span class="loan-label">Date de début</span>
						<span class="loan-value">{formatDate(loan.startDate)}</span>
					</div>
					{#if loan.endDate}
						<div class="loan-item">
							<span class="loan-label">Date de fin</span>
							<span class="loan-value">{formatDate(loan.endDate)}</span>
						</div>
					{/if}
					<div class="loan-item highlight">
						<span class="loan-label">Mensualité</span>
						<span class="loan-value">{formatCurrencyWithDecimals(loan.monthlyPayment)}</span>
					</div>
					{#if loan.insuranceMonthly}
						<div class="loan-item">
							<span class="loan-label">Assurance mensuelle</span>
							<span class="loan-value">{formatCurrencyWithDecimals(loan.insuranceMonthly)}</span>
						</div>
					{/if}
					<div class="loan-item danger">
						<span class="loan-label">Capital restant dû</span>
						<span class="loan-value">{formatCurrencyWithDecimals(loan.currentBalance)}</span>
					</div>
				</div>
			</div>
			</div>
		</section>

		<!-- Section Tableau d'amortissement -->
		{#if amortizationSchedule.length > 0}
			<section class="card amortization-section" class:collapsed={isMobile && !expandedSections.amortization}>
				<button
					class="section-title"
					class:collapsible={isMobile}
					onclick={() => isMobile && toggleSection('amortization')}
					aria-expanded={!isMobile || expandedSections.amortization}
				>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
						<line x1="16" y1="2" x2="16" y2="6"/>
						<line x1="8" y1="2" x2="8" y2="6"/>
						<line x1="3" y1="10" x2="21" y2="10"/>
					</svg>
					<span>Tableau d'amortissement</span>
					{#if isMobile}
						<svg class="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<path d="m6 9 6 6 6-6"/>
						</svg>
					{/if}
				</button>
				<div class="section-content" class:hidden={isMobile && !expandedSections.amortization}>
					<AmortizationTable schedule={amortizationSchedule} currentMonthIndex={currentMonthIndex} />
				</div>
			</section>
		{/if}
	{/if}

	<!-- Section Propriétaires -->
	<section class="card owners-section" class:collapsed={isMobile && !expandedSections.owners}>
		<button
			class="section-title"
			class:collapsible={isMobile}
			onclick={() => isMobile && toggleSection('owners')}
			aria-expanded={!isMobile || expandedSections.owners}
		>
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
				<circle cx="9" cy="7" r="4"/>
				<path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
				<path d="M16 3.13a4 4 0 0 1 0 7.75"/>
			</svg>
			<span>Propriétaires</span>
			{#if isMobile}
				<svg class="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="m6 9 6 6 6-6"/>
				</svg>
			{/if}
		</button>
		<div class="section-content" class:hidden={isMobile && !expandedSections.owners}>
		<div class="owners-list">
			{#each data.property.owners as owner}
				<div class="owner-card">
					<div class="owner-avatar" style="background-color: {getEntityColor(owner.entity)}">
						{owner.entity.name.charAt(0).toUpperCase()}
					</div>
					<div class="owner-info">
						<span class="owner-name">{owner.entity.name}</span>
						<span class="owner-type">{owner.entity.type === 'person' ? 'Personne physique' : owner.entity.type === 'sci' ? 'SCI' : 'Indivision'}</span>
					</div>
					<div class="owner-details">
						<span class="owner-percent">{owner.percentage}%</span>
						{#if owner.acquisitionDate}
							<span class="owner-acquisition">
								{getAcquisitionTypeLabel(owner.acquisitionType)} le {formatDate(owner.acquisitionDate)}
							</span>
						{/if}
					</div>
				</div>
			{/each}
		</div>
		</div>
	</section>
</div>

<style>
	.property-detail-page {
		max-width: var(--content-max-width);
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-6);
	}

	.page-header {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-4);
		animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
	}

	.back-button {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-2);
		color: var(--color-text-secondary);
		text-decoration: none;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		transition: color var(--transition-fast);
		width: fit-content;
	}

	.back-button:hover {
		color: var(--color-text-primary);
	}

	.header-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-1);
	}

	.header-content h1 {
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-primary);
		letter-spacing: var(--letter-spacing-tight);
	}

	.property-category {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	.card {
		background: var(--color-bg-card);
		border-radius: var(--radius-xl);
		border: 1px solid var(--color-border);
		padding: var(--spacing-6);
		animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
		opacity: 0;
	}

	.info-section { animation-delay: 0.05s; }
	.value-section { animation-delay: 0.1s; }
	.loan-section { animation-delay: 0.15s; }
	.amortization-section { animation-delay: 0.2s; }
	.owners-section { animation-delay: 0.25s; }

	.section-title {
		display: flex;
		align-items: center;
		gap: var(--spacing-3);
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-5);
		/* Button reset for collapsible */
		width: 100%;
		background: none;
		border: none;
		padding: 0;
		text-align: left;
		cursor: default;
	}

	.section-title svg:first-of-type {
		color: var(--color-gold-500);
		flex-shrink: 0;
	}

	.section-title span {
		flex: 1;
	}

	/* Collapsible section styles */
	.section-title.collapsible {
		cursor: pointer;
		padding: var(--spacing-4);
		margin: calc(var(--spacing-4) * -1);
		margin-bottom: var(--spacing-4);
		border-radius: var(--radius-lg);
		transition: background-color var(--transition-fast);
	}

	.section-title.collapsible:hover {
		background: var(--color-bg-subtle);
	}

	.section-title.collapsible:focus-visible {
		outline: 2px solid var(--color-primary-500);
		outline-offset: -2px;
	}

	.section-title .chevron {
		color: var(--color-text-muted);
		flex-shrink: 0;
		transition: transform var(--transition-fast);
	}

	.section-title[aria-expanded="true"] .chevron {
		transform: rotate(180deg);
	}

	.section-content {
		/* Smooth collapse animation */
		overflow: hidden;
		transition: max-height 0.3s ease-out, opacity 0.2s ease-out;
	}

	.section-content.hidden {
		max-height: 0;
		opacity: 0;
		overflow: hidden;
	}

	.card.collapsed {
		padding-bottom: var(--spacing-4);
	}

	.card.collapsed .section-title {
		margin-bottom: 0;
	}

	.subsection-title {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-3);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-caps);
	}

	/* Info Grid */
	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: var(--spacing-4);
	}

	.info-item {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-1);
	}

	.info-label {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-caps);
	}

	.info-value {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
	}

	.dpe-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: var(--radius-md);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-bold);
		color: #000;
	}

	.copro-section {
		margin-top: var(--spacing-6);
		padding-top: var(--spacing-5);
		border-top: 1px solid var(--color-border);
	}

	/* Value Cards */
	.value-cards {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--spacing-4);
	}

	.value-card {
		background: var(--color-bg-subtle);
		border-radius: var(--radius-lg);
		padding: var(--spacing-4);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-1);
	}

	.value-card.highlight {
		background: rgba(212, 168, 83, 0.1);
	}

	.value-card.positive {
		background: rgba(16, 185, 129, 0.08);
	}

	.value-card.negative {
		background: rgba(239, 68, 68, 0.08);
	}

	.value-label {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-caps);
	}

	.value-amount {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-primary);
	}

	.value-date, .value-percent {
		font-size: var(--font-size-sm);
		color: var(--color-text-tertiary);
	}

	.text-success { color: var(--color-success-500); }
	.text-danger { color: var(--color-danger-500); }

	.acquisition-costs {
		margin-top: var(--spacing-6);
		padding-top: var(--spacing-5);
		border-top: 1px solid var(--color-border);
	}

	.costs-grid {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-6);
	}

	.cost-item {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-1);
	}

	.cost-label {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-caps);
	}

	.cost-value {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-secondary);
	}

	/* Loan Section */
	.loan-header {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-1);
		margin-bottom: var(--spacing-5);
	}

	.loan-name {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.loan-bank {
		font-size: var(--font-size-sm);
		color: var(--color-text-tertiary);
	}

	.loan-progress-section {
		background: var(--color-bg-subtle);
		border-radius: var(--radius-lg);
		padding: var(--spacing-4);
		margin-bottom: var(--spacing-5);
	}

	.progress-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: var(--spacing-2);
	}

	.progress-label {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
	}

	.progress-percent {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-success-500);
	}

	.progress-bar {
		height: 8px;
		background: var(--color-bg-muted);
		border-radius: var(--radius-full);
		overflow: hidden;
		margin-bottom: var(--spacing-2);
	}

	.progress-fill {
		height: 100%;
		background: var(--color-success-500);
		border-radius: var(--radius-full);
		transition: width 0.5s ease-out;
	}

	.progress-values {
		display: flex;
		justify-content: space-between;
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
	}

	.loan-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: var(--spacing-4);
	}

	.loan-item {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-1);
	}

	.loan-item.highlight {
		background: rgba(212, 168, 83, 0.1);
		padding: var(--spacing-3);
		border-radius: var(--radius-md);
	}

	.loan-item.danger {
		background: rgba(239, 68, 68, 0.08);
		padding: var(--spacing-3);
		border-radius: var(--radius-md);
	}

	.loan-label {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-caps);
	}

	.loan-value {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
	}

	.loan-item.danger .loan-value {
		color: var(--color-danger-500);
	}

	/* Owners Section */
	.owners-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-3);
	}

	.owner-card {
		display: flex;
		align-items: center;
		gap: var(--spacing-4);
		padding: var(--spacing-4);
		background: var(--color-bg-subtle);
		border-radius: var(--radius-lg);
	}

	.owner-avatar {
		width: 48px;
		height: 48px;
		border-radius: var(--radius-full);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-bold);
		color: #fff;
		flex-shrink: 0;
	}

	.owner-info {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-1);
		flex: 1;
		min-width: 0;
	}

	.owner-name {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.owner-type {
		font-size: var(--font-size-sm);
		color: var(--color-text-tertiary);
	}

	.owner-details {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: var(--spacing-1);
	}

	.owner-percent {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-primary);
	}

	.owner-acquisition {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.property-detail-page {
			gap: var(--spacing-4);
		}

		.card {
			padding: var(--spacing-4);
		}

		.header-content h1 {
			font-size: var(--font-size-xl);
		}

		.value-cards {
			grid-template-columns: 1fr;
		}

		.loan-grid,
		.info-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.owner-card {
			flex-wrap: wrap;
		}

		.owner-details {
			width: 100%;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			margin-top: var(--spacing-2);
			padding-top: var(--spacing-2);
			border-top: 1px solid var(--color-border);
		}

		.owner-percent {
			font-size: var(--font-size-lg);
		}
	}

	@media (max-width: 480px) {
		.loan-grid,
		.info-grid {
			grid-template-columns: 1fr;
		}

		.costs-grid {
			flex-direction: column;
			gap: var(--spacing-3);
		}
	}

	/* Reduced motion preference */
	@media (prefers-reduced-motion: reduce) {
		.section-content {
			transition: none;
		}

		.section-title .chevron {
			transition: none;
		}
	}
</style>
