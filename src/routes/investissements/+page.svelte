<script lang="ts">
	import type {
		GroupedPositions,
		InvestmentSummary,
		InvestmentSourceWithOwner,
		PositionData
	} from './+page.server';

	interface PageData {
		groupedPositions: GroupedPositions[];
		summary: InvestmentSummary;
	}

	let { data }: { data: PageData } = $props();

	// Import state per source
	let importStates = $state<
		Record<
			string,
			{
				status: 'idle' | 'importing' | 'success' | 'error';
				result: { positions: number; transactions: number; errors: string[] } | null;
			}
		>
	>({});

	function formatCurrency(value: number): string {
		return value.toLocaleString('fr-FR', {
			style: 'currency',
			currency: 'EUR',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
	}

	function formatCurrencyCompact(value: number): string {
		return value.toLocaleString('fr-FR', {
			style: 'currency',
			currency: 'EUR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		});
	}

	function formatPercent(value: number): string {
		const sign = value >= 0 ? '+' : '';
		return `${sign}${value.toFixed(2)}%`;
	}

	function formatQuantity(value: number): string {
		if (value === Math.floor(value)) return value.toString();
		if (value >= 0.01) return value.toFixed(2);
		return value.toFixed(6).replace(/\.?0+$/, '');
	}

	function formatFullDate(): string {
		return new Date().toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}

	function formatDate(isoDate: string | null): string {
		if (!isoDate) return 'Jamais';
		return new Date(isoDate).toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getSourceTypeLabel(type: string): string {
		const labels: Record<string, string> = {
			pea: 'PEA',
			assurance_vie: 'Assurance-vie',
			crypto: 'Crypto',
			cto: 'CTO'
		};
		return labels[type] ?? type;
	}

	function getSourceTypeIcon(type: string): string {
		// Return icon name for the source type
		switch (type) {
			case 'pea':
				return 'trending-up';
			case 'assurance_vie':
				return 'shield';
			case 'crypto':
				return 'bitcoin';
			case 'cto':
				return 'briefcase';
			default:
				return 'chart';
		}
	}

	async function handleFileUpload(sourceId: string, file: File) {
		importStates[sourceId] = { status: 'importing', result: null };

		try {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('sourceId', sourceId);

			const response = await fetch('/api/investments/import', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (!response.ok) {
				importStates[sourceId] = {
					status: 'error',
					result: { positions: 0, transactions: 0, errors: [result.error || 'Erreur inconnue'] }
				};
				return;
			}

			importStates[sourceId] = {
				status: result.errors && result.errors.length > 0 ? 'error' : 'success',
				result
			};

			// Reload page data after successful import
			if (result.errors?.length === 0) {
				window.location.reload();
			}
		} catch (error) {
			importStates[sourceId] = {
				status: 'error',
				result: { positions: 0, transactions: 0, errors: [(error as Error).message] }
			};
		}
	}

	function getImportState(sourceId: string) {
		return importStates[sourceId] ?? { status: 'idle', result: null };
	}

	let isDragOver = $state<Record<string, boolean>>({});
	let fileInputs = $state<Record<string, HTMLInputElement | null>>({});

	function handleDragOver(event: DragEvent, sourceId: string) {
		event.preventDefault();
		isDragOver[sourceId] = true;
	}

	function handleDragLeave(event: DragEvent, sourceId: string) {
		event.preventDefault();
		isDragOver[sourceId] = false;
	}

	function handleDrop(event: DragEvent, sourceId: string) {
		event.preventDefault();
		isDragOver[sourceId] = false;

		const files = event.dataTransfer?.files;
		if (files && files.length > 0) {
			const file = files[0];
			if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
				handleFileUpload(sourceId, file);
			}
		}
	}

	function handleFileSelect(event: Event, sourceId: string) {
		const target = event.target as HTMLInputElement;
		const files = target.files;
		if (files && files.length > 0) {
			handleFileUpload(sourceId, files[0]);
		}
		// Reset input to allow re-uploading same file
		if (fileInputs[sourceId]) {
			fileInputs[sourceId]!.value = '';
		}
	}

	function handleDropZoneClick(sourceId: string) {
		fileInputs[sourceId]?.click();
	}

	function handleDropZoneKeyDown(event: KeyboardEvent, sourceId: string) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			fileInputs[sourceId]?.click();
		}
	}

	function openAllLinks() {
		for (const group of data.groupedPositions) {
			window.open(group.source.url, '_blank', 'noopener,noreferrer');
		}
	}

	const totalPositionsCount = $derived(
		data.groupedPositions.reduce((sum, group) => sum + group.positions.length, 0)
	);
</script>

<div class="investissements-page">
	<header class="page-header">
		<div class="header-left">
			<h1>Investissements</h1>
			<span class="header-date">{formatFullDate()}</span>
		</div>
		{#if data.groupedPositions.length > 0}
			<button class="btn-primary" onclick={openAllLinks} aria-label="Ouvrir tous les liens">
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
					<polyline points="15 3 21 3 21 9" />
					<line x1="10" y1="14" x2="21" y2="3" />
				</svg>
				Ouvrir les sources
			</button>
		{/if}
	</header>

	<section class="kpi-section">
		<div class="kpi-cards">
			<div class="kpi-card">
				<div class="kpi-icon primary">
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<line x1="12" y1="1" x2="12" y2="23" />
						<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
					</svg>
				</div>
				<div class="kpi-content">
					<span class="kpi-label">Total investi</span>
					<span class="kpi-value">{formatCurrencyCompact(data.summary.totalInvested)}</span>
					<span class="kpi-sub">{totalPositionsCount} position{totalPositionsCount > 1 ? 's' : ''}</span>
				</div>
			</div>

			<div class="kpi-card">
				<div class="kpi-icon gold">
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
						<polyline points="16 7 22 7 22 13" />
					</svg>
				</div>
				<div class="kpi-content">
					<span class="kpi-label">Valorisation</span>
					<span class="kpi-value">{formatCurrencyCompact(data.summary.currentValue)}</span>
					<span class="kpi-sub">Valeur actuelle</span>
				</div>
			</div>

			<div
				class="kpi-card highlight"
				class:positive={data.summary.totalGainLoss >= 0}
				class:negative={data.summary.totalGainLoss < 0}
			>
				<div class="kpi-icon" class:success={data.summary.totalGainLoss >= 0} class:danger={data.summary.totalGainLoss < 0}>
					{#if data.summary.totalGainLoss >= 0}
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
							<polyline points="16 7 22 7 22 13" />
						</svg>
					{:else}
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
							<polyline points="16 17 22 17 22 11" />
						</svg>
					{/if}
				</div>
				<div class="kpi-content">
					<span class="kpi-label">Plus/Moins-value</span>
					<span
						class="kpi-value"
						class:text-success={data.summary.totalGainLoss >= 0}
						class:text-danger={data.summary.totalGainLoss < 0}
					>
						{data.summary.totalGainLoss >= 0 ? '+' : ''}{formatCurrencyCompact(data.summary.totalGainLoss)}
					</span>
					<span
						class="kpi-sub kpi-percent"
						class:text-success={data.summary.totalGainLossPercent >= 0}
						class:text-danger={data.summary.totalGainLossPercent < 0}
					>
						{formatPercent(data.summary.totalGainLossPercent)}
					</span>
				</div>
			</div>
		</div>
	</section>

	<section class="sources-section">
		<div class="section-header">
			<h2 class="section-title">Portefeuille</h2>
			<span class="source-count"
				>{data.groupedPositions.length} source{data.groupedPositions.length > 1 ? 's' : ''}</span
			>
		</div>

		{#if data.groupedPositions.length > 0}
			<div class="source-groups">
				{#each data.groupedPositions as group, groupIndex}
					{@const state = getImportState(group.source.id)}
					<div class="source-group" style="--anim-delay: {groupIndex * 0.05}s">
						<div class="source-header">
							<div class="source-identity">
								<div
									class="source-icon"
									class:pea={group.source.type === 'pea'}
									class:av={group.source.type === 'assurance_vie'}
									class:crypto={group.source.type === 'crypto'}
									class:cto={group.source.type === 'cto'}
								>
									{#if group.source.type === 'pea'}
										<svg
											width="20"
											height="20"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
										>
											<polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
											<polyline points="16 7 22 7 22 13" />
										</svg>
									{:else if group.source.type === 'assurance_vie'}
										<svg
											width="20"
											height="20"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
										>
											<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
										</svg>
									{:else if group.source.type === 'crypto'}
										<svg
											width="20"
											height="20"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
										>
											<path
												d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.29 4.26m5.908 1.042.348-1.97M7.48 20.364l3.126-17.727"
											/>
										</svg>
									{:else}
										<svg
											width="20"
											height="20"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
										>
											<rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
											<path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
										</svg>
									{/if}
								</div>
								<div class="source-info">
									<div class="source-name-row">
										<span class="source-name">{group.source.name}</span>
										<span class="source-type">{getSourceTypeLabel(group.source.type)}</span>
									</div>
									<div class="source-meta">
										<span
											class="owner-badge"
											style="background-color: {group.source.ownerColor ?? 'var(--color-primary-500)'}"
										>
											{group.source.ownerName.charAt(0)}
										</span>
										<span class="owner-name">{group.source.ownerName}</span>
										<span class="separator">•</span>
										<span class="last-sync">{formatDate(group.source.lastSyncAt)}</span>
									</div>
								</div>
							</div>
							<div class="source-totals">
								<span class="source-value">{formatCurrency(group.subtotal.currentValue)}</span>
								<span
									class="source-gain"
									class:positive={group.subtotal.gainLoss >= 0}
									class:negative={group.subtotal.gainLoss < 0}
								>
									{group.subtotal.gainLoss >= 0 ? '+' : ''}{formatCurrency(group.subtotal.gainLoss)}
									<span class="gain-percent">({formatPercent(group.subtotal.gainLossPercent)})</span>
								</span>
							</div>
						</div>

						{#if group.positions.length > 0}
							<div class="positions-list">
								{#each group.positions as position, posIndex}
									<div
										class="position-row"
										style="animation-delay: {groupIndex * 0.05 + posIndex * 0.02}s"
									>
										<div class="position-main">
											<div class="position-identity">
												<span class="position-symbol">{position.symbol}</span>
												{#if position.isin}
													<span class="position-isin">{position.isin}</span>
												{/if}
											</div>
											<div class="position-details">
												<span class="position-quantity"
													>{formatQuantity(position.quantity)} × {formatCurrency(position.avgBuyPrice)}</span
												>
											</div>
										</div>

										<div class="position-values">
											<span class="position-value">{formatCurrency(position.currentValue)}</span>
											<span
												class="position-gain"
												class:positive={position.gainLoss >= 0}
												class:negative={position.gainLoss < 0}
											>
												{position.gainLoss >= 0 ? '+' : ''}{formatCurrency(position.gainLoss)}
												<span class="gain-percent">({formatPercent(position.gainLossPercent)})</span>
											</span>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<div class="empty-positions">
								<span>Aucune position</span>
							</div>
						{/if}

						<!-- Import drop zone for this source -->
						<div class="import-section">
							<div
								class="drop-zone"
								class:drag-over={isDragOver[group.source.id]}
								class:importing={state.status === 'importing'}
								class:success={state.status === 'success'}
								class:error={state.status === 'error'}
								ondragover={(e) => handleDragOver(e, group.source.id)}
								ondragleave={(e) => handleDragLeave(e, group.source.id)}
								ondrop={(e) => handleDrop(e, group.source.id)}
								onclick={() => handleDropZoneClick(group.source.id)}
								onkeydown={(e) => handleDropZoneKeyDown(e, group.source.id)}
								role="button"
								tabindex="0"
								aria-label="Zone de dépôt pour {group.source.name}"
							>
								<input
									bind:this={fileInputs[group.source.id]}
									type="file"
									accept=".xlsx,.xls,.csv"
									onchange={(e) => handleFileSelect(e, group.source.id)}
									class="file-input"
									aria-hidden="true"
									tabindex="-1"
								/>

								{#if state.status === 'importing'}
									<div class="drop-content">
										<div class="spinner"></div>
										<span class="drop-text">Import en cours...</span>
									</div>
								{:else if state.status === 'success' && state.result}
									<div class="drop-content">
										<div class="status-icon success-icon">
											<svg
												width="20"
												height="20"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
											>
												<polyline points="20 6 9 17 4 12" />
											</svg>
										</div>
										<span class="drop-text success-text">
											{state.result.positions} position{state.result.positions > 1 ? 's' : ''} importée{state.result.positions > 1 ? 's' : ''}
										</span>
									</div>
								{:else if state.status === 'error' && state.result}
									<div class="drop-content">
										<div class="status-icon error-icon">
											<svg
												width="20"
												height="20"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
											>
												<circle cx="12" cy="12" r="10" />
												<line x1="15" y1="9" x2="9" y2="15" />
												<line x1="9" y1="9" x2="15" y2="15" />
											</svg>
										</div>
										<span class="drop-text error-text">{state.result.errors[0]}</span>
									</div>
								{:else}
									<div class="drop-content">
										<div class="drop-icon">
											<svg
												width="18"
												height="18"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
											>
												<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
												<polyline points="17 8 12 3 7 8" />
												<line x1="12" y1="3" x2="12" y2="15" />
											</svg>
										</div>
										<span class="drop-text">Glissez un fichier XLSX</span>
										<a
											href={group.source.url}
											target="_blank"
											rel="noopener noreferrer"
											class="source-link"
											onclick={(e) => e.stopPropagation()}
										>
											Ouvrir {group.source.name}
										</a>
									</div>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="empty-state">
				<div class="empty-icon">
					<svg
						width="48"
						height="48"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
						<polyline points="16 7 22 7 22 13" />
					</svg>
				</div>
				<span class="empty-text">Aucune source d'investissement</span>
				<span class="empty-sub">Configurez vos sources pour commencer à suivre vos investissements</span>
			</div>
		{/if}
	</section>
</div>

<style>
	.investissements-page {
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

	.btn-primary {
		display: flex;
		align-items: center;
		gap: var(--spacing-2);
		padding: var(--spacing-3) var(--spacing-4);
		background: var(--gradient-accent);
		color: white;
		border: none;
		border-radius: var(--radius-lg);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		transition: all var(--transition-fast);
		min-height: 44px;
	}

	.btn-primary:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(250, 128, 114, 0.3);
	}

	.btn-primary:active {
		transform: translateY(0);
	}

	/* KPI Section */
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
		transition: all var(--transition-fast);
	}

	.kpi-card:hover {
		background: var(--color-bg-card-hover);
		border-color: var(--color-border-hover);
	}

	.kpi-card.highlight.positive {
		background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%);
		border-color: rgba(16, 185, 129, 0.2);
	}

	.kpi-card.highlight.negative {
		background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.02) 100%);
		border-color: rgba(239, 68, 68, 0.2);
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

	.kpi-icon.primary {
		background: var(--color-primary-50);
		color: var(--color-primary-500);
	}

	.kpi-icon.gold {
		background: rgba(212, 168, 83, 0.1);
		color: var(--color-gold-500);
	}

	.kpi-icon.success {
		background: rgba(16, 185, 129, 0.1);
		color: var(--color-success-500);
	}

	.kpi-icon.danger {
		background: var(--color-danger-50);
		color: var(--color-danger-500);
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

	.kpi-percent {
		font-weight: var(--font-weight-semibold);
	}

	.text-success {
		color: var(--color-success-500);
	}

	.text-danger {
		color: var(--color-danger-500);
	}

	/* Sources Section */
	.sources-section {
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

	.source-count {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		background: var(--color-bg-subtle);
		padding: var(--spacing-1) var(--spacing-3);
		border-radius: var(--radius-full);
	}

	.source-groups {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-6);
	}

	.source-group {
		background: var(--color-bg-card);
		border-radius: var(--radius-2xl);
		border: 1px solid var(--color-border);
		overflow: hidden;
		animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) calc(0.15s + var(--anim-delay)) forwards;
		opacity: 0;
	}

	.source-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-5) var(--spacing-6);
		background: var(--gradient-card);
		border-bottom: 1px solid var(--color-border);
		gap: var(--spacing-4);
	}

	.source-identity {
		display: flex;
		align-items: center;
		gap: var(--spacing-4);
		min-width: 0;
	}

	.source-icon {
		width: 44px;
		height: 44px;
		border-radius: var(--radius-lg);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		background: var(--color-bg-subtle);
		color: var(--color-text-tertiary);
	}

	.source-icon.pea {
		background: rgba(16, 185, 129, 0.1);
		color: var(--color-success-500);
	}

	.source-icon.av {
		background: rgba(59, 130, 246, 0.1);
		color: #3b82f6;
	}

	.source-icon.crypto {
		background: rgba(245, 158, 11, 0.1);
		color: var(--color-warning-500);
	}

	.source-icon.cto {
		background: rgba(139, 92, 246, 0.1);
		color: #8b5cf6;
	}

	.source-info {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-1);
		min-width: 0;
	}

	.source-name-row {
		display: flex;
		align-items: center;
		gap: var(--spacing-2);
		flex-wrap: wrap;
	}

	.source-name {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.source-type {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		background: var(--color-bg-subtle);
		padding: var(--spacing-0-5) var(--spacing-2);
		border-radius: var(--radius-md);
	}

	.source-meta {
		display: flex;
		align-items: center;
		gap: var(--spacing-2);
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	.owner-badge {
		width: 20px;
		height: 20px;
		border-radius: var(--radius-full);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 11px;
		font-weight: var(--font-weight-semibold);
	}

	.owner-name {
		color: var(--color-text-secondary);
	}

	.separator {
		color: var(--color-text-muted);
	}

	.last-sync {
		color: var(--color-text-tertiary);
	}

	.source-totals {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: var(--spacing-0-5);
		flex-shrink: 0;
	}

	.source-value {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-primary);
	}

	.source-gain {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		display: flex;
		align-items: baseline;
		gap: var(--spacing-1);
	}

	.source-gain.positive {
		color: var(--color-success-500);
	}

	.source-gain.negative {
		color: var(--color-danger-500);
	}

	.gain-percent {
		font-size: var(--font-size-xs);
		opacity: 0.8;
	}

	/* Positions List */
	.positions-list {
		display: flex;
		flex-direction: column;
	}

	.position-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
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

	.position-symbol {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.position-isin {
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
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
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

	.empty-positions {
		padding: var(--spacing-6);
		text-align: center;
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
	}

	/* Import Section */
	.import-section {
		padding: var(--spacing-4) var(--spacing-6);
		background: var(--color-bg-subtle);
		border-top: 1px solid var(--color-border);
	}

	.drop-zone {
		border: 2px dashed var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--spacing-4);
		min-height: 64px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all var(--transition-fast);
		background: var(--color-bg-card);
	}

	.drop-zone:hover {
		border-color: var(--color-primary-300);
		background: var(--color-primary-50);
	}

	.drop-zone:focus-visible {
		outline: 2px solid var(--color-primary-500);
		outline-offset: 2px;
	}

	.drop-zone.drag-over {
		border-color: var(--color-primary-500);
		background: var(--color-primary-50);
		border-style: solid;
	}

	.drop-zone.importing {
		border-color: var(--color-primary-300);
		cursor: wait;
	}

	.drop-zone.success {
		border-color: var(--color-success-300);
		background: rgba(16, 185, 129, 0.05);
	}

	.drop-zone.error {
		border-color: var(--color-danger-300);
		background: rgba(239, 68, 68, 0.05);
	}

	.file-input {
		display: none;
	}

	.drop-content {
		display: flex;
		align-items: center;
		gap: var(--spacing-3);
		text-align: center;
	}

	.drop-icon {
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	.drop-text {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		font-weight: var(--font-weight-medium);
	}

	.drop-text.success-text {
		color: var(--color-success-600);
	}

	.drop-text.error-text {
		color: var(--color-danger-600);
	}

	.source-link {
		font-size: var(--font-size-xs);
		color: var(--color-primary-500);
		text-decoration: none;
		padding: var(--spacing-1) var(--spacing-2);
		border-radius: var(--radius-md);
		transition: all var(--transition-fast);
	}

	.source-link:hover {
		color: var(--color-primary-600);
		background: var(--color-primary-50);
	}

	.spinner {
		width: 20px;
		height: 20px;
		border: 2px solid var(--color-primary-200);
		border-top-color: var(--color-primary-500);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.status-icon {
		width: 20px;
		height: 20px;
		flex-shrink: 0;
	}

	.success-icon {
		color: var(--color-success-500);
	}

	.error-icon {
		color: var(--color-danger-500);
	}

	/* Empty State */
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

	/* Responsive */
	@media (max-width: 1024px) {
		.kpi-cards {
			grid-template-columns: repeat(2, 1fr);
		}

		.kpi-card:last-child {
			grid-column: span 2;
		}
	}

	@media (max-width: 768px) {
		.investissements-page {
			gap: var(--spacing-6);
		}

		.page-header {
			flex-direction: column;
			gap: var(--spacing-4);
		}

		.page-header h1 {
			font-size: var(--font-size-2xl);
		}

		.btn-primary {
			width: 100%;
			justify-content: center;
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

		.source-header {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-3);
			padding: var(--spacing-4);
		}

		.source-totals {
			align-items: flex-start;
		}

		.source-icon {
			width: 40px;
			height: 40px;
		}

		.position-row {
			flex-wrap: wrap;
			gap: var(--spacing-2);
			padding: var(--spacing-4);
		}

		.position-values {
			flex: 1 1 100%;
			align-items: flex-start;
			margin-top: var(--spacing-1);
		}

		.import-section {
			padding: var(--spacing-3) var(--spacing-4);
		}

		.drop-content {
			flex-direction: column;
			gap: var(--spacing-2);
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

		.source-icon {
			width: 36px;
			height: 36px;
		}

		.source-name {
			font-size: var(--font-size-base);
		}

		.position-row {
			padding: var(--spacing-3);
		}
	}
</style>
