import { Card, EmptyState, FileSpreadsheet, Loader2 } from '@/components';
import type { ReactNode } from 'react';

interface ImportHistorySectionProps {
	isLoading: boolean;
	isEmpty: boolean;
	children: ReactNode;
}

/**
 * Container for import history list
 */
export function ImportHistorySection({ isLoading, isEmpty, children }: ImportHistorySectionProps) {
	return (
		<Card padding="lg">
			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-1">
					<h3 className="text-base font-semibold tracking-tight">Historique des imports</h3>
					<p className="text-sm text-muted-foreground">
						Fichiers bruts stockés et leur statut de traitement
					</p>
				</div>
				<div className="flex flex-col gap-2">
					{isLoading ? (
						<div className="flex justify-center py-8">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					) : isEmpty ? (
						<EmptyState
							icon={FileSpreadsheet}
							title="Aucun import"
							description="Uploadez votre premier fichier ci-dessus"
						/>
					) : (
						children
					)}
				</div>
			</div>
		</Card>
	);
}
