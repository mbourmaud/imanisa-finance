<script lang="ts">
	interface Props {
		sourceId: string;
		sourceName: string;
		status: 'idle' | 'importing' | 'success' | 'error';
		result: { imported: number; skipped: number; errors: string[] } | null;
		onUpload: (file: File) => void;
	}

	let { sourceId, sourceName, status, result, onUpload }: Props = $props();

	let isDragOver = $state(false);
	let fileInput: HTMLInputElement | null = $state(null);

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragOver = true;
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		isDragOver = false;
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragOver = false;

		const files = event.dataTransfer?.files;
		if (files && files.length > 0) {
			const file = files[0];
			if (file.name.endsWith('.csv')) {
				onUpload(file);
			}
		}
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const files = target.files;
		if (files && files.length > 0) {
			onUpload(files[0]);
		}
		// Reset input to allow re-uploading same file
		if (fileInput) {
			fileInput.value = '';
		}
	}

	function handleClick() {
		fileInput?.click();
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			fileInput?.click();
		}
	}
</script>

<div
	class="drop-zone"
	class:drag-over={isDragOver}
	class:importing={status === 'importing'}
	class:success={status === 'success'}
	class:error={status === 'error'}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
	onclick={handleClick}
	onkeydown={handleKeyDown}
	role="button"
	tabindex="0"
	aria-label="Zone de dépôt pour {sourceName}"
>
	<input
		bind:this={fileInput}
		type="file"
		accept=".csv"
		onchange={handleFileSelect}
		class="file-input"
		aria-hidden="true"
		tabindex="-1"
	/>

	<div class="drop-status" aria-live="polite" aria-atomic="true">
		{#if status === 'importing'}
			<div class="drop-content">
				<div class="spinner" aria-hidden="true"></div>
				<span class="drop-text">Import en cours...</span>
			</div>
		{:else if status === 'success' && result}
			<div class="drop-content">
				<div class="status-icon success-icon" aria-hidden="true">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="20 6 9 17 4 12"/>
					</svg>
				</div>
				<div class="result-text">
					<span class="result-main">{result.imported} transaction{result.imported > 1 ? 's' : ''} importée{result.imported > 1 ? 's' : ''}</span>
					{#if result.skipped > 0}
						<span class="result-sub">{result.skipped} ignorée{result.skipped > 1 ? 's' : ''} (doublons)</span>
					{/if}
				</div>
			</div>
		{:else if status === 'error' && result}
			<div class="drop-content" role="alert">
				<div class="status-icon error-icon" aria-hidden="true">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="12" cy="12" r="10"/>
						<line x1="15" y1="9" x2="9" y2="15"/>
						<line x1="9" y1="9" x2="15" y2="15"/>
					</svg>
				</div>
				<div class="result-text">
					<span class="result-main error-text">Erreur d'import</span>
					{#each result.errors.slice(0, 2) as error}
						<span class="result-sub error-text">{error}</span>
					{/each}
					{#if result.errors.length > 2}
						<span class="result-sub error-text">... et {result.errors.length - 2} autre{result.errors.length - 2 > 1 ? 's' : ''}</span>
					{/if}
				</div>
			</div>
		{:else}
			<div class="drop-content">
				<div class="drop-icon" aria-hidden="true">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
						<polyline points="17 8 12 3 7 8"/>
						<line x1="12" y1="3" x2="12" y2="15"/>
					</svg>
				</div>
				<span class="drop-text">Glissez un fichier CSV ici</span>
				<span class="drop-sub">ou cliquez pour parcourir</span>
			</div>
		{/if}
	</div>
</div>

<style>
	.drop-zone {
		border: 2px dashed var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--spacing-4);
		min-height: 80px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition:
			border-color var(--transition-fast),
			background-color var(--transition-fast);
		background: var(--color-bg-subtle);
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

	.drop-status {
		display: contents;
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

	.drop-sub {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
	}

	.spinner {
		width: 24px;
		height: 24px;
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
		width: 24px;
		height: 24px;
		flex-shrink: 0;
	}

	.success-icon {
		color: var(--color-success-500);
	}

	.error-icon {
		color: var(--color-danger-500);
	}

	.result-text {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--spacing-0-5);
	}

	.result-main {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
	}

	.result-sub {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
	}

	.error-text {
		color: var(--color-danger-600);
	}

	@media (max-width: 768px) {
		.drop-zone {
			padding: var(--spacing-4);
			min-height: 88px;
		}

		.drop-content {
			flex-direction: column;
			gap: var(--spacing-2);
		}

		.drop-text {
			font-size: var(--font-size-base);
		}

		.drop-sub {
			font-size: var(--font-size-sm);
		}

		.result-text {
			align-items: center;
		}

		.result-main {
			font-size: var(--font-size-base);
		}

		.result-sub {
			font-size: var(--font-size-sm);
		}
	}

	/* Respect reduced motion preference */
	@media (prefers-reduced-motion: reduce) {
		.spinner {
			animation: none;
		}
	}
</style>
