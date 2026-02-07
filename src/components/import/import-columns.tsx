'use client';

/**
 * Import Table Columns
 *
 * Column definitions for the import history data table using TanStack Table.
 */

import type { ColumnDef } from '@tanstack/react-table';
import {
	AlertCircle,
	Badge,
	Button,
	CheckCircle2,
	Clock,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	FileSpreadsheet,
	Loader2,
	MoreHorizontal,
	Popover,
	PopoverContent,
	PopoverTrigger,
	RefreshCw,
	RotateCcw,
	Trash2,
} from '@/components';
import type { ImportData } from './ImportRow';

type ImportStatus = 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';

function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
	const date = new Date(dateStr);
	return date.toLocaleDateString('fr-FR', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

function getStatusBadgeProps(status: ImportStatus): {
	variant: 'default' | 'secondary' | 'destructive' | 'outline';
	className?: string;
} {
	switch (status) {
		case 'PROCESSED':
			return { variant: 'default', className: 'bg-emerald-600 text-white' };
		case 'PROCESSING':
			return { variant: 'secondary' };
		case 'FAILED':
			return { variant: 'destructive' };
		default:
			return { variant: 'outline' };
	}
}

function getStatusIcon(status: ImportStatus) {
	switch (status) {
		case 'PROCESSED':
			return <CheckCircle2 className="h-3 w-3" />;
		case 'PROCESSING':
			return <Loader2 className="h-3 w-3 animate-spin" />;
		case 'FAILED':
			return <AlertCircle className="h-3 w-3" />;
		default:
			return <Clock className="h-3 w-3" />;
	}
}

function getStatusLabel(status: ImportStatus): string {
	switch (status) {
		case 'PROCESSED':
			return 'Traité';
		case 'PROCESSING':
			return 'En cours';
		case 'FAILED':
			return 'Erreur';
		default:
			return 'En attente';
	}
}

interface ImportColumnsOptions {
	getBankName: (bankKey: string) => string;
	onProcess: (importId: string, accountId?: string) => void;
	onReprocess: (importId: string, accountId?: string) => void;
	onDelete: (importId: string) => void;
}

/**
 * Create import table columns
 */
export function createImportColumns(options: ImportColumnsOptions): ColumnDef<ImportData>[] {
	return [
		// Filename column
		{
			accessorKey: 'filename',
			header: 'Fichier',
			cell: ({ row }) => {
				const imp = row.original;
				return (
					<div className="flex items-center gap-3">
						<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0">
							<FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
						</div>
						<div className="flex flex-col min-w-0">
							<span className="text-sm font-medium truncate">{imp.filename}</span>
							<span className="text-xs text-muted-foreground">{formatFileSize(imp.fileSize)}</span>
						</div>
					</div>
				);
			},
		},
		// Status column
		{
			accessorKey: 'status',
			header: 'Statut',
			cell: ({ row }) => {
				const status = row.original.status as ImportStatus;
				const errorMessage = row.original.errorMessage;
				const badgeProps = getStatusBadgeProps(status);

				if (status === 'FAILED' && errorMessage) {
					return (
						<Popover>
							<PopoverTrigger asChild>
								<button type="button" className="cursor-pointer">
									<Badge variant={badgeProps.variant} className={badgeProps.className}>
										{getStatusIcon(status)}
										{getStatusLabel(status)}
									</Badge>
								</button>
							</PopoverTrigger>
							<PopoverContent className="w-80" side="bottom" align="start">
								<div className="flex flex-col gap-2">
									<div className="flex items-center gap-2">
										<AlertCircle className="h-4 w-4 text-destructive shrink-0" />
										<span className="text-sm font-medium">Détail de l&apos;erreur</span>
									</div>
									<p className="text-sm text-muted-foreground break-words">
										{errorMessage}
									</p>
								</div>
							</PopoverContent>
						</Popover>
					);
				}

				return (
					<Badge variant={badgeProps.variant} className={badgeProps.className}>
						{getStatusIcon(status)}
						{getStatusLabel(status)}
					</Badge>
				);
			},
		},
		// Bank column
		{
			id: 'bank',
			header: 'Banque',
			cell: ({ row }) => (
				<span className="text-sm">{options.getBankName(row.original.bankKey)}</span>
			),
		},
		// Account column
		{
			id: 'account',
			header: 'Compte',
			cell: ({ row }) => {
				const account = row.original.account;
				if (!account) {
					return <span className="text-sm text-muted-foreground">—</span>;
				}
				return <span className="text-sm">{account.name}</span>;
			},
		},
		// Records count column
		{
			accessorKey: 'recordsCount',
			header: () => <div className="text-right">Transactions</div>,
			cell: ({ row }) => {
				const count = row.original.recordsCount;
				if (count === null || count === undefined) {
					return <div className="text-right text-sm text-muted-foreground">—</div>;
				}
				return (
					<div className="text-right text-sm tabular-nums">
						{count}
					</div>
				);
			},
		},
		// Date column
		{
			accessorKey: 'createdAt',
			header: 'Date',
			cell: ({ row }) => (
				<span className="text-sm text-muted-foreground">
					{formatDate(row.original.createdAt)}
				</span>
			),
		},
		// Actions column
		{
			id: 'actions',
			enableSorting: false,
			enableHiding: false,
			cell: ({ row }) => {
				const imp = row.original;
				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={(e) => e.stopPropagation()}
							>
								<span className="sr-only">Ouvrir le menu</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{imp.status === 'PENDING' && (
								<DropdownMenuItem onClick={() => options.onProcess(imp.id, imp.account?.id)}>
									<RefreshCw className="mr-2 h-4 w-4" />
									Traiter
								</DropdownMenuItem>
							)}
							{imp.status === 'PROCESSED' && (
								<DropdownMenuItem onClick={() => options.onReprocess(imp.id, imp.account?.id)}>
									<RotateCcw className="mr-2 h-4 w-4" />
									Retraiter
								</DropdownMenuItem>
							)}
							{imp.status === 'FAILED' && (
								<DropdownMenuItem onClick={() => options.onProcess(imp.id, imp.account?.id)}>
									<RefreshCw className="mr-2 h-4 w-4" />
									Réessayer
								</DropdownMenuItem>
							)}
							<DropdownMenuItem
								onClick={() => options.onDelete(imp.id)}
								className="text-destructive"
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Supprimer
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];
}
