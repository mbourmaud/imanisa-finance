'use client';

import type { RefObject } from 'react';
import {
	Button,
	Card,
	CheckCircle2,
	EmptyState,
	FileSpreadsheet,
	Input,
	Loader2,
	Search,
	Upload,
} from '@/components';
import { TransactionRow } from './TransactionRow';

interface TransactionCategory {
	categoryId: string;
	category: {
		id: string;
		name: string;
		icon: string;
		color: string;
	};
}

interface Transaction {
	id: string;
	date: string;
	description: string;
	amount: number;
	type: string;
	transactionCategory?: TransactionCategory | null;
}

interface TransactionsSectionProps {
	transactions: Transaction[];
	totalTransactions: number;
	searchQuery: string;
	onSearchChange: (value: string) => void;
	isUploading: boolean;
	isLoadingMore: boolean;
	hasMore: boolean;
	dragActive: boolean;
	onDragEnter: (e: React.DragEvent) => void;
	onDragLeave: (e: React.DragEvent) => void;
	onDragOver: (e: React.DragEvent) => void;
	onDrop: (e: React.DragEvent) => void;
	onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onLoadMore: () => void;
	loadMoreRef: RefObject<HTMLDivElement | null>;
}

/**
 * Section displaying transactions list with search, drag-drop upload, and infinite scroll
 */
export function TransactionsSection({
	transactions,
	totalTransactions,
	searchQuery,
	onSearchChange,
	isUploading,
	isLoadingMore,
	hasMore,
	dragActive,
	onDragEnter,
	onDragLeave,
	onDragOver,
	onDrop,
	onFileSelect,
	onLoadMore,
	loadMoreRef,
}: TransactionsSectionProps) {
	return (
		<Card className="p-0">
			{/* Header */}
			<div className="p-6 pb-4">
				<div className="flex flex-col gap-4">
					{/* Title row */}
					<div className="flex flex-row justify-between items-center">
						<div className="flex flex-row gap-2 items-center">
							<h2 className="text-xl font-bold tracking-tight">Transactions</h2>
							{totalTransactions > 0 && (
								<span className="inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary">
									{totalTransactions}
								</span>
							)}
						</div>
						<label htmlFor="transaction-import-file" className="cursor-pointer">
							<input
								id="transaction-import-file"
								type="file"
								accept=".csv,.xlsx,.xls"
								onChange={onFileSelect}
								className="hidden"
								disabled={isUploading}
							/>
							<Button
								disabled={isUploading}
								asChild
								className="gap-2 rounded-xl transition-all"
							>
								<span>
									{isUploading ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Upload className="h-4 w-4" />
									)}
									Importer
								</span>
							</Button>
						</label>
					</div>
					{/* Search row */}
					<div className="relative">
						<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors" />
						<Input
							placeholder="Rechercher une transaction..."
							value={searchQuery}
							onChange={(e) => onSearchChange(e.target.value)}
							className="pl-12 h-12 text-base rounded-xl bg-background/60 border-border/30 transition-all"
						/>
					</div>
				</div>
			</div>

			{/* Content */}
			<div
				role="presentation"
				onDragEnter={onDragEnter}
				onDragLeave={onDragLeave}
				onDragOver={onDragOver}
				onDrop={onDrop}
				className={`relative px-6 pb-6 ${dragActive ? 'bg-primary/5' : ''}`}
			>
				{/* Drag overlay */}
				{dragActive && (
					<div className="flex flex-col gap-2 items-center justify-center absolute inset-2 rounded-2xl z-10 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-dashed border-primary/50">
						<div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10">
							<Upload className="h-8 w-8 text-primary" />
						</div>
						<span className="text-sm font-semibold text-primary">Déposez votre fichier ici</span>
						<span className="text-xs text-primary/70">CSV, XLSX ou XLS</span>
					</div>
				)}

				{transactions.length === 0 ? (
					<EmptyState
						icon={FileSpreadsheet}
						title="Aucune transaction"
						description="Glissez un fichier CSV ou cliquez sur Importer pour ajouter vos transactions"
					/>
				) : (
					<div className="flex flex-col gap-2">
						{transactions.map((tx, index) => (
							<TransactionRow key={tx.id} {...tx} animationDelay={Math.min(index, 10) * 20} />
						))}

						{/* Infinite scroll trigger & loading indicator */}
						<div ref={loadMoreRef} className="py-8">
							{isLoadingMore ? (
								<div className="flex flex-row gap-2 justify-center items-center">
									<div className="relative">
										<div className="h-8 w-8 rounded-full bg-primary/10 animate-pulse" />
										<Loader2 className="h-5 w-5 animate-spin text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
									</div>
									<span className="text-sm text-muted-foreground font-medium">Chargement...</span>
								</div>
							) : hasMore ? (
								<div className="flex flex-col gap-2 items-center">
									<Button
										variant="ghost"
										size="sm"
										onClick={onLoadMore}
										className="text-muted-foreground rounded-xl transition-all"
									>
										Charger plus de transactions
									</Button>
								</div>
							) : transactions.length > 0 ? (
								<div className="flex flex-row gap-2 justify-center items-center pt-4 border-t border-border/30">
									<CheckCircle2 className="h-4 w-4 text-muted-foreground/50" />
									<span className="text-sm text-muted-foreground">
										{transactions.length} transactions affichées
									</span>
								</div>
							) : null}
						</div>
					</div>
				)}
			</div>
		</Card>
	);
}
