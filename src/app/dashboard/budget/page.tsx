'use client';

import {
	Button,
	Car,
	Coffee,
	CreditCard,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	Film,
	GlassCard,
	Heart,
	Home,
	MoreHorizontal,
	PageHeader,
	PieChart,
	Plus,
	Progress,
	Settings,
	ShoppingBag,
	ShoppingCart,
	StatCard,
	StatCardGrid,
	Utensils,
	Zap,
} from '@/components';
import { ChartLegend, DonutChart } from '@/components/charts';

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
		<div className="flex flex-col gap-8">
			{/* Header */}
			<PageHeader
				title="Budget"
				description="Suivez vos dépenses par catégorie"
				actions={
					<div className="flex gap-3">
						<Button
							variant="outline"
							iconLeft={<Settings style={{ height: '1rem', width: '1rem' }} />}
						>
							Règles
						</Button>
						<Button iconLeft={<Plus style={{ height: '1rem', width: '1rem' }} />}>
							Nouvelle catégorie
						</Button>
					</div>
				}
			/>

			{/* Stats Overview */}
			<StatCardGrid columns={3}>
				<StatCard label="Budget mensuel" value={formatCurrency(totalBudget)} icon={PieChart} />
				<StatCard
					label="Dépensé"
					value={formatCurrency(totalSpent)}
					description={`${Math.round((totalSpent / totalBudget) * 100)}% du budget`}
					icon={CreditCard}
					variant="coral"
				/>
				<StatCard
					label="Restant"
					value={formatCurrency(remaining)}
					description={`${Math.round((remaining / totalBudget) * 100)}% disponible`}
					icon={PieChart}
					variant="teal"
				/>
			</StatCardGrid>

			{/* Global Progress */}
			<GlassCard padding="lg">
				<div className="flex justify-between items-center mb-2">
					<p className="font-medium">Progression du mois</p>
					<p className="text-sm text-muted-foreground">
						{formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
					</p>
				</div>
				<Progress value={(totalSpent / totalBudget) * 100} style={{ height: '0.75rem' }} />
				<p className="text-xs text-muted-foreground" style={{ marginTop: '0.5rem' }}>
					Il vous reste {remaining > 0 ? formatCurrency(remaining) : '0 €'} à dépenser ce mois
				</p>
			</GlassCard>

			{/* Categories Grid */}
			<div className="grid grid-cols-3 gap-4">
				{categories.map((category) => {
					const percentage = (category.spent / category.budget) * 100;
					const isOverBudget = category.spent > category.budget;
					const remainingBudget = category.budget - category.spent;

					return (
						<GlassCard key={category.id} padding="md">
							<div className="flex flex-col gap-3">
								<div className="flex justify-between items-start">
									<div className="flex items-center gap-3">
										<div
											className="flex h-10 w-10 items-center justify-center rounded-xl"
											style={{
												backgroundColor: `${category.color}20`,
												color: category.color,
											}}
										>
											<category.icon style={{ height: '1.25rem', width: '1.25rem' }} />
										</div>
										<div className="flex flex-col">
											<p className="text-base font-medium">
												{category.name}
											</p>
											<p className="text-xs text-muted-foreground">
												{formatCurrency(category.spent)} / {formatCurrency(category.budget)}
											</p>
										</div>
									</div>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon" style={{ height: '2rem', width: '2rem' }}>
												<MoreHorizontal style={{ height: '1rem', width: '1rem' }} />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem>Voir les transactions</DropdownMenuItem>
											<DropdownMenuItem>Modifier le budget</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem style={{ color: 'hsl(var(--destructive))' }}>
												Supprimer
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
								<div className="flex flex-col gap-2">
									<Progress
										value={Math.min(percentage, 100)}
										style={{
											height: '0.5rem',
											...(isOverBudget &&
												({
													'--progress-foreground': 'hsl(var(--destructive))',
												} as React.CSSProperties)),
										}}
									/>
									<div className="flex justify-between">
										<p
											className={`text-xs ${isOverBudget ? 'font-medium' : 'text-muted-foreground'}`}
											style={{ color: isOverBudget ? 'oklch(0.55 0.2 25)' : undefined }}
										>
											{isOverBudget
												? `Dépassé de ${formatCurrency(Math.abs(remainingBudget))}`
												: `Reste ${formatCurrency(remainingBudget)}`}
										</p>
										<p className="text-xs text-muted-foreground">
											{Math.round(percentage)}%
										</p>
									</div>
								</div>
							</div>
						</GlassCard>
					);
				})}
			</div>

			{/* Chart */}
			<GlassCard padding="lg">
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<Heading level={3} size="md">
							Répartition des dépenses
						</Heading>
						<Text size="sm" color="muted">
							Vue graphique par catégorie
						</Text>
					</div>
					<div className="grid grid-cols-2 gap-8 items-center">
						<DonutChart data={chartData} height="lg" />
						<ChartLegend items={chartData} total={totalSpent} />
					</div>
				</div>
			</GlassCard>
		</div>
	);
}
