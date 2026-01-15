<script lang="ts">
	import { DoughnutChart } from '$lib/components/charts';

	interface Owner {
		id: string;
		name: string;
		type: string;
	}

	interface Account {
		owner_id?: string;
		type?: string;
		balance?: number;
	}

	interface Position {
		owner_id?: string;
		currentValue?: number;
		gain?: number;
		gainPercent?: number;
		name?: string;
		ticker?: string;
		asset_type?: string;
	}

	interface Loan {
		owner_id?: string;
		remaining_amount?: number;
	}

	interface Summary {
		netWorth: number;
		liquidAssets: number;
		investmentAssets: number;
		realEstateValue: number;
		totalDebts: number;
	}

	interface Bank {
		name: string;
		accounts: Account[];
		total: number;
	}

	interface HistoryPoint {
		date: string;
		value: number;
	}

	interface PageData {
		summary: Summary;
		accounts: Account[];
		positions: Position[];
		loans: Loan[];
		banks: Bank[];
		byCategory: Array<{ label: string; value: number; color: string }>;
		budget: { income: number; expense: number; balance: number };
		netWorthHistory: HistoryPoint[];
	}

	let { data } = $props<{ data: PageData }>();
	let selectedPeriod = $state('1M');
	let patrimoineView = $state<'brut' | 'net'>('net');
	let selectedOwner = $state<'all' | 'owner-mathieu' | 'owner-ninon' | 'owner-joint' | 'owner-isaac'>('all');

	const periodOptions = [
		{ value: '1J', label: '1J' },
		{ value: '7J', label: '7J' },
		{ value: '1M', label: '1M' },
		{ value: 'YTD', label: 'YTD' },
		{ value: '1A', label: '1A' },
		{ value: 'ALL', label: 'TOUT' }
	];

	const ownerOptions = [
		{ id: 'all' as const, label: 'Tous', color: 'var(--color-text-muted)' },
		{ id: 'owner-mathieu' as const, label: 'Mathieu', color: 'var(--color-owner-mathieu)' },
		{ id: 'owner-ninon' as const, label: 'Ninon', color: 'var(--color-owner-ninon)' },
		{ id: 'owner-joint' as const, label: 'Commun', color: 'var(--color-owner-joint)' },
		{ id: 'owner-isaac' as const, label: 'Isaac', color: 'var(--color-owner-isaac)' }
	];

	function getOwnerColor(ownerId: string | undefined): string {
		switch (ownerId) {
			case 'owner-mathieu': return 'var(--color-owner-mathieu)';
			case 'owner-ninon': return 'var(--color-owner-ninon)';
			case 'owner-joint': return 'var(--color-owner-joint)';
			case 'owner-sci-imanisa': return 'var(--color-owner-sci)';
			case 'owner-isaac': return 'var(--color-owner-isaac)';
			default: return 'var(--color-text-muted)';
		}
	}

	function getOwnerInitial(ownerId: string | undefined): string {
		switch (ownerId) {
			case 'owner-mathieu': return 'M';
			case 'owner-ninon': return 'N';
			case 'owner-joint': return 'C';
			case 'owner-sci-imanisa': return 'S';
			case 'owner-isaac': return 'I';
			default: return '?';
		}
	}

	const filteredAccounts = $derived(
		selectedOwner === 'all'
			? data.accounts ?? []
			: (data.accounts ?? []).filter((a: Account) => a.owner_id === selectedOwner)
	);

	const filteredPositions = $derived(
		selectedOwner === 'all'
			? data.positions ?? []
			: (data.positions ?? []).filter((p: Position) => p.owner_id === selectedOwner)
	);

	const filteredLoans = $derived(
		selectedOwner === 'all'
			? data.loans ?? []
			: (data.loans ?? []).filter((l: Loan) => l.owner_id === selectedOwner)
	);

	const filteredSummary = $derived({
		liquidAssets: filteredAccounts
			.filter((a: Account) => a.type === 'checking' || a.type === 'savings')
			.reduce((sum: number, a: Account) => sum + (a.balance || 0), 0),
		investmentAssets: filteredPositions
			.reduce((sum: number, p: Position) => sum + (p.currentValue || 0), 0),
		realEstateValue: selectedOwner === 'all' 
			? data.summary.realEstateValue 
			: 0,
		totalDebts: filteredLoans
			.reduce((sum: number, l: Loan) => sum + (l.remaining_amount || 0), 0)
	});

	const filteredGrossAssets = $derived(
		filteredSummary.liquidAssets + filteredSummary.investmentAssets + filteredSummary.realEstateValue
	);

	const filteredNetWorth = $derived(
		filteredGrossAssets - filteredSummary.totalDebts
	);

	const displaySummary = $derived(
		selectedOwner === 'all' ? data.summary : filteredSummary
	);

	const grossAssets = $derived(
		selectedOwner === 'all'
			? data.summary.liquidAssets + data.summary.investmentAssets + data.summary.realEstateValue
			: filteredGrossAssets
	);

	const netWorth = $derived(
		selectedOwner === 'all' ? data.summary.netWorth : filteredNetWorth
	);

	const filteredHistory = $derived.by((): HistoryPoint[] => {
		const history = data.netWorthHistory ?? [];
		if (history.length === 0) return [];
		
		const now = new Date();
		let startDate: Date;
		
		switch (selectedPeriod) {
			case '1J':
				startDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
				break;
			case '7J':
				startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
				break;
			case '1M':
				startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
				break;
			case 'YTD':
				startDate = new Date(now.getFullYear(), 0, 1);
				break;
			case '1A':
				startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
				break;
			case 'ALL':
			default:
				startDate = new Date(0);
		}
		
		const startStr = startDate.toISOString().slice(0, 10);
		return history.filter((p: HistoryPoint) => p.date >= startStr);
	});

	const chartPath = $derived.by((): string => {
		const points = filteredHistory;
		if (points.length < 2) return '';
		
		const values = points.map((p: HistoryPoint) => p.value);
		const minVal = Math.min(...values);
		const maxVal = Math.max(...values);
		const range = maxVal - minVal || 1;
		
		const width = 800;
		const height = 200;
		const padding = 10;
		
		const pathPoints = points.map((p: HistoryPoint, i: number) => {
			const x = (i / (points.length - 1)) * width;
			const y = height - padding - ((p.value - minVal) / range) * (height - 2 * padding);
			return `${x},${y}`;
		});
		
		return `M${pathPoints.join(' L')}`;
	});

	const chartAreaPath = $derived.by((): string => {
		if (!chartPath) return '';
		return `${chartPath} L800,200 L0,200 Z`;
	});

	const performance = $derived.by((): { value: number; percent: number } => {
		const points = filteredHistory;
		if (points.length < 2) return { value: 0, percent: 0 };
		
		const startValue = points[0].value;
		const endValue = points[points.length - 1].value;
		const change = endValue - startValue;
		const percent = startValue > 0 ? (change / startValue) * 100 : 0;
		
		return { value: change, percent };
	});

	function formatCurrency(value: number): string {
		return value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
	}

	function formatCompactCurrency(value: number): string {
		return value.toLocaleString('fr-FR', { 
			style: 'currency', 
			currency: 'EUR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		});
	}

	function formatPercent(value: number): string {
		return value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
	}

	function formatFullDate(): string {
		return new Date().toLocaleDateString('fr-FR', { 
			day: 'numeric', 
			month: 'long', 
			year: 'numeric' 
		});
	}
</script>

<div class="dashboard">
	<header class="dashboard-header">
		<div class="header-left">
			<h1>Synthèse</h1>
			<span class="header-date">{formatFullDate()}</span>
		</div>
		<div class="owner-filter">
			{#each ownerOptions as option}
				<button
					class="owner-pill"
					class:active={selectedOwner === option.id}
					onclick={() => selectedOwner = option.id}
					style="--owner-color: {option.color}"
					aria-label="Filtrer par {option.label}"
					aria-pressed={selectedOwner === option.id}
				>
					<span class="owner-dot" aria-hidden="true"></span>
					<span class="owner-label">{option.label}</span>
				</button>
			{/each}
		</div>
	</header>

	<section class="hero-section">
		<div class="chart-container">
			<div class="chart-header">
				<div class="view-toggle" role="group" aria-label="Vue du patrimoine">
					<button class:active={patrimoineView === 'net'} onclick={() => patrimoineView = 'net'} aria-pressed={patrimoineView === 'net'}>Net</button>
					<button class:active={patrimoineView === 'brut'} onclick={() => patrimoineView = 'brut'} aria-pressed={patrimoineView === 'brut'}>Brut</button>
				</div>
				<div class="period-pills" role="group" aria-label="Période d'affichage">
					{#each periodOptions as period}
						<button
							class="period-pill"
							class:active={selectedPeriod === period.value}
							onclick={() => selectedPeriod = period.value}
							aria-pressed={selectedPeriod === period.value}
						>
							{period.label}
						</button>
					{/each}
				</div>
			</div>
			
			<div class="chart-value-overlay">
				<span class="chart-big-value">
					{formatCompactCurrency(patrimoineView === 'net' ? netWorth : grossAssets)}
				</span>
				<span class="chart-date-label">Patrimoine {patrimoineView}</span>
			</div>

			<div class="chart-area">
				<svg class="area-chart" viewBox="0 0 800 200" preserveAspectRatio="none">
					<defs>
						<linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
							<stop offset="0%" stop-color="{performance.value >= 0 ? 'var(--color-success-500)' : 'var(--color-danger-500)'}" stop-opacity="0.3"/>
							<stop offset="100%" stop-color="{performance.value >= 0 ? 'var(--color-success-500)' : 'var(--color-danger-500)'}" stop-opacity="0"/>
						</linearGradient>
					</defs>
					{#if chartPath}
						<path 
							class="area-fill"
							d={chartAreaPath}
							fill="url(#areaGradient)"
						/>
						<path 
							class="area-line"
							d={chartPath}
							fill="none"
							stroke="{performance.value >= 0 ? 'var(--color-success-500)' : 'var(--color-danger-500)'}"
							stroke-width="2"
						/>
					{:else}
						<text x="400" y="100" text-anchor="middle" fill="var(--color-text-muted)">Pas de données</text>
					{/if}
				</svg>
			</div>
		</div>

		<div class="performance-card">
			<div class="perf-header">
				<span class="perf-title">Performance</span>
				<span class="perf-period">{selectedPeriod}</span>
			</div>
			<div class="perf-value" class:positive={performance.value >= 0} class:negative={performance.value < 0}>
				{performance.value >= 0 ? '+' : ''}{formatCurrency(performance.value)}
			</div>
			<div class="perf-percent" class:positive={performance.percent >= 0} class:negative={performance.percent < 0}>
				{performance.percent >= 0 ? '+' : ''}{formatPercent(performance.percent)}
			</div>
			<div class="perf-breakdown">
				<div class="perf-item">
					<span class="perf-item-label">Actifs</span>
					<span class="perf-item-value text-success">+{formatCurrency(grossAssets * 0.03)}</span>
				</div>
				<div class="perf-item">
					<span class="perf-item-label">Crypto</span>
					<span class="perf-item-value text-danger">-{formatCurrency(grossAssets * 0.005)}</span>
				</div>
			</div>
		</div>
	</section>

	<section class="breakdown-section">
		<h2 class="section-title">Répartition</h2>
		<div class="breakdown-cards">
			<a href="/accounts" class="breakdown-card">
				<div class="breakdown-icon">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="2" y="4" width="20" height="16" rx="2"/>
						<path d="M2 10h20"/>
					</svg>
				</div>
				<div class="breakdown-content">
					<span class="breakdown-label">Liquidités</span>
					<span class="breakdown-value">{formatCompactCurrency(displaySummary.liquidAssets)}</span>
				</div>
			</a>
			<a href="/investments" class="breakdown-card">
				<div class="breakdown-icon accent">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
						<polyline points="16 7 22 7 22 13"/>
					</svg>
				</div>
				<div class="breakdown-content">
					<span class="breakdown-label">Investissements</span>
					<span class="breakdown-value">{formatCompactCurrency(displaySummary.investmentAssets)}</span>
				</div>
			</a>
			<div class="breakdown-card">
				<div class="breakdown-icon gold">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
						<polyline points="9 22 9 12 15 12 15 22"/>
					</svg>
				</div>
				<div class="breakdown-content">
					<span class="breakdown-label">Immobilier</span>
					<span class="breakdown-value">{formatCompactCurrency(displaySummary.realEstateValue)}</span>
				</div>
			</div>
			<a href="/loans" class="breakdown-card debt">
				<div class="breakdown-icon danger">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M12 2v20M2 12h20"/>
					</svg>
				</div>
				<div class="breakdown-content">
					<span class="breakdown-label">Dettes</span>
					<span class="breakdown-value text-danger">-{formatCompactCurrency(displaySummary.totalDebts)}</span>
				</div>
			</a>
		</div>
	</section>

	{#if filteredPositions.length > 0}
		<section class="assets-section">
			<div class="section-header">
				<h2 class="section-title">Ma performance</h2>
				<a href="/investments" class="section-link">Voir tout</a>
			</div>
			<div class="assets-scroll">
				{#each filteredPositions.slice(0, 6) as position}
					<div class="asset-card">
						<div class="asset-header">
							<span class="owner-badge" style="background: {getOwnerColor(position.owner_id)}">
								{getOwnerInitial(position.owner_id)}
							</span>
							<div class="asset-info">
								<span class="asset-name">{position.name}</span>
								<span class="asset-ticker">{position.ticker || position.asset_type}</span>
							</div>
						</div>
						<div class="asset-sparkline">
							<svg viewBox="0 0 100 30" preserveAspectRatio="none">
								<path 
									d="M0,25 L10,22 L20,24 L30,20 L40,18 L50,15 L60,17 L70,12 L80,10 L90,8 L100,5"
									fill="none"
									stroke={(position.gain ?? 0) >= 0 ? 'var(--color-success-500)' : 'var(--color-danger-500)'}
									stroke-width="1.5"
								/>
							</svg>
						</div>
						<div class="asset-footer">
							<span class="asset-value">{formatCurrency(position.currentValue ?? 0)}</span>
							<span class="asset-gain" class:positive={(position.gain ?? 0) >= 0} class:negative={(position.gain ?? 0) < 0}>
								{(position.gain ?? 0) >= 0 ? '+' : ''}{formatPercent(position.gainPercent ?? 0)}
							</span>
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<section class="chart-section">
		<div class="section-header">
			<h2 class="section-title">Répartition par catégorie</h2>
		</div>
		<div class="chart-wrapper">
			<DoughnutChart data={data.byCategory} title="" />
		</div>
	</section>
</div>

<style>
	.dashboard {
		max-width: var(--content-max-width);
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-8);
	}

	.dashboard-header {
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

	.dashboard-header h1 {
		font-size: var(--font-size-3xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-primary);
		letter-spacing: var(--letter-spacing-tight);
	}

	.header-date {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	.owner-filter {
		display: flex;
		gap: var(--spacing-2);
		background: var(--color-bg-elevated);
		padding: var(--spacing-1);
		border-radius: var(--radius-full);
		border: 1px solid var(--color-border);
	}

	.owner-pill {
		display: flex;
		align-items: center;
		gap: var(--spacing-2);
		padding: var(--spacing-2) var(--spacing-4);
		border-radius: var(--radius-full);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-tertiary);
		background: transparent;
		border: none;
		cursor: pointer;
		transition: all var(--transition-fast);
		white-space: nowrap;
		flex-shrink: 0;
		min-height: 44px;
	}

	.owner-pill:hover {
		color: var(--color-text-secondary);
		background: var(--color-bg-subtle);
	}

	.owner-pill:focus-visible {
		outline: 2px solid var(--color-primary-500);
		outline-offset: 2px;
	}

	.owner-pill.active {
		color: var(--color-text-primary);
		background: var(--color-bg-subtle);
	}

	.owner-dot {
		width: 8px;
		height: 8px;
		border-radius: var(--radius-full);
		background: var(--owner-color);
		flex-shrink: 0;
	}

	.hero-section {
		display: grid;
		grid-template-columns: 1fr 320px;
		gap: var(--spacing-6);
		animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s forwards;
		opacity: 0;
	}

	.chart-container {
		background: var(--color-bg-card);
		border-radius: var(--radius-2xl);
		border: 1px solid var(--color-border);
		padding: var(--spacing-6);
		position: relative;
		overflow: hidden;
	}

	.chart-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-6);
	}

	.view-toggle {
		display: flex;
		background: var(--color-bg-subtle);
		padding: var(--spacing-1);
		border-radius: var(--radius-lg);
	}

	.view-toggle button {
		padding: var(--spacing-1-5) var(--spacing-3);
		border-radius: var(--radius-md);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-tertiary);
		border: none;
		background: transparent;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.view-toggle button:hover {
		color: var(--color-text-secondary);
	}

	.view-toggle button:focus-visible {
		outline: 2px solid var(--color-primary-500);
		outline-offset: 2px;
	}

	.view-toggle button.active {
		background: var(--color-bg-card);
		color: var(--color-text-primary);
	}

	.period-pills {
		display: flex;
		gap: var(--spacing-1);
	}

	.period-pill {
		padding: var(--spacing-1-5) var(--spacing-3);
		border-radius: var(--radius-md);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-muted);
		border: none;
		background: transparent;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.period-pill:hover {
		color: var(--color-text-secondary);
		background: var(--color-bg-subtle);
	}

	.period-pill:focus-visible {
		outline: 2px solid var(--color-primary-500);
		outline-offset: 2px;
	}

	.period-pill.active {
		color: var(--color-primary-500);
		background: rgba(250, 128, 114, 0.1);
	}

	.chart-value-overlay {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-1);
		margin-bottom: var(--spacing-4);
	}

	.chart-big-value {
		font-size: var(--font-size-4xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-primary);
		letter-spacing: var(--letter-spacing-tight);
		line-height: 1;
	}

	.chart-date-label {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	.chart-area {
		height: 160px;
		margin: 0 calc(var(--spacing-6) * -1);
		margin-bottom: calc(var(--spacing-6) * -1);
	}

	.area-chart {
		width: 100%;
		height: 100%;
	}

	.area-line {
		filter: drop-shadow(0 0 8px rgba(250, 128, 114, 0.4));
	}

	.performance-card {
		background: var(--color-bg-card);
		border-radius: var(--radius-2xl);
		border: 1px solid var(--color-border);
		padding: var(--spacing-6);
		display: flex;
		flex-direction: column;
	}

	.perf-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-4);
	}

	.perf-title {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-tertiary);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-caps);
	}

	.perf-period {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		background: var(--color-bg-subtle);
		padding: var(--spacing-1) var(--spacing-2);
		border-radius: var(--radius-md);
	}

	.perf-value {
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-bold);
		margin-bottom: var(--spacing-1);
	}

	.perf-value.positive { color: var(--color-success-500); }
	.perf-value.negative { color: var(--color-danger-500); }

	.perf-percent {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		margin-bottom: var(--spacing-6);
	}

	.perf-percent.positive { color: var(--color-success-500); }
	.perf-percent.negative { color: var(--color-danger-500); }

	.perf-breakdown {
		margin-top: auto;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-3);
		padding-top: var(--spacing-4);
		border-top: 1px solid var(--color-border);
	}

	.perf-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.perf-item-label {
		font-size: var(--font-size-sm);
		color: var(--color-text-tertiary);
	}

	.perf-item-value {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
	}

	.section-title {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-4);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-4);
	}

	.section-link {
		font-size: var(--font-size-sm);
		color: var(--color-primary-500);
		text-decoration: none;
		font-weight: var(--font-weight-medium);
		transition: color var(--transition-fast);
	}

	.section-link:hover {
		color: var(--color-primary-400);
	}

	.breakdown-section {
		animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s forwards;
		opacity: 0;
	}

	.breakdown-cards {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--spacing-4);
	}

	.breakdown-card {
		background: var(--color-bg-card);
		border-radius: var(--radius-xl);
		border: 1px solid var(--color-border);
		padding: var(--spacing-5);
		display: flex;
		align-items: center;
		gap: var(--spacing-4);
		transition: all var(--transition-fast);
		text-decoration: none;
		color: inherit;
	}

	.breakdown-card:hover {
		background: var(--color-bg-card-hover);
		border-color: var(--color-border-hover);
	}

	a.breakdown-card:hover {
		transform: translateY(-2px);
	}

	.breakdown-icon {
		width: 44px;
		height: 44px;
		border-radius: var(--radius-lg);
		background: var(--color-bg-subtle);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-tertiary);
		flex-shrink: 0;
	}

	.breakdown-icon.accent {
		background: rgba(250, 128, 114, 0.1);
		color: var(--color-primary-500);
	}

	.breakdown-icon.gold {
		background: rgba(212, 168, 83, 0.1);
		color: var(--color-gold-500);
	}

	.breakdown-icon.danger {
		background: var(--color-danger-50);
		color: var(--color-danger-500);
	}

	.breakdown-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-1);
		min-width: 0;
	}

	.breakdown-label {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-caps);
	}

	.breakdown-value {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-primary);
	}

	.assets-section {
		animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s forwards;
		opacity: 0;
	}

	.assets-scroll {
		display: flex;
		gap: var(--spacing-4);
		overflow-x: auto;
		padding-bottom: var(--spacing-2);
		scrollbar-width: none;
	}

	.assets-scroll::-webkit-scrollbar {
		display: none;
	}

	.asset-card {
		flex: 0 0 220px;
		background: var(--color-bg-card);
		border-radius: var(--radius-xl);
		border: 1px solid var(--color-border);
		padding: var(--spacing-4);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-3);
		transition: all var(--transition-fast);
	}

	.asset-card:hover {
		background: var(--color-bg-card-hover);
		border-color: var(--color-border-hover);
	}

	.asset-header {
		display: flex;
		align-items: center;
		gap: var(--spacing-3);
	}

	.owner-badge {
		width: 24px;
		height: 24px;
		border-radius: var(--radius-full);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 10px;
		font-weight: var(--font-weight-bold);
		color: white;
		flex-shrink: 0;
	}

	.asset-info {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.asset-name {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.asset-ticker {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		text-transform: uppercase;
	}

	.asset-sparkline {
		height: 30px;
	}

	.asset-sparkline svg {
		width: 100%;
		height: 100%;
	}

	.asset-footer {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
	}

	.asset-value {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.asset-gain {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
	}

	.asset-gain.positive { color: var(--color-success-500); }
	.asset-gain.negative { color: var(--color-danger-500); }

	.chart-section {
		animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.25s forwards;
		opacity: 0;
	}

	.chart-wrapper {
		background: var(--color-bg-card);
		border-radius: var(--radius-xl);
		border: 1px solid var(--color-border);
		padding: var(--spacing-6);
	}

	.text-success { color: var(--color-success-500); }
	.text-danger { color: var(--color-danger-500); }
	.positive { color: var(--color-success-500); }
	.negative { color: var(--color-danger-500); }

	@media (max-width: 1200px) {
		.hero-section {
			grid-template-columns: 1fr;
		}

		.performance-card {
			max-width: 400px;
		}
	}

	@media (max-width: 900px) {
		.breakdown-cards {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 768px) {
		.dashboard {
			gap: var(--spacing-6);
		}

		.dashboard-header {
			flex-direction: column;
			align-items: stretch;
			gap: var(--spacing-3);
		}

		.owner-filter {
			width: 100%;
			overflow-x: auto;
			scrollbar-width: none;
			-webkit-overflow-scrolling: touch;
			justify-content: flex-start;
			padding: var(--spacing-1);
			margin: 0 calc(var(--spacing-4) * -1);
			padding-left: var(--spacing-4);
			padding-right: var(--spacing-4);
			width: calc(100% + var(--spacing-4) * 2);
			border-radius: 0;
			border-left: none;
			border-right: none;
			background: transparent;
			border: none;
		}

		.owner-filter::-webkit-scrollbar {
			display: none;
		}

		.dashboard-header h1 {
			font-size: var(--font-size-2xl);
		}

		.chart-container {
			padding: var(--spacing-4);
			border-radius: var(--radius-xl);
		}

		.chart-header {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-3);
		}

		.chart-big-value {
			font-size: var(--font-size-2xl);
		}

		.chart-area {
			height: 120px;
			margin: 0 calc(var(--spacing-4) * -1);
			margin-bottom: calc(var(--spacing-4) * -1);
		}

		.performance-card {
			max-width: none;
			padding: var(--spacing-4);
			border-radius: var(--radius-xl);
		}

		.breakdown-cards {
			grid-template-columns: 1fr;
			gap: var(--spacing-3);
		}

		.breakdown-card {
			padding: var(--spacing-4);
			border-radius: var(--radius-lg);
		}

		.section-title {
			font-size: var(--font-size-base);
		}

		.assets-scroll {
			margin: 0 calc(var(--spacing-4) * -1);
			padding-left: var(--spacing-4);
			padding-right: var(--spacing-4);
		}

		.asset-card {
			flex: 0 0 180px;
			padding: var(--spacing-3);
		}

		.chart-wrapper {
			padding: var(--spacing-4);
			border-radius: var(--radius-xl);
		}
	}

	@media (max-width: 640px) {
		.owner-pill {
			padding: var(--spacing-2) var(--spacing-3);
			min-height: 40px;
		}

		.owner-label {
			display: none;
		}

		.period-pills {
			width: 100%;
			justify-content: space-between;
		}

		.period-pill {
			flex: 1;
			text-align: center;
			justify-content: center;
		}

		.view-toggle {
			width: 100%;
		}

		.view-toggle button {
			flex: 1;
		}

		.hero-section {
			gap: var(--spacing-4);
		}

		.perf-breakdown {
			gap: var(--spacing-2);
		}
	}

	@media (max-width: 375px) {
		.chart-big-value {
			font-size: var(--font-size-xl);
		}

		.breakdown-icon {
			width: 40px;
			height: 40px;
		}

		.breakdown-value {
			font-size: var(--font-size-base);
		}

		.asset-card {
			flex: 0 0 160px;
		}
	}
</style>
