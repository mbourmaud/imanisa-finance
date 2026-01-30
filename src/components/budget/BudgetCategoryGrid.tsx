import type { LucideIcon } from 'lucide-react';
import { BudgetCategoryCard } from './BudgetCategoryCard';

interface Category {
	id: string;
	name: string;
	icon: LucideIcon;
	color: string;
	budget: number;
	spent: number;
}

interface BudgetCategoryGridProps {
	categories: Category[];
	formatCurrency: (amount: number) => string;
}

/**
 * Grid of budget category cards
 */
export function BudgetCategoryGrid({ categories, formatCurrency }: BudgetCategoryGridProps) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{categories.map((category) => (
				<BudgetCategoryCard
					key={category.id}
					name={category.name}
					icon={category.icon}
					color={category.color}
					budget={category.budget}
					spent={category.spent}
					formatCurrency={formatCurrency}
				/>
			))}
		</div>
	);
}
