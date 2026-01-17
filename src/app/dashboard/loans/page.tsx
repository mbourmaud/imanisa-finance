import {
	ArrowDown,
	Building2,
	Calendar,
	Car,
	CreditCard,
	Euro,
	MoreHorizontal,
	Percent,
	Plus,
	TrendingDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';

const loans = [
	{
		id: '1',
		name: 'Crédit Appartement Paris',
		type: 'immobilier',
		bank: 'Crédit Mutuel',
		initialAmount: 400000,
		remainingAmount: 320000,
		monthlyPayment: 1850,
		interestRate: 1.2,
		startDate: '2019-06-15',
		endDate: '2039-06-15',
		insurance: 45,
	},
	{
		id: '2',
		name: 'Crédit Studio Lyon',
		type: 'immobilier',
		bank: 'LCL',
		initialAmount: 160000,
		remainingAmount: 95000,
		monthlyPayment: 720,
		interestRate: 1.5,
		startDate: '2021-03-20',
		endDate: '2041-03-20',
		insurance: 25,
	},
	{
		id: '3',
		name: 'Crédit Résidence Principale',
		type: 'immobilier',
		bank: 'BNP Paribas',
		initialAmount: 350000,
		remainingAmount: 280000,
		monthlyPayment: 1520,
		interestRate: 1.35,
		startDate: '2020-09-01',
		endDate: '2045-09-01',
		insurance: 50,
	},
	{
		id: '4',
		name: 'Crédit Auto',
		type: 'auto',
		bank: 'Cetelem',
		initialAmount: 25000,
		remainingAmount: 8500,
		monthlyPayment: 450,
		interestRate: 4.5,
		startDate: '2022-01-15',
		endDate: '2027-01-15',
		insurance: 15,
	},
];

const totalRemaining = loans.reduce((s, l) => s + l.remainingAmount, 0);
const totalMonthly = loans.reduce((s, l) => s + l.monthlyPayment + l.insurance, 0);
const totalInsurance = loans.reduce((s, l) => s + l.insurance, 0);
const avgRate = loans.reduce((s, l) => s + l.interestRate * l.remainingAmount, 0) / totalRemaining;

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: 0,
	}).format(amount);
}

function getIcon(type: string) {
	switch (type) {
		case 'immobilier':
			return Building2;
		case 'auto':
			return Car;
		default:
			return CreditCard;
	}
}

function calculateRemainingMonths(endDate: string): number {
	const end = new Date(endDate);
	const now = new Date();
	const months = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth());
	return Math.max(0, months);
}

function formatRemainingTime(endDate: string): string {
	const months = calculateRemainingMonths(endDate);
	const years = Math.floor(months / 12);
	const remainingMonths = months % 12;

	if (years > 0 && remainingMonths > 0) {
		return `${years} an${years > 1 ? 's' : ''} et ${remainingMonths} mois`;
	}
	if (years > 0) {
		return `${years} an${years > 1 ? 's' : ''}`;
	}
	return `${remainingMonths} mois`;
}

