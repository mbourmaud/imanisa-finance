'use client';

/**
 * Import Table Component
 *
 * Displays import history in a DataTable with status badges and action menus.
 */

import { useMemo } from 'react';
import { DataTable, EmptyState, FileSpreadsheet } from '@/components';
import type { ImportData } from './ImportRow';
import { createImportColumns } from './import-columns';

interface ImportTableProps {
	imports: ImportData[];
	isLoading: boolean;
	getBankName: (bankKey: string) => string;
	onProcess: (importId: string, accountId?: string) => void;
	onReprocess: (importId: string, accountId?: string) => void;
	onDelete: (importId: string) => void;
}

export function ImportTable({
	imports,
	isLoading,
	getBankName,
	onProcess,
	onReprocess,
	onDelete,
}: ImportTableProps) {
	const columns = useMemo(
		() =>
			createImportColumns({
				getBankName,
				onProcess,
				onReprocess,
				onDelete,
			}),
		[getBankName, onProcess, onReprocess, onDelete],
	);

	return (
		<DataTable
			columns={columns}
			data={imports}
			isLoading={isLoading}
			emptyMessage="Aucun import"
		/>
	);
}
