import Link from 'next/link';
import { Building2, Button, CreditCard, EmptyState } from '@/components';

/**
 * Empty state when no loans are available
 */
export function LoanEmptyState() {
	return (
		<EmptyState
			icon={CreditCard}
			title="Aucun crédit"
			description="Vos crédits apparaîtront ici. Commencez par ajouter un bien immobilier avec son crédit associé."
			action={
				<Button asChild variant="outline" size="sm">
					<Link href="/dashboard/real-estate">
						<Building2 className="h-4 w-4 mr-2" />
						Voir les biens
					</Link>
				</Button>
			}
		/>
	);
}