export default function LoansPage() {
	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-semibold tracking-tight">Crédits</h1>
					<p className="mt-1 text-muted-foreground">Suivez vos emprunts et échéanciers</p>
				</div>
				<Button className="gap-2">
					<Plus className="h-4 w-4" />
					Ajouter un crédit
				</Button>
			</div>

			{/* Stats Overview */}
			<div className="grid gap-4 sm:gap-5 grid-cols-2 lg:grid-cols-4 stagger-children">
				<div className="stat-card">
					<div className="stat-card-content">
						<div className="stat-card-text">
							<p className="text-xs sm:text-sm font-medium text-muted-foreground">Capital restant dû</p>
							<p className="stat-card-value">{formatCurrency(totalRemaining)}</p>
							<p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">
								{loans.length} crédit{loans.length > 1 ? 's' : ''} actif{loans.length > 1 ? 's' : ''}
							</p>
						</div>
						<div className="stat-card-icon bg-[oklch(0.55_0.2_25)]/10 text-[oklch(0.55_0.2_25)]">
							<TrendingDown className="h-4 w-4 sm:h-5 sm:w-5" />
						</div>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-card-content">
						<div className="stat-card-text">
							<p className="text-xs sm:text-sm font-medium text-muted-foreground">Mensualités</p>
							<p className="stat-card-value">{formatCurrency(totalMonthly)}</p>
							<p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">
								Dont {formatCurrency(totalInsurance)} assurance
							</p>
						</div>
						<div className="stat-card-icon">
							<Euro className="h-4 w-4 sm:h-5 sm:w-5" />
						</div>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-card-content">
						<div className="stat-card-text">
							<p className="text-xs sm:text-sm font-medium text-muted-foreground">Taux moyen</p>
							<p className="stat-card-value">{avgRate.toFixed(2)}%</p>
							<p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">Sur capital restant</p>
						</div>
						<div className="stat-card-icon">
							<Percent className="h-4 w-4 sm:h-5 sm:w-5" />
						</div>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-card-content">
						<div className="stat-card-text">
							<p className="text-xs sm:text-sm font-medium text-muted-foreground">Coût annuel</p>
							<p className="stat-card-value">{formatCurrency(totalMonthly * 12)}</p>
							<p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">Remboursements/an</p>
						</div>
						<div className="stat-card-icon">
							<Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
						</div>
					</div>
				</div>
			</div>

			{/* Loans List */}
			<div className="space-y-4">
				{loans.map((loan) => {
					const Icon = getIcon(loan.type);
					const progress = ((loan.initialAmount - loan.remainingAmount) / loan.initialAmount) * 100;
					const remainingMonths = calculateRemainingMonths(loan.endDate);

					return (
						<Card key={loan.id} className="border-border/60 group">
							<CardHeader className="pb-3">
								<div className="flex items-start justify-between">
									<div className="flex items-center gap-4">
										<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
											<Icon className="h-6 w-6" />
										</div>
										<div>
											<CardTitle className="text-lg font-medium">{loan.name}</CardTitle>
											<p className="text-sm text-muted-foreground">
												{loan.bank} · {loan.interestRate}%
											</p>
										</div>
									</div>
									<div className="flex items-center gap-4">
										<div className="text-right hidden sm:block">
											<p className="text-2xl font-semibold number-display">
												{formatCurrency(loan.remainingAmount)}
											</p>
											<p className="text-xs text-muted-foreground">Capital restant</p>
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
												<DropdownMenuItem>Voir l&apos;échéancier</DropdownMenuItem>
												<DropdownMenuItem>Modifier</DropdownMenuItem>
												<DropdownMenuItem>Simuler remboursement anticipé</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem className="text-destructive">Supprimer</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								{/* Progress Bar */}
								<div>
									<div className="flex justify-between text-xs mb-2">
										<span className="text-muted-foreground">
											Remboursé: {formatCurrency(loan.initialAmount - loan.remainingAmount)}
										</span>
										<span className="font-medium">{progress.toFixed(1)}%</span>
									</div>
									<Progress value={progress} className="h-2" />
								</div>

								{/* Info Grid */}
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-border/40">
									<div className="rounded-xl bg-muted/30 p-3">
										<div className="flex items-center gap-1 text-muted-foreground mb-1">
											<Euro className="h-3.5 w-3.5" />
											<span className="text-xs">Mensualité</span>
										</div>
										<p className="font-semibold number-display">
											{formatCurrency(loan.monthlyPayment)}
										</p>
										<p className="text-xs text-muted-foreground">
											+ {formatCurrency(loan.insurance)} assurance
										</p>
									</div>
									<div className="rounded-xl bg-muted/30 p-3">
										<div className="flex items-center gap-1 text-muted-foreground mb-1">
											<Percent className="h-3.5 w-3.5" />
											<span className="text-xs">Taux</span>
										</div>
										<p className="font-semibold">{loan.interestRate}%</p>
										<p className="text-xs text-muted-foreground">Taux nominal</p>
									</div>
									<div className="rounded-xl bg-muted/30 p-3">
										<div className="flex items-center gap-1 text-muted-foreground mb-1">
											<Calendar className="h-3.5 w-3.5" />
											<span className="text-xs">Durée restante</span>
										</div>
										<p className="font-semibold">{formatRemainingTime(loan.endDate)}</p>
										<p className="text-xs text-muted-foreground">{remainingMonths} échéances</p>
									</div>
									<div className="rounded-xl bg-muted/30 p-3">
										<div className="flex items-center gap-1 text-muted-foreground mb-1">
											<ArrowDown className="h-3.5 w-3.5" />
											<span className="text-xs">Montant initial</span>
										</div>
										<p className="font-semibold number-display">
											{formatCurrency(loan.initialAmount)}
										</p>
										<p className="text-xs text-muted-foreground">Emprunté</p>
									</div>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* Summary Card */}
			<Card className="border-border/60 bg-muted/20">
				<CardContent className="pt-6">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div>
							<p className="font-medium">Prochain prélèvement</p>
							<p className="text-sm text-muted-foreground">Estimé au 5 du mois prochain</p>
						</div>
						<div className="text-right">
							<p className="text-3xl font-semibold number-display">
								{formatCurrency(totalMonthly)}
							</p>
							<p className="text-sm text-muted-foreground">
								{formatCurrency(totalMonthly - totalInsurance)} capital +{' '}
								{formatCurrency(totalInsurance)} assurance
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
