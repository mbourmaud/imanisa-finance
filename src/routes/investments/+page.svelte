<script lang="ts">
	interface Owner {
		id: string;
		name: string;
		type: string;
	}

	interface Position {
		id: string;
		account_id: string;
		name: string;
		isin: string | null;
		ticker: string | null;
		asset_type: string;
		quantity: number;
		pru: number;
		currentPrice: number | null;
		currentValue: number;
		investedValue: number;
		gain: number;
		gainPercent: number;
		owner_id?: string;
		owner?: Owner;
		accountName?: string;
		bank?: string;
	}

	interface AssetGroup {
		positions: Position[];
		totalValue: number;
		totalGain: number;
	}

	let { data } = $props<{
		user: { name: string } | null;
		positions: Position[];
		byAssetType: Record<string, AssetGroup>;
		totalValue: number;
		totalInvested: number;
		totalGain: number;
		totalGainPercent: number;
	}>();

	let selectedOwner = $state<'all' | 'owner-mathieu' | 'owner-ninon' | 'owner-joint' | 'owner-isaac'>('all');

	const ownerOptions = [
		{ id: 'all' as const, label: 'Tous', color: 'var(--color-text-muted)' },
		{ id: 'owner-mathieu' as const, label: 'Mathieu', color: 'var(--color-owner-mathieu)' },
		{ id: 'owner-ninon' as const, label: 'Ninon', color: 'var(--color-owner-ninon)' },
		{ id: 'owner-joint' as const, label: 'Commun', color: 'var(--color-owner-joint)' },
		{ id: 'owner-isaac' as const, label: 'Isaac', color: 'var(--color-owner-isaac)' }
	];

	const assetTypeLabels: Record<string, string> = {
		etf: 'ETF',
		crypto: 'Crypto',
		stock: 'Actions',
		other: 'Autre'
	};

	const assetTypeOrder = ['etf', 'stock', 'crypto', 'other'];

	function getOwnerColor(ownerId: string | undefined): string {
		switch (ownerId) {
			case 'owner-mathieu': return 'var(--color-owner-mathieu)';
			case 'owner-ninon': return 'var(--color-owner-ninon)';
			case 'owner-joint': return 'var(--color-owner-joint)';
			case 'owner-isaac': return 'var(--color-owner-isaac)';
			default: return 'var(--color-text-muted)';
		}
	}

	function getOwnerInitial(ownerId: string | undefined): string {
		switch (ownerId) {
			case 'owner-mathieu': return 'M';
			case 'owner-ninon': return 'N';
			case 'owner-joint': return 'C';
			case 'owner-isaac': return 'I';
			default: return '?';
		}
	}

	function formatCurrency(value: number): string {
		return value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
	}

	function formatPercent(value: number): string {
		const sign = value >= 0 ? '+' : '';
		return `${sign}${value.toFixed(2)}%`;
	}

	function formatQuantity(value: number): string {
		if (value === Math.floor(value)) return value.toString();
		return value.toFixed(4).replace(/\.?0+$/, '');
	}

	function filterPositionsByOwner(positions: Position[]): Position[] {
		if (selectedOwner === 'all') return positions;
		return positions.filter((pos) => pos.owner_id === selectedOwner);
	}

	const filteredPositions = $derived(filterPositionsByOwner(data.positions));

	const filteredByAssetType = $derived.by(() => {
		const filtered: Record<string, AssetGroup> = {};
		const entries = Object.entries(data.byAssetType) as [string, AssetGroup][];
		for (const [type, group] of entries) {
			const positions = filterPositionsByOwner(group.positions);
			if (positions.length > 0) {
				filtered[type] = {
					positions,
					totalValue: positions.reduce((sum, p) => sum + p.currentValue, 0),
					totalGain: positions.reduce((sum, p) => sum + p.gain, 0)
				};
			}
		}
		return filtered;
	});

	const sortedAssetTypes = $derived(
		assetTypeOrder.filter((type) => type in filteredByAssetType)
	);

	const filteredTotalValue = $derived(
		filteredPositions.reduce((sum, p) => sum + p.currentValue, 0)
	);

	const filteredTotalInvested = $derived(
		filteredPositions.reduce((sum, p) => sum + p.investedValue, 0)
	);

	const filteredTotalGain = $derived(filteredTotalValue - filteredTotalInvested);

	const filteredTotalGainPercent = $derived(
		filteredTotalInvested > 0 ? (filteredTotalGain / filteredTotalInvested) * 100 : 0
	);
