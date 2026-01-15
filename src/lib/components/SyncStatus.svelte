<script lang="ts">
	interface SyncStatusData {
		source: string;
		lastSyncAt: string | null;
		lastSyncStatus: 'success' | 'failure' | 'pending' | 'running';
		lastError: string | null;
		daysSinceLastSync: number | null;
		isStale: boolean;
	}

	let statuses = $state<SyncStatusData[]>([]);
	let loading = $state(false);
	let syncing = $state<string | null>(null);
	let error = $state<string | null>(null);
	let showPanel = $state(false);

	async function fetchStatus() {
		try {
			const res = await fetch('/api/scraper/status');
			const data = await res.json();
			if (data.success) {
				statuses = data.statuses;
			}
		} catch (e) {
			console.error('Failed to fetch sync status:', e);
		}
	}

	async function syncBinance() {
		syncing = 'Binance';
		error = null;

		try {
			const res = await fetch('/api/scraper/binance/sync', { method: 'POST' });
			const data = await res.json();

			if (!data.success) {
				error = data.error || 'Sync failed';
			}

			await fetchStatus();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Sync failed';
		} finally {
			syncing = null;
		}
	}

	function formatLastSync(dateStr: string | null): string {
		if (!dateStr) return 'Jamais';

		const date = new Date(dateStr);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / (1000 * 60));
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffMins < 1) return "A l'instant";
		if (diffMins < 60) return `Il y a ${diffMins} min`;
		if (diffHours < 24) return `Il y a ${diffHours}h`;
		if (diffDays === 1) return 'Hier';
		if (diffDays < 7) return `Il y a ${diffDays} jours`;

		return date.toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'short'
		});
	}

	function getStatusIcon(status: string): string {
		switch (status) {
			case 'success':
				return '✓';
			case 'failure':
				return '✗';
			case 'running':
				return '↻';
			default:
				return '○';
		}
	}

	function getStatusColor(status: string, isStale: boolean): string {
		if (status === 'running') return 'var(--color-primary-500)';
		if (status === 'failure') return 'var(--color-danger-500)';
		if (status === 'success' && !isStale) return 'var(--color-success-500)';
		return 'var(--color-warning-500)';
	}

	// Fetch status on mount
	$effect(() => {
		fetchStatus();
	});

	// Get overall status for the badge
	const overallStatus = $derived(() => {
		if (statuses.length === 0) return 'pending';
		if (statuses.some((s) => s.lastSyncStatus === 'running')) return 'running';
		if (statuses.some((s) => s.lastSyncStatus === 'failure')) return 'warning';
		if (statuses.some((s) => s.isStale)) return 'warning';
		return 'success';
	});

	const lastSyncAgo = $derived(() => {
		const syncedStatuses = statuses.filter((s) => s.lastSyncAt);
		if (syncedStatuses.length === 0) return null;

		const dates = syncedStatuses.map((s) => new Date(s.lastSyncAt!).getTime());
		const mostRecent = Math.max(...dates);
		return formatLastSync(new Date(mostRecent).toISOString());
	});
</script>

