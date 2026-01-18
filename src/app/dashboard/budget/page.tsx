'use client';

import {
	Car,
	Coffee,
	CreditCard,
	Film,
	Heart,
	Home,
	MoreHorizontal,
	PieChart,
	Plus,
	Settings,
	ShoppingBag,
	ShoppingCart,
	Utensils,
	Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DonutChart, ChartLegend } from '@/components/charts';
import { PageHeader } from '@/components/ui/page-header';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';

const categories = [
	{
		id: '1',
		name: 'Courses',
		icon: ShoppingCart,
		color: 'oklch(0.55 0.18 270)',
		budget: 500,
		spent: 325.4,
	},
	{
		id: '2',
		name: 'Logement',
		icon: Home,
		color: 'oklch(0.65 0.15 175)',
		budget: 1200,
		spent: 1150.0,
	},
	{
		id: '3',
		name: 'Transport',
		icon: Car,
		color: 'oklch(0.7 0.12 45)',
		budget: 200,
		spent: 185.0,
	},
	{
		id: '4',
		name: 'Restaurants',
		icon: Utensils,
		color: 'oklch(0.6 0.15 320)',
		budget: 150,
		spent: 52.0,
	},
	{
		id: '5',
		name: 'Shopping',
		icon: ShoppingBag,
		color: 'oklch(0.55 0.12 145)',
		budget: 200,
		spent: 45.99,
	},
	{
		id: '6',
		name: 'Loisirs',
		icon: Film,
		color: 'oklch(0.65 0.18 280)',
		budget: 100,
		spent: 0,
	},
	{
		id: '7',
		name: 'Santé',
		icon: Heart,
		color: 'oklch(0.55 0.2 25)',
		budget: 100,
		spent: 23.5,
	},
	{
		id: '8',
		name: 'Abonnements',
		icon: Zap,
		color: 'oklch(0.7 0.15 75)',
		budget: 80,
		spent: 16.98,
	},
	{
		id: '9',
		name: 'Cafés',
		icon: Coffee,
		color: 'oklch(0.6 0.12 60)',
		budget: 50,
		spent: 0,
	},
];

const totalBudget = categories.reduce((s, c) => s + c.budget, 0);
const totalSpent = categories.reduce((s, c) => s + c.spent, 0);
const remaining = totalBudget - totalSpent;

// Chart data: only categories with spending
const chartData = categories
	.filter((c) => c.spent > 0)
	.map((c) => ({
		name: c.name,
		value: c.spent,
		color: c.color,
	}));

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'EUR',
	}).format(amount);
}

export default function BudgetPage() {
	return (
		<div className="space-y-8">
			{/* Header */}
			<PageHeader
				title="Budget"
				description="Suivez vos dépenses par catégorie"
				actions={
					<div className="flex gap-2">
						<Button variant="outline" className="gap-2">
							<Settings className="h-4 w-4" />
							Règles
						</Button>
						<Button className="gap-2">
							<Plus className="h-4 w-4" />
							Nouvelle catégorie
						</Button>
					</div>
				}
			/>

			{/* Stats Overview */}
			<div className="grid gap-4 sm:gap-5 grid-cols-2 sm:grid-cols-3 stagger-children">
				<div className="stat-card col-span-2 sm:col-span-1">
					<div className="stat-card-content">
						<div className="stat-card-text">
							<p className="text-xs sm:text-sm font-medium text-muted-foreground">Budget mensuel</p>
							<p className="stat-card-value">{formatCurrency(totalBudget)}</p>
						</div>
						<div className="stat-card-icon">
							<PieChart className="h-4 w-4 sm:h-5 sm:w-5" />
						</div>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-card-content">
						<div className="stat-card-text">
							<p className="text-xs sm:text-sm font-medium text-muted-foreground">Dépensé</p>
							<p className="stat-card-value">{formatCurrency(totalSpent)}</p>
							<p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">
								{Math.round((totalSpent / totalBudget) * 100)}% du budget
							</p>
						</div>
						<div className="stat-card-icon bg-[oklch(0.55_0.2_25)]/10 text-[oklch(0.55_0.2_25)]">
							<CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
						</div>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-card-content">
						<div className="stat-card-text">
							<p className="text-xs sm:text-sm font-medium text-muted-foreground">Restant</p>
							<p className="stat-card-value value-positive">{formatCurrency(remaining)}</p>
							<p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">
								{Math.round((remaining / totalBudget) * 100)}% disponible
							</p>
						</div>
						<div className="stat-card-icon bg-[oklch(0.55_0.15_145)]/10 text-[oklch(0.55_0.15_145)]">
							<PieChart className="h-4 w-4 sm:h-5 sm:w-5" />
						</div>
					</div>
				</div>
			</div>

			{/* Global Progress */}
			<div className="glass-card p-6">
				<div className="flex items-center justify-between mb-3">
					<p className="font-medium">Progression du mois</p>
					<p className="text-sm text-muted-foreground">
						{formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
					</p>
				</div>
				<Progress value={(totalSpent / totalBudget) * 100} className="h-3" />
				<p className="mt-2 text-xs text-muted-foreground">
					Il vous reste {remaining > 0 ? formatCurrency(remaining) : '0 €'} à dépenser ce mois
				</p>
			</div>

			{/* Categories Grid */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{categories.map((category) => {
					const percentage = (category.spent / category.budget) * 100;
					const isOverBudget = category.spent > category.budget;
					const remainingBudget = category.budget - category.spent;

					return (
						<div key={category.id} className="glass-card p-4 space-y-3 group">
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-3">
									<div
										className="flex h-10 w-10 items-center justify-center rounded-xl"
										style={{ backgroundColor: `${category.color}20`, color: category.color }}
									>
										<category.icon className="h-5 w-5" />
									</div>
									<div>
										<h4 className="text-base font-medium">{category.name}</h4>
										<p className="text-xs text-muted-foreground">
											{formatCurrency(category.spent)} / {formatCurrency(category.budget)}
										</p>
									</div>
								</div>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
										>
											<MoreHorizontal className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem>Voir les transactions</DropdownMenuItem>
										<DropdownMenuItem>Modifier le budget</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem className="text-destructive">Supprimer</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
							<div className="space-y-2">
								<Progress
									value={Math.min(percentage, 100)}
									className={`h-2 ${isOverBudget ? '[&>div]:bg-destructive' : ''}`}
								/>
								<div className="flex justify-between text-xs">
									<span
										className={
											isOverBudget ? 'value-negative font-medium' : 'text-muted-foreground'
										}
									>
										{isOverBudget
											? `Dépassé de ${formatCurrency(Math.abs(remainingBudget))}`
											: `Reste ${formatCurrency(remainingBudget)}`}
									</span>
									<span className="text-muted-foreground">{Math.round(percentage)}%</span>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Chart */}
			<div className="glass-card p-6 space-y-4">
				<div className="flex items-center justify-between pb-2">
					<div>
						<h3 className="text-lg font-medium">Répartition des dépenses</h3>
						<p className="text-sm text-muted-foreground">Vue graphique par catégorie</p>
					</div>
				</div>
				<div className="grid gap-8 md:grid-cols-2 items-center">
					<DonutChart data={chartData} className="h-72" />
					<ChartLegend items={chartData} total={totalSpent} />
				</div>
			</div>
		</div>
	);
}
