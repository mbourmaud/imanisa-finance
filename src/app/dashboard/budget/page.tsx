'use client';

import {
	Box,
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
	Grid,
	Heading,
	Heart,
	Home,
	HStack,
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
	Text,
	Utensils,
	VStack,
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
		<VStack gap="xl">
			{/* Header */}
			<PageHeader
				title="Budget"
				description="Suivez vos dépenses par catégorie"
				actions={
					<HStack gap="sm">
						<Button
							variant="outline"
							iconLeft={<Settings style={{ height: '1rem', width: '1rem' }} />}
						>
							Règles
						</Button>
						<Button iconLeft={<Plus style={{ height: '1rem', width: '1rem' }} />}>
							Nouvelle catégorie
						</Button>
					</HStack>
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
				<HStack justify="between" align="center" style={{ marginBottom: '0.5rem' }}>
					<Text weight="medium">Progression du mois</Text>
					<Text size="sm" color="muted">
						{formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
					</Text>
				</HStack>
				<Progress value={(totalSpent / totalBudget) * 100} style={{ height: '0.75rem' }} />
				<Text size="xs" color="muted" style={{ marginTop: '0.5rem' }}>
					Il vous reste {remaining > 0 ? formatCurrency(remaining) : '0 €'} à dépenser ce mois
				</Text>
			</GlassCard>

			{/* Categories Grid */}
			<Grid cols={3} gap="md">
				{categories.map((category) => {
					const percentage = (category.spent / category.budget) * 100;
					const isOverBudget = category.spent > category.budget;
					const remainingBudget = category.budget - category.spent;

					return (
						<GlassCard key={category.id} padding="md">
							<VStack gap="sm">
								<HStack justify="between" align="start">
									<HStack gap="sm" align="center">
										<Box
											display="flex"
											rounded="xl"
											style={{
												height: '2.5rem',
												width: '2.5rem',
												alignItems: 'center',
												justifyContent: 'center',
												backgroundColor: `${category.color}20`,
												color: category.color,
											}}
										>
											<category.icon style={{ height: '1.25rem', width: '1.25rem' }} />
										</Box>
										<VStack gap="none">
											<Text size="md" weight="medium">
												{category.name}
											</Text>
											<Text size="xs" color="muted">
												{formatCurrency(category.spent)} / {formatCurrency(category.budget)}
											</Text>
										</VStack>
									</HStack>
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
								</HStack>
								<VStack gap="xs">
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
									<HStack justify="between">
										<Text
											size="xs"
											weight={isOverBudget ? 'medium' : 'normal'}
											style={{ color: isOverBudget ? 'oklch(0.55 0.2 25)' : undefined }}
											color={isOverBudget ? undefined : 'muted'}
										>
											{isOverBudget
												? `Dépassé de ${formatCurrency(Math.abs(remainingBudget))}`
												: `Reste ${formatCurrency(remainingBudget)}`}
										</Text>
										<Text size="xs" color="muted">
											{Math.round(percentage)}%
										</Text>
									</HStack>
								</VStack>
							</VStack>
						</GlassCard>
					);
				})}
			</Grid>

			{/* Chart */}
			<GlassCard padding="lg">
				<VStack gap="md">
					<VStack gap="xs">
						<Heading level={3} size="md">
							Répartition des dépenses
						</Heading>
						<Text size="sm" color="muted">
							Vue graphique par catégorie
						</Text>
					</VStack>
					<Grid cols={2} gap="xl" style={{ alignItems: 'center' }}>
						<DonutChart data={chartData} height="lg" />
						<ChartLegend items={chartData} total={totalSpent} />
					</Grid>
				</VStack>
			</GlassCard>
		</VStack>
	);
}