<div class="sync-wrapper">
	<button class="sync-trigger" onclick={() => (showPanel = !showPanel)} title="Sync Status">
		<span
			class="status-dot"
			class:success={overallStatus() === 'success'}
			class:warning={overallStatus() === 'warning'}
			class:running={overallStatus() === 'running'}
		></span>
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
			<path d="M3 3v5h5" />
			<path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
			<path d="M16 16h5v5" />
		</svg>
		{#if lastSyncAgo()}
			<span class="sync-time">{lastSyncAgo()}</span>
		{/if}
	</button>

	{#if showPanel}
		<div class="sync-panel">
			<div class="panel-header">
				<h3>Synchronisation</h3>
				<button class="close-btn" onclick={() => (showPanel = false)}>×</button>
			</div>

			{#if error}
				<div class="error-banner">{error}</div>
			{/if}

			<div class="sources-list">
				{#each statuses as status}
					<div class="source-item" class:stale={status.isStale}>
						<div class="source-info">
							<span
								class="source-status"
								style="color: {getStatusColor(status.lastSyncStatus, status.isStale)}"
							>
								{getStatusIcon(status.lastSyncStatus)}
							</span>
							<div class="source-details">
								<span class="source-name">{status.source}</span>
								<span class="source-date">{formatLastSync(status.lastSyncAt)}</span>
							</div>
						</div>
						{#if status.source === 'Binance'}
							<button
								class="sync-btn"
								onclick={syncBinance}
								disabled={syncing !== null}
							>
								{#if syncing === 'Binance'}
									<span class="spinner"></span>
								{:else}
									Sync
								{/if}
							</button>
						{:else}
							<span class="coming-soon">Phase 2</span>
						{/if}
					</div>
				{/each}
			</div>

			<div class="panel-footer">
				<button class="refresh-btn" onclick={fetchStatus} disabled={loading}>
					Rafraîchir
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.sync-wrapper {
		position: relative;
	}

	.sync-trigger {
		display: flex;
		align-items: center;
		gap: var(--spacing-2);
		padding: var(--spacing-2) var(--spacing-3);
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition:
			background-color var(--transition-fast),
			border-color var(--transition-fast);
	}

	.sync-trigger:hover {
		background: var(--color-bg-card-hover);
		border-color: var(--color-border-hover);
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--color-warning-500);
	}

	.status-dot.success {
		background: var(--color-success-500);
	}

	.status-dot.warning {
		background: var(--color-warning-500);
	}

	.status-dot.running {
		background: var(--color-primary-500);
		animation: pulse 1.5s infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.4;
		}
	}

	.sync-time {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
	}

	.sync-panel {
		position: absolute;
		top: calc(100% + var(--spacing-2));
		right: 0;
		width: 320px;
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-lg);
		z-index: 100;
		overflow: hidden;
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-4);
		border-bottom: 1px solid var(--color-border);
	}

	.panel-header h3 {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		margin: 0;
	}

	.close-btn {
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		color: var(--color-text-muted);
		font-size: var(--font-size-lg);
		cursor: pointer;
		border-radius: var(--radius-md);
		transition:
			background-color var(--transition-fast),
			color var(--transition-fast);
	}

	.close-btn:hover {
		background: var(--color-bg-subtle);
		color: var(--color-text-primary);
	}

	.error-banner {
		padding: var(--spacing-3) var(--spacing-4);
		background: var(--color-danger-50);
		color: var(--color-danger-500);
		font-size: var(--font-size-sm);
	}

	.sources-list {
		padding: var(--spacing-2);
	}

	.source-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-3);
		border-radius: var(--radius-lg);
		transition: background var(--transition-fast);
	}

	.source-item:hover {
		background: var(--color-bg-subtle);
	}

	.source-item.stale {
		opacity: 0.7;
	}

	.source-info {
		display: flex;
		align-items: center;
		gap: var(--spacing-3);
	}

	.source-status {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-bold);
	}

	.source-details {
		display: flex;
		flex-direction: column;
	}

	.source-name {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
	}

	.source-date {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
	}

	.sync-btn {
		padding: var(--spacing-1-5) var(--spacing-3);
		background: var(--color-primary-500);
		color: white;
		border: none;
		border-radius: var(--radius-md);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		transition: background-color var(--transition-fast);
		min-width: 60px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.sync-btn:hover:not(:disabled) {
		background: var(--color-primary-600);
	}

	.sync-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.spinner {
		width: 14px;
		height: 14px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.coming-soon {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		padding: var(--spacing-1-5) var(--spacing-3);
		background: var(--color-bg-subtle);
		border-radius: var(--radius-md);
	}

	.panel-footer {
		padding: var(--spacing-3) var(--spacing-4);
		border-top: 1px solid var(--color-border);
	}

	.refresh-btn {
		width: 100%;
		padding: var(--spacing-2) var(--spacing-4);
		background: var(--color-bg-subtle);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
		cursor: pointer;
		transition:
			background-color var(--transition-fast),
			border-color var(--transition-fast);
	}

	.refresh-btn:hover:not(:disabled) {
		background: var(--color-bg-elevated);
		border-color: var(--color-border-hover);
	}

	.refresh-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	@media (max-width: 640px) {
		.sync-panel {
			position: fixed;
			top: auto;
			bottom: 0;
			left: 0;
			right: 0;
			width: 100%;
			border-radius: var(--radius-xl) var(--radius-xl) 0 0;
		}

		.sync-time {
			display: none;
		}
	}

	/* Respect reduced motion preference */
	@media (prefers-reduced-motion: reduce) {
		.spinner {
			animation: none;
		}

		.status-dot.running {
			animation: none;
		}
	}
</style>
