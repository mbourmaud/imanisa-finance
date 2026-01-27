import { Button, PageHeader, Plus, Settings } from '@/components';

interface BudgetHeaderProps {
	onSettingsClick?: () => void;
	onAddCategoryClick?: () => void;
}

/**
 * Budget page header with action buttons
 */
export function BudgetHeader({ onSettingsClick, onAddCategoryClick }: BudgetHeaderProps) {
	return (
		<PageHeader
			title="Budget"
			description="Suivez vos dépenses par catégorie"
			actions={
				<div className="flex gap-2">
					<Button
						variant="outline"
						iconLeft={<Settings className="h-4 w-4" />}
						onClick={onSettingsClick}
					>
						Règles
					</Button>
					<Button iconLeft={<Plus className="h-4 w-4" />} onClick={onAddCategoryClick}>
						Nouvelle catégorie
					</Button>
				</div>
			}
		/>
	);
}
