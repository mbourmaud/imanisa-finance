import { EmptyState, FileSpreadsheet, Flex, GlassCard, Loader2 } from '@/components'
import type { ReactNode } from 'react'

interface ImportHistorySectionProps {
	isLoading: boolean
	isEmpty: boolean
	children: ReactNode
}

/**
 * Container for import history list
 */
export function ImportHistorySection({
	isLoading,
	isEmpty,
	children,
}: ImportHistorySectionProps) {
	return (
		<GlassCard padding="lg">
			<Flex direction="col" gap="md">
				<Flex direction="col" gap="xs">
					<h3 className="text-base font-semibold tracking-tight">
						Historique des imports
					</h3>
					<p className="text-sm text-muted-foreground">
						Fichiers bruts stockés et leur statut de traitement
					</p>
				</Flex>
				<Flex direction="col" gap="sm">
					{isLoading ? (
						<Flex direction="row" justify="center" className="py-8">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</Flex>
					) : isEmpty ? (
						<EmptyState
							icon={FileSpreadsheet}
							title="Aucun import"
							description="Uploadez votre premier fichier ci-dessus"
						/>
					) : (
						children
					)}
				</Flex>
			</Flex>
		</GlassCard>
	)
}
