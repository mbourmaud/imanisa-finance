<script lang="ts">
	import type { AmortizationEntry } from '@lib/utils/loan-calculator';

	interface Props {
		schedule: AmortizationEntry[];
		currentMonthIndex: number;
	}

	let { schedule, currentMonthIndex }: Props = $props();

	// Pagination state
	let currentPage = $state(1);
	const rowsPerPage = 12;

	const totalPages = $derived(Math.ceil(schedule.length / rowsPerPage));

	// Calculate which page contains the current month
	const pageWithCurrentMonth = $derived(
		currentMonthIndex >= 0 ? Math.ceil((currentMonthIndex + 1) / rowsPerPage) : 1
	);

	// Initialize to the page with current month
	$effect(() => {
		if (pageWithCurrentMonth > 0 && pageWithCurrentMonth <= totalPages) {
			currentPage = pageWithCurrentMonth;
		}
	});

	const paginatedSchedule = $derived(
		schedule.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
	);

	function formatCurrency(value: number): string {
		return value.toLocaleString('fr-FR', {
			style: 'currency',
			currency: 'EUR',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('fr-FR', {
			month: 'short',
			year: 'numeric'
		});
	}

	function goToPage(page: number) {
		if (page >= 1 && page <= totalPages) {
			currentPage = page;
		}
	}

	function goToCurrentMonth() {
		currentPage = pageWithCurrentMonth;
	}

	// Generate page numbers to display
	const visiblePages = $derived(() => {
		const pages: (number | 'ellipsis')[] = [];
		const maxVisible = 5;

		if (totalPages <= maxVisible + 2) {
			// Show all pages
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Always show first page
			pages.push(1);

			if (currentPage > 3) {
				pages.push('ellipsis');
			}

			// Show pages around current page
			const start = Math.max(2, currentPage - 1);
			const end = Math.min(totalPages - 1, currentPage + 1);

			for (let i = start; i <= end; i++) {
				pages.push(i);
			}

			if (currentPage < totalPages - 2) {
				pages.push('ellipsis');
			}

			// Always show last page
			pages.push(totalPages);
		}

		return pages;
	});
</script>

<div class="amortization-table-container">
	<div class="table-header">
		<h3 class="table-title">
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
				<line x1="16" y1="2" x2="16" y2="6"/>
				<line x1="8" y1="2" x2="8" y2="6"/>
				<line x1="3" y1="10" x2="21" y2="10"/>
			</svg>
			Tableau d'amortissement
		</h3>
		{#if currentMonthIndex >= 0 && currentPage !== pageWithCurrentMonth}
			<button class="go-to-current" onclick={goToCurrentMonth}>
				Aller au mois actuel
			</button>
		{/if}
	</div>

	<div class="table-wrapper">
		<table class="amortization-table">
			<thead>
				<tr>
					<th class="col-date">Date</th>
					<th class="col-payment">Mensualité</th>
					<th class="col-principal">Capital</th>
					<th class="col-interest">Intérêts</th>
					<th class="col-balance">Restant</th>
				</tr>
			</thead>
			<tbody>
				{#each paginatedSchedule as entry}
					{@const isCurrentMonth = schedule.indexOf(entry) === currentMonthIndex}
					<tr class:current-month={isCurrentMonth}>
						<td class="col-date">
							{formatDate(entry.date)}
							{#if isCurrentMonth}
								<span class="current-badge">Actuel</span>
							{/if}
						</td>
						<td class="col-payment">{formatCurrency(entry.payment)}</td>
						<td class="col-principal">{formatCurrency(entry.principal)}</td>
						<td class="col-interest">{formatCurrency(entry.interest)}</td>
						<td class="col-balance">{formatCurrency(entry.balance)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if totalPages > 1}
		<div class="pagination">
			<button
				class="pagination-btn"
				disabled={currentPage === 1}
				onclick={() => goToPage(currentPage - 1)}
				aria-label="Page précédente"
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="m15 18-6-6 6-6"/>
				</svg>
			</button>

			{#each visiblePages() as page}
				{#if page === 'ellipsis'}
					<span class="pagination-ellipsis">...</span>
				{:else}
					<button
						class="pagination-btn page-number"
						class:active={currentPage === page}
						onclick={() => goToPage(page)}
					>
						{page}
					</button>
				{/if}
			{/each}

			<button
				class="pagination-btn"
				disabled={currentPage === totalPages}
				onclick={() => goToPage(currentPage + 1)}
				aria-label="Page suivante"
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="m9 18 6-6-6-6"/>
				</svg>
			</button>
		</div>
	{/if}

	<div class="table-footer">
		<span class="page-info">
			Page {currentPage} sur {totalPages} ({schedule.length} échéances)
		</span>
	</div>
</div>

<style>
	.amortization-table-container {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-4);
	}

	.table-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--spacing-3);
	}

	.table-title {
		display: flex;
		align-items: center;
		gap: var(--spacing-2);
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		margin: 0;
	}

	.table-title svg {
		color: var(--color-gold-500);
	}

	.go-to-current {
		background: var(--color-primary-500);
		color: white;
		border: none;
		border-radius: var(--radius-md);
		padding: var(--spacing-2) var(--spacing-3);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		transition: background var(--transition-fast);
	}

	.go-to-current:hover {
		background: var(--color-primary-600);
	}

	.table-wrapper {
		overflow-x: auto;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
	}

	.amortization-table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--font-size-sm);
	}

	.amortization-table th,
	.amortization-table td {
		padding: var(--spacing-3) var(--spacing-4);
		text-align: right;
		border-bottom: 1px solid var(--color-border);
	}

	.amortization-table th {
		background: var(--color-bg-subtle);
		color: var(--color-text-secondary);
		font-weight: var(--font-weight-semibold);
		font-size: var(--font-size-xs);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-caps);
		position: sticky;
		top: 0;
	}

	.amortization-table tbody tr {
		transition: background var(--transition-fast);
	}

	.amortization-table tbody tr:hover {
		background: var(--color-bg-subtle);
	}

	.amortization-table tbody tr:last-child td {
		border-bottom: none;
	}

	.amortization-table td {
		color: var(--color-text-primary);
	}

	.col-date {
		text-align: left !important;
		white-space: nowrap;
	}

	.col-payment {
		font-weight: var(--font-weight-medium);
	}

	.col-principal {
		color: var(--color-success-500) !important;
	}

	.col-interest {
		color: var(--color-text-muted) !important;
	}

	.col-balance {
		font-weight: var(--font-weight-medium);
	}

	/* Current month highlight */
	.current-month {
		background: rgba(212, 168, 83, 0.15) !important;
	}

	.current-month td {
		font-weight: var(--font-weight-semibold);
	}

	.current-badge {
		display: inline-block;
		background: var(--color-gold-500);
		color: #000;
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-bold);
		padding: 2px 6px;
		border-radius: var(--radius-sm);
		margin-left: var(--spacing-2);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-caps);
	}

	/* Pagination */
	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: var(--spacing-1);
	}

	.pagination-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 32px;
		height: 32px;
		padding: 0 var(--spacing-2);
		background: var(--color-bg-subtle);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.pagination-btn:hover:not(:disabled) {
		background: var(--color-bg-muted);
		color: var(--color-text-primary);
	}

	.pagination-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.pagination-btn.active {
		background: var(--color-primary-500);
		border-color: var(--color-primary-500);
		color: white;
	}

	.pagination-ellipsis {
		color: var(--color-text-muted);
		padding: 0 var(--spacing-2);
	}

	.table-footer {
		display: flex;
		justify-content: center;
	}

	.page-info {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	/* Mobile responsiveness */
	@media (max-width: 640px) {
		.amortization-table th,
		.amortization-table td {
			padding: var(--spacing-2) var(--spacing-3);
		}

		.amortization-table {
			font-size: var(--font-size-xs);
		}

		.current-badge {
			display: none;
		}

		.pagination-btn.page-number {
			display: none;
		}

		.pagination-btn.page-number.active,
		.pagination-btn:not(.page-number) {
			display: inline-flex;
		}
	}
</style>