</script>

<div class="investments-page">
	<header class="page-header">
		<div class="header-left">
			<h1>Investissements</h1>
			<div class="header-stats">
				<span class="stat-value">{formatCurrency(filteredTotalValue)}</span>
				<span class="stat-gain" class:positive={filteredTotalGainPercent >= 0} class:negative={filteredTotalGainPercent < 0}>
					{formatPercent(filteredTotalGainPercent)}
				</span>
			</div>
		</div>
		<div class="owner-filter">
			{#each ownerOptions as option}
				<button
					class="owner-pill"
					class:active={selectedOwner === option.id}
					onclick={() => selectedOwner = option.id}
					style="--owner-color: {option.color}"
				>
					<span class="owner-dot"></span>
					<span class="owner-label">{option.label}</span>
				</button>
			{/each}
		</div>
	</header>

	<div class="summary-cards">
		<div class="summary-card">
			<span class="summary-label">Total Investi</span>
			<span class="summary-value">{formatCurrency(filteredTotalInvested)}</span>
		</div>
		<div class="summary-card">
			<span class="summary-label">Valeur Actuelle</span>
			<span class="summary-value">{formatCurrency(filteredTotalValue)}</span>
		</div>
		<div class="summary-card">
			<span class="summary-label">Plus/Moins-value</span>
			<span class="summary-value" class:positive={filteredTotalGain >= 0} class:negative={filteredTotalGain < 0}>
				{formatCurrency(filteredTotalGain)}
				<span class="summary-percent" class:positive={filteredTotalGainPercent >= 0} class:negative={filteredTotalGainPercent < 0}>
					{formatPercent(filteredTotalGainPercent)}
				</span>
			</span>
		</div>
	</div>

	{#if filteredPositions.length === 0}
		<div class="empty-state">
			<div class="empty-icon">
				<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
					<polyline points="16 7 22 7 22 13"/>
				</svg>
			</div>
			<h3>Aucun investissement</h3>
			<p>Commencez par importer vos positions depuis votre courtier.</p>
		</div>
	{:else}
		<div class="asset-groups">
			{#each sortedAssetTypes as assetType, groupIndex}
				{@const group = filteredByAssetType[assetType]}
				<div class="asset-group" style="animation-delay: {groupIndex * 0.05}s">
					<div class="group-header">
						<div class="group-identity">
							<div class="group-icon" class:etf={assetType === 'etf'} class:crypto={assetType === 'crypto'} class:stock={assetType === 'stock'}>
								{#if assetType === 'etf'}
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<rect x="3" y="3" width="7" height="7"/>
										<rect x="14" y="3" width="7" height="7"/>
										<rect x="14" y="14" width="7" height="7"/>
										<rect x="3" y="14" width="7" height="7"/>
									</svg>
								{:else if assetType === 'crypto'}
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.29 4.26m5.908 1.042.348-1.97M7.48 20.364l3.126-17.727"/>
									</svg>
								{:else if assetType === 'stock'}
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
										<polyline points="16 7 22 7 22 13"/>
									</svg>
								{:else}
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<circle cx="12" cy="12" r="10"/>
										<path d="M12 6v6l4 2"/>
									</svg>
								{/if}
							</div>
							<div class="group-info">
								<span class="group-name">{assetTypeLabels[assetType] || assetType}</span>
								<span class="group-count">{group.positions.length} position{group.positions.length > 1 ? 's' : ''}</span>
							</div>
						</div>
						<div class="group-totals">
							<span class="group-value">{formatCurrency(group.totalValue)}</span>
							<span class="group-gain" class:positive={group.totalGain >= 0} class:negative={group.totalGain < 0}>
								{group.totalGain >= 0 ? '+' : ''}{formatCurrency(group.totalGain)}
							</span>
						</div>
					</div>

					<div class="positions-list">
						{#each group.positions as position, posIndex}
							<div class="position-row" style="animation-delay: {(groupIndex * 0.05) + (posIndex * 0.03)}s">
								<div class="position-main">
									<div class="position-identity">
										<span class="position-name">{position.name}</span>
										{#if position.ticker}
											<span class="position-ticker">{position.ticker}</span>
										{/if}
									</div>
									<div class="position-details">
										<span class="position-quantity">{formatQuantity(position.quantity)} × {formatCurrency(position.pru)}</span>
									</div>
								</div>

								<div class="position-sparkline">
									<svg viewBox="0 0 60 24" preserveAspectRatio="none">
										<path
											d="M0,18 L6,15 L12,16 L18,12 L24,14 L30,10 L36,11 L42,8 L48,6 L54,{position.gain >= 0 ? 4 : 20} L60,{position.gain >= 0 ? 2 : 22}"
											fill="none"
											stroke={position.gain >= 0 ? 'var(--color-success-400)' : 'var(--color-danger-400)'}
											stroke-width="1.5"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
									</svg>
								</div>

								<span class="owner-badge" style="background: {getOwnerColor(position.owner_id)}" title={position.owner?.name}>
									{getOwnerInitial(position.owner_id)}
								</span>

								<div class="position-values">
									<span class="position-value">{formatCurrency(position.currentValue)}</span>
									<span class="position-gain" class:positive={position.gain >= 0} class:negative={position.gain < 0}>
										{position.gain >= 0 ? '+' : ''}{formatCurrency(position.gain)}
										<span class="gain-percent">({formatPercent(position.gainPercent)})</span>
									</span>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.investments-page {
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
		gap: var(--spacing-2);
	}

	.page-header h1 {
		font-size: var(--font-size-3xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-primary);
		letter-spacing: var(--letter-spacing-tight);
		margin: 0;
	}

	.header-stats {
		display: flex;
		align-items: baseline;
		gap: var(--spacing-3);
	}

	.stat-value {
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-primary-500);
		letter-spacing: var(--letter-spacing-tight);
	}

	.stat-gain {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		padding: var(--spacing-1) var(--spacing-2);
		border-radius: var(--radius-md);
	}

	.stat-gain.positive {
		color: var(--color-success-500);
		background: var(--color-success-50);
	}

	.stat-gain.negative {
		color: var(--color-danger-500);
		background: var(--color-danger-50);
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

	.summary-cards {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--spacing-4);
		animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s forwards;
		opacity: 0;
	}

	.summary-card {
		background: var(--color-bg-card);
		border-radius: var(--radius-xl);
		border: 1px solid var(--color-border);
		padding: var(--spacing-5);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2);
	}

	.summary-label {
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wide);
	}

	.summary-value {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-primary);
		display: flex;
		align-items: baseline;
		gap: var(--spacing-2);
	}

	.summary-value.positive {
		color: var(--color-success-500);
	}

	.summary-value.negative {
		color: var(--color-danger-500);
	}

	.summary-percent {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
	}

	.summary-percent.positive {
		color: var(--color-success-400);
	}

	.summary-percent.negative {
		color: var(--color-danger-400);
	}

	.empty-state {
		background: var(--color-bg-card);
		border-radius: var(--radius-2xl);
		border: 1px solid var(--color-border);
		padding: var(--spacing-16);
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-4);
		animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s forwards;
		opacity: 0;
	}

	.empty-icon {
		width: 80px;
		height: 80px;
		border-radius: var(--radius-2xl);
		background: var(--gradient-accent-soft);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-primary-500);
		margin-bottom: var(--spacing-2);
	}

	.empty-state h3 {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		margin: 0;
	}

	.empty-state p {
		color: var(--color-text-tertiary);
		margin: 0;
		max-width: 320px;
	}

	.asset-groups {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-6);
	}

	.asset-group {
		background: var(--color-bg-card);
		border-radius: var(--radius-2xl);
		border: 1px solid var(--color-border);
		overflow: hidden;
		animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
		opacity: 0;
	}

	.group-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-5) var(--spacing-6);
		background: var(--gradient-card);
		border-bottom: 1px solid var(--color-border);
	}

	.group-identity {
		display: flex;
		align-items: center;
		gap: var(--spacing-4);
	}

	.group-icon {
		width: 40px;
		height: 40px;
		border-radius: var(--radius-lg);
		background: var(--color-bg-subtle);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-tertiary);
	}

	.group-icon.etf {
		background: rgba(59, 130, 246, 0.1);
		color: #3B82F6;
	}

	.group-icon.crypto {
		background: rgba(245, 158, 11, 0.1);
		color: var(--color-warning-500);
	}

	.group-icon.stock {
		background: var(--color-success-50);
		color: var(--color-success-500);
	}

	.group-info {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-0-5);
	}

	.group-name {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.group-count {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
	}

	.group-totals {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: var(--spacing-0-5);
	}

	.group-value {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-primary);
	}

	.group-gain {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
	}

	.group-gain.positive {
		color: var(--color-success-500);
	}

	.group-gain.negative {
		color: var(--color-danger-500);
	}

	.positions-list {
		display: flex;
		flex-direction: column;
	}

	.position-row {
		display: flex;
		align-items: center;
		gap: var(--spacing-4);
		padding: var(--spacing-4) var(--spacing-6);
		transition: background var(--transition-fast);
		animation: fadeInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
		opacity: 0;
	}

	.position-row:hover {
		background: var(--color-bg-card-hover);
	}

	.position-row:not(:last-child) {
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.position-main {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-1);
	}

	.position-identity {
		display: flex;
		align-items: baseline;
		gap: var(--spacing-2);
	}

	.position-name {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.position-ticker {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		font-family: var(--font-family-mono);
		background: var(--color-bg-subtle);
		padding: var(--spacing-0-5) var(--spacing-1-5);
		border-radius: var(--radius-sm);
	}

	.position-details {
		display: flex;
		gap: var(--spacing-3);
	}

	.position-quantity {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
	}

	.position-sparkline {
		width: 60px;
		height: 24px;
		flex-shrink: 0;
	}

	.position-sparkline svg {
		width: 100%;
		height: 100%;
	}

	.owner-badge {
		width: 26px;
		height: 26px;
		border-radius: var(--radius-full);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 11px;
		font-weight: var(--font-weight-bold);
		color: white;
		flex-shrink: 0;
	}

	.position-values {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		min-width: 140px;
	}

	.position-value {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.position-gain {
		font-size: var(--font-size-sm);
		display: flex;
		align-items: baseline;
		gap: var(--spacing-1);
	}

	.position-gain.positive {
		color: var(--color-success-500);
	}

	.position-gain.negative {
		color: var(--color-danger-500);
	}

	.gain-percent {
		font-size: var(--font-size-xs);
		color: inherit;
		opacity: 0.8;
	}

	.positive {
		color: var(--color-success-500);
	}

	.negative {
		color: var(--color-danger-500);
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 768px) {
		.investments-page {
			gap: var(--spacing-6);
		}

		.page-header {
			flex-direction: column;
			align-items: stretch;
			gap: var(--spacing-3);
		}

		.owner-filter {
			width: calc(100% + var(--spacing-4) * 2);
			margin: 0 calc(var(--spacing-4) * -1);
			padding: var(--spacing-1) var(--spacing-4);
			overflow-x: auto;
			scrollbar-width: none;
			-webkit-overflow-scrolling: touch;
			justify-content: flex-start;
			border-radius: 0;
			border-left: none;
			border-right: none;
			background: transparent;
			border: none;
		}

		.owner-filter::-webkit-scrollbar {
			display: none;
		}

		.page-header h1 {
			font-size: var(--font-size-2xl);
		}

		.stat-value {
			font-size: var(--font-size-xl);
		}

		.summary-cards {
			grid-template-columns: 1fr;
			gap: var(--spacing-3);
		}

		.summary-card {
			padding: var(--spacing-4);
			border-radius: var(--radius-lg);
		}

		.asset-group {
			border-radius: var(--radius-xl);
		}

		.group-header {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-3);
			padding: var(--spacing-4);
		}

		.group-totals {
			align-items: flex-start;
		}

		.position-row {
			flex-wrap: wrap;
			gap: var(--spacing-3);
			padding: var(--spacing-4);
		}

		.position-main {
			flex: 1 1 calc(100% - 60px);
		}

		.position-sparkline {
			display: none;
		}

		.position-values {
			flex: 1 1 100%;
			align-items: flex-start;
			margin-left: 34px;
			margin-top: calc(var(--spacing-1) * -1);
		}

		.owner-badge {
			order: -1;
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

		.group-header,
		.position-row {
			padding: var(--spacing-3);
		}

		.position-name {
			font-size: var(--font-size-sm);
		}

		.position-values {
			margin-left: 34px;
		}

		.group-icon {
			width: 36px;
			height: 36px;
		}
	}

	@media (max-width: 375px) {
		.summary-value {
			font-size: var(--font-size-lg);
		}

		.group-icon {
			width: 32px;
			height: 32px;
		}

		.owner-badge {
			width: 24px;
			height: 24px;
			font-size: 10px;
		}

		.position-values {
			margin-left: 32px;
		}
	}
</style>
