import {
	Card,
	CheckCircle2,
	Clock,
	FileSpreadsheet,
	RefreshCw,
	StatCard,
	StatCardGrid,
} from '@/components';

interface ImportStatsCardProps {
	totalFiles: number;
	processedCount: number;
	totalRecords: number;
	pendingCount: number;
}

/**
 * Stats card showing import statistics
 */
export function ImportStatsCard({
	totalFiles,
	processedCount,
	totalRecords,
	pendingCount,
}: ImportStatsCardProps) {
	return (
		<Card padding="lg">
			<div className="flex flex-col gap-4">
				<h3 className="text-base font-semibold tracking-tight">Statistiques d&apos;import</h3>
				<StatCardGrid columns={3}>
					<StatCard label="Fichiers" value={String(totalFiles)} icon={FileSpreadsheet} />
					<StatCard label="Traités" value={String(processedCount)} icon={CheckCircle2} />
					<StatCard label="Transactions" value={String(totalRecords)} icon={RefreshCw} />
				</StatCardGrid>

				{pendingCount > 0 && (
					<div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
						<div className="flex flex-row items-center gap-4">
							<Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
							<span className="text-sm font-medium text-amber-600 dark:text-amber-400">
								{pendingCount} fichier{pendingCount > 1 ? 's' : ''} en attente de traitement
							</span>
						</div>
					</div>
				)}

				<div className="rounded-lg bg-white/50 p-4">
					<p className="mb-2 font-medium">Comment ça marche ?</p>
					<ol className="flex list-decimal flex-col gap-1 pl-5 text-sm text-muted-foreground">
						<li>Sélectionnez la banque source</li>
						<li>Choisissez le compte cible</li>
						<li>Uploadez votre fichier CSV/Excel</li>
						<li>Le fichier brut est stocké dans le cloud</li>
						<li>Les transactions sont importées automatiquement</li>
					</ol>
				</div>
			</div>
		</Card>
	);
}
