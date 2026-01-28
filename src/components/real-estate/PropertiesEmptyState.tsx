import { Building2, Button, EmptyState, Plus } from '@/components';

interface PropertiesEmptyStateProps {
	onAddClick: () => void;
}

/**
 * Empty state when no properties exist
 */
export function PropertiesEmptyState({ onAddClick }: PropertiesEmptyStateProps) {
	return (
		<EmptyState
			icon={Building2}
			title="Aucun bien immobilier"
			description="Ajoutez votre premier bien pour commencer à suivre votre patrimoine immobilier."
			action={
				<Button onClick={onAddClick} iconLeft={<Plus className="h-4 w-4" />}>
					Ajouter un bien
				</Button>
			}
		/>
	);
}
