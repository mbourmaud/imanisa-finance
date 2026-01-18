'use client';

import {
	BudgetCategoryCard,
	Button,
	Car,
	Coffee,
	CreditCard,
	Film,
	GlassCard,
	Grid,
	Heart,
	Heading,
	Home,
	PageHeader,
	PieChart,
	Plus,
	Progress,
	Row,
	Settings,
	ShoppingBag,
	ShoppingCart,
	Stack,
	StatCard,
	StatCardGrid,
	Text,
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
		<Stack gap="xl">
			{/* Header */}
			<PageHeader
				title="Budget"
				description="Suivez vos dépenses par catégorie"
				actions={
					<Row gap="sm">
						<Button
							variant="outline"
							iconLeft={<Settings style={{ height: '1rem', width: '1rem' }} />}
						>
							Règles
						</Button>
						<Button iconLeft={<Plus style={{ height: '1rem', width: '1rem' }} />}>
							Nouvelle catégorie
						</Button>
					</Row>
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
				<Row justify="between" align="center">
					<Text weight="medium">Progression du mois</Text>
					<Text size="sm" color="muted">
						{formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
					</Text>
				</Row>
				<Progress value={(totalSpent / totalBudget) * 100} style={{ height: '0.75rem', marginTop: '0.5rem' }} />
				<Text size="xs" color="muted" style={{ marginTop: '0.5rem' }}>
					Il vous reste {remaining > 0 ? formatCurrency(remaining) : '0 €'} à dépenser ce mois
				</Text>
			</GlassCard>

			{/* Categories Grid */}
			<Grid cols={3} gap="md">
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
			</Grid>

			{/* Chart */}
			<GlassCard padding="lg">
				<Stack gap="md">
					<Stack gap="xs">
						<Heading level={3} size="md" weight="semibold">
							Répartition des dépenses
						</Heading>
						<Text size="sm" color="muted">
							Vue graphique par catégorie
						</Text>
					</Stack>
					<Grid cols={2} gap="xl">
						<DonutChart data={chartData} height="lg" />
						<ChartLegend items={chartData} total={totalSpent} />
					</Grid>
				</Stack>
			</GlassCard>
		</Stack>
	);
}
