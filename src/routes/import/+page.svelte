<script lang="ts">
	import type { GroupedDataSources, DataSourceWithOwner } from './+page.server';
	import ImportDropZone from '$lib/components/import/ImportDropZone.svelte';

	interface PageData {
		groupedSources: GroupedDataSources[];
		totalSources: number;
	}

	let { data }: { data: PageData } = $props();

	// Import state per source
	let importStates = $state<Record<string, {
		status: 'idle' | 'importing' | 'success' | 'error';
		result: { imported: number; skipped: number; errors: string[] } | null;
	}>>({});

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

	function formatFullDate(): string {
		return new Date().toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}

	function getSourceTypeLabel(type: string): string {
		const labels: Record<string, string> = {
			checking: 'Compte courant',
			savings: 'Épargne',
			livret_a: 'Livret A',
			ldd: 'LDD',
			pel: 'PEL',
			cel: 'CEL',
			pea: 'PEA',
			assurance_vie: 'Assurance-vie',
			crypto: 'Crypto'
		};
		return labels[type] ?? type;
	}

	function openAllLinks() {
		const urls: string[] = [];
		for (const group of data.groupedSources) {
			for (const source of group.sources) {
				urls.push(source.url);
			}
		}
		// Open each URL in a new tab
		for (const url of urls) {
			window.open(url, '_blank', 'noopener,noreferrer');
		}
	}

	async function handleFileUpload(sourceId: string, file: File) {
		importStates[sourceId] = { status: 'importing', result: null };

		try {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('dataSourceId', sourceId);

			const response = await fetch('/api/import/csv', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (!response.ok) {
				importStates[sourceId] = {
					status: 'error',
					result: { imported: 0, skipped: 0, errors: [result.error || 'Erreur inconnue'] }
				};
				return;
			}

			importStates[sourceId] = {
				status: result.errors && result.errors.length > 0 ? 'error' : 'success',
				result
			};
		} catch (error) {
			importStates[sourceId] = {
				status: 'error',
				result: { imported: 0, skipped: 0, errors: [(error as Error).message] }
			};
		}
	}

	function getImportState(sourceId: string) {
		return importStates[sourceId] ?? { status: 'idle', result: null };
	}
</script>

<div class="import-page">
	<header class="page-header">
		<div class="header-left">
			<h1>Import</h1>
			<span class="header-date">{formatFullDate()}</span>
		</div>
		<button class="btn-primary" onclick={openAllLinks} aria-label="Ouvrir tous les liens bancaires">
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
				<polyline points="15 3 21 3 21 9"/>
				<line x1="10" y1="14" x2="21" y2="3"/>
			</svg>
			Ouvrir tous les liens
		</button>
	</header>

	<section class="info-banner">
		<div class="info-icon">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="10"/>
				<line x1="12" y1="16" x2="12" y2="12"/>
				<line x1="12" y1="8" x2="12.01" y2="8"/>
			</svg>
		</div>
		<div class="info-content">
			<strong>Comment importer vos données ?</strong>
			<p>1. Cliquez sur "Ouvrir tous les liens" pour accéder aux pages d'export de vos banques</p>
			<p>2. Téléchargez les fichiers CSV depuis chaque banque</p>
			<p>3. Glissez-déposez chaque fichier sur la zone correspondante ci-dessous</p>
		</div>
	</section>

	<section class="sources-section">
		<div class="section-header">
			<h2 class="section-title">Sources bancaires</h2>
			<span class="source-count">{data.totalSources} source{data.totalSources > 1 ? 's' : ''}</span>
		</div>

		{#if data.groupedSources.length > 0}
			<div class="owner-groups">
				{#each data.groupedSources as group, groupIndex}
					<div class="owner-group" style="--anim-delay: {groupIndex * 0.05}s">
						<div class="owner-header">
							<div
								class="owner-avatar"
								style="background-color: {group.ownerColor ?? 'var(--color-primary-500)'}"
							>
								{group.ownerName.charAt(0)}
							</div>
							<span class="owner-name">{group.ownerName}</span>
							<span class="owner-count">{group.sources.length} compte{group.sources.length > 1 ? 's' : ''}</span>
						</div>

						<div class="sources-list">
							{#each group.sources as source}
								{@const state = getImportState(source.id)}
								<div class="source-card">
									<div class="source-info">
										<div class="source-header">
											<span class="source-name">{source.name}</span>
											<span class="source-type">{getSourceTypeLabel(source.type)}</span>
										</div>
										<div class="source-meta">
											<span class="last-sync">
												<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
													<circle cx="12" cy="12" r="10"/>
													<polyline points="12 6 12 12 16 14"/>
												</svg>
												{formatDate(source.lastSyncAt)}
											</span>
											<a
												href={source.url}
												target="_blank"
												rel="noopener noreferrer"
												class="source-link"
												aria-label="Ouvrir {source.name}"
											>
												<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
													<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
													<polyline points="15 3 21 3 21 9"/>
													<line x1="10" y1="14" x2="21" y2="3"/>
												</svg>
												Ouvrir
											</a>
										</div>
									</div>

									<ImportDropZone
										sourceId={source.id}
										sourceName={source.name}
										status={state.status}
										result={state.result}
										onUpload={(file) => handleFileUpload(source.id, file)}
									/>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="empty-state">
				<div class="empty-icon">
					<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
						<polyline points="17 8 12 3 7 8"/>
						<line x1="12" y1="3" x2="12" y2="15"/>
					</svg>
				</div>
				<span class="empty-text">Aucune source configurée</span>
				<span class="empty-sub">Configurez vos sources bancaires pour commencer</span>
			</div>
		{/if}
	</section>
</div>

<style>
	.import-page {
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

	.info-banner {
		display: flex;
		gap: var(--spacing-4);
		padding: var(--spacing-4);
		background: var(--color-bg-card);
		border-radius: var(--radius-xl);
		border: 1px solid var(--color-border);
		animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s forwards;
		opacity: 0;
	}

	.info-icon {
		flex-shrink: 0;
		width: 40px;
		height: 40px;
		border-radius: var(--radius-lg);
		background: var(--color-primary-50);
		color: var(--color-primary-500);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.info-content {
		flex: 1;
	}

	.info-content strong {
		display: block;
		color: var(--color-text-primary);
		font-weight: var(--font-weight-semibold);
		margin-bottom: var(--spacing-2);
	}

	.info-content p {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		margin: var(--spacing-1) 0;
		line-height: 1.5;
	}

	.sources-section {
		animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s forwards;
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

	.owner-groups {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-6);
	}

	.owner-group {
		animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) calc(0.1s + var(--anim-delay)) forwards;
		opacity: 0;
	}

	.owner-header {
		display: flex;
		align-items: center;
		gap: var(--spacing-3);
		margin-bottom: var(--spacing-3);
	}

	.owner-avatar {
		width: 32px;
		height: 32px;
		border-radius: var(--radius-full);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: var(--font-weight-semibold);
		font-size: var(--font-size-sm);
	}

	.owner-name {
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.owner-count {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	.sources-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-3);
	}

	.source-card {
		background: var(--color-bg-card);
		border-radius: var(--radius-xl);
		border: 1px solid var(--color-border);
		padding: var(--spacing-4);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-4);
		transition: all var(--transition-fast);
	}

	.source-card:hover {
		border-color: var(--color-border-hover);
	}

	.source-info {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2);
	}

	.source-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--spacing-2);
	}

	.source-name {
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
	}

	.source-type {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		background: var(--color-bg-subtle);
		padding: var(--spacing-1) var(--spacing-2);
		border-radius: var(--radius-md);
	}

	.source-meta {
		display: flex;
		align-items: center;
		gap: var(--spacing-4);
	}

	.last-sync {
		display: flex;
		align-items: center;
		gap: var(--spacing-1);
		font-size: var(--font-size-sm);
		color: var(--color-text-tertiary);
	}

	.source-link {
		display: flex;
		align-items: center;
		gap: var(--spacing-1);
		font-size: var(--font-size-sm);
		color: var(--color-primary-500);
		text-decoration: none;
		transition: color var(--transition-fast);
	}

	.source-link:hover {
		color: var(--color-primary-600);
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

	@media (max-width: 768px) {
		.import-page {
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

		.info-banner {
			flex-direction: column;
			gap: var(--spacing-3);
		}

		.info-icon {
			width: 36px;
			height: 36px;
		}

		.source-header {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-1);
		}

		.source-meta {
			flex-wrap: wrap;
			gap: var(--spacing-3);
		}

		.section-title {
			font-size: var(--font-size-base);
		}

		.empty-state {
			padding: var(--spacing-8);
		}
	}

	@media (max-width: 375px) {
		.owner-avatar {
			width: 28px;
			height: 28px;
			font-size: var(--font-size-xs);
		}

		.owner-name {
			font-size: var(--font-size-sm);
		}
	}
</style>
