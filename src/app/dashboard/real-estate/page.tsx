import {
	Building2,
	Calendar,
	Euro,
	Home,
	Key,
	MapPin,
	MoreHorizontal,
	Percent,
	Plus,
	TrendingUp,
	Users,
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

const properties = [
	{
		id: '1',
		name: 'Appartement Paris 11e',
		type: 'Appartement',
		address: '42 Rue de la Roquette, 75011 Paris',
		purchasePrice: 450000,
		currentValue: 520000,
		monthlyRent: 1500,
		monthlyCharges: 250,
		loanRemaining: 320000,
		ownership: 100,
		tenants: 1,
		surface: 55,
		purchaseDate: '2019-06-15',
	},
	{
		id: '2',
		name: 'Studio Lyon 3e',
		type: 'Studio',
		address: '15 Rue Paul Bert, 69003 Lyon',
		purchasePrice: 180000,
		currentValue: 210000,
		monthlyRent: 650,
		monthlyCharges: 100,
		loanRemaining: 95000,
		ownership: 50,
		tenants: 1,
		surface: 25,
		purchaseDate: '2021-03-20',
	},
	{
		id: '3',
		name: 'Résidence Principale',
		type: 'Maison',
		address: '8 Allée des Tilleuls, 69006 Lyon',
		purchasePrice: 380000,
		currentValue: 420000,
		monthlyRent: 0,
		monthlyCharges: 150,
		loanRemaining: 280000,
		ownership: 100,
		tenants: 0,
		surface: 120,
		purchaseDate: '2020-09-01',
	},
];

const totalValue = properties.reduce((s, p) => s + p.currentValue * (p.ownership / 100), 0);
const totalRent = properties.reduce((s, p) => s + p.monthlyRent * (p.ownership / 100), 0);
const totalCharges = properties.reduce((s, p) => s + p.monthlyCharges * (p.ownership / 100), 0);
const totalLoan = properties.reduce((s, p) => s + p.loanRemaining * (p.ownership / 100), 0);
const netValue = totalValue - totalLoan;
const rentYield = totalValue > 0 ? (((totalRent - totalCharges) * 12) / totalValue) * 100 : 0;

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: 0,
	}).format(amount);
}

export default function RealEstatePage() {
	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-semibold tracking-tight">Immobilier</h1>
					<p className="mt-1 text-muted-foreground">Gérez votre patrimoine immobilier</p>
				</div>
				<Button className="gap-2">
					<Plus className="h-4 w-4" />
					Ajouter un bien
				</Button>
			</div>

			{/* Stats Overview */}
			<div className="grid gap-4 sm:gap-5 grid-cols-2 lg:grid-cols-4 stagger-children">
				<div className="stat-card">
					<div className="stat-card-content">
						<div className="stat-card-text">
							<p className="text-xs sm:text-sm font-medium text-muted-foreground">Valeur totale</p>
							<p className="stat-card-value">{formatCurrency(totalValue)}</p>
							<p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">
								{properties.length} bien{properties.length > 1 ? 's' : ''}
							</p>
						</div>
						<div className="stat-card-icon">
							<Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
						</div>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-card-content">
						<div className="stat-card-text">
							<p className="text-xs sm:text-sm font-medium text-muted-foreground">Valeur nette</p>
							<p className="stat-card-value value-positive">{formatCurrency(netValue)}</p>
							<p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">Après crédits</p>
						</div>
						<div className="stat-card-icon bg-[oklch(0.55_0.15_145)]/10 text-[oklch(0.55_0.15_145)]">
							<TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
						</div>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-card-content">
						<div className="stat-card-text">
							<p className="text-xs sm:text-sm font-medium text-muted-foreground">Loyers</p>
							<p className="stat-card-value">{formatCurrency(totalRent)}</p>
							<p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">
								Net: {formatCurrency(totalRent - totalCharges)}
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
							<p className="text-xs sm:text-sm font-medium text-muted-foreground">Rendement</p>
							<p className="stat-card-value">{rentYield.toFixed(2)}%</p>
							<p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">Annuel brut</p>
						</div>
						<div className="stat-card-icon">
							<Percent className="h-4 w-4 sm:h-5 sm:w-5" />
						</div>
					</div>
				</div>
			</div>

			{/* Credit Progress */}
			<Card className="border-border/60">
				<CardContent className="pt-6">
					<div className="flex items-center justify-between mb-3">
						<div>
							<p className="font-medium">Capital restant dû</p>
							<p className="text-sm text-muted-foreground">
								{formatCurrency(totalLoan)} sur {formatCurrency(totalValue)}
							</p>
						</div>
						<p className="text-lg font-semibold number-display">
							{((totalLoan / totalValue) * 100).toFixed(1)}%
						</p>
					</div>
					<Progress value={(totalLoan / totalValue) * 100} className="h-3" />
					<p className="mt-2 text-xs text-muted-foreground">
						Équité: {formatCurrency(netValue)} ({((netValue / totalValue) * 100).toFixed(1)}%)
					</p>
				</CardContent>
			</Card>

			{/* Properties Grid */}
			<div className="grid gap-6 lg:grid-cols-2">
				{properties.map((property) => {
					const appreciation =
						((property.currentValue - property.purchasePrice) / property.purchasePrice) * 100;
					const equity = property.currentValue - property.loanRemaining;
					const loanProgress = (property.loanRemaining / property.purchasePrice) * 100;
					const isRented = property.monthlyRent > 0;

					return (
						<Card key={property.id} className="border-border/60 group overflow-hidden">
							<CardHeader className="pb-3">
								<div className="flex items-start justify-between">
									<div className="flex items-center gap-3">
										<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
											{property.type === 'Maison' ? (
												<Home className="h-6 w-6" />
											) : (
												<Building2 className="h-6 w-6" />
											)}
										</div>
										<div>
											<CardTitle className="text-lg font-medium">{property.name}</CardTitle>
											<div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
												<MapPin className="h-3 w-3" />
												{property.address}
											</div>
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
											<DropdownMenuItem>Voir les détails</DropdownMenuItem>
											<DropdownMenuItem>Modifier</DropdownMenuItem>
											<DropdownMenuItem>Ajouter une charge</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem className="text-destructive">Supprimer</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								{/* Value & Appreciation */}
								<div className="grid grid-cols-2 gap-4">
									<div className="rounded-xl bg-muted/30 p-3">
										<p className="text-xs text-muted-foreground">Valeur actuelle</p>
										<p className="text-xl font-semibold number-display mt-1">
											{formatCurrency(property.currentValue)}
										</p>
										<p
											className={`text-xs font-medium mt-0.5 ${
												appreciation >= 0 ? 'value-positive' : 'value-negative'
											}`}
										>
											{appreciation >= 0 ? '+' : ''}
											{appreciation.toFixed(1)}% depuis l&apos;achat
										</p>
									</div>
									<div className="rounded-xl bg-muted/30 p-3">
										<p className="text-xs text-muted-foreground">Équité</p>
										<p className="text-xl font-semibold number-display mt-1 value-positive">
											{formatCurrency(equity)}
										</p>
										<p className="text-xs text-muted-foreground mt-0.5">
											{((equity / property.currentValue) * 100).toFixed(0)}% de la valeur
										</p>
									</div>
								</div>

								{/* Loan Progress */}
								{property.loanRemaining > 0 && (
									<div>
										<div className="flex justify-between text-xs mb-1">
											<span className="text-muted-foreground">Crédit restant</span>
											<span className="number-display">
												{formatCurrency(property.loanRemaining)}
											</span>
										</div>
										<Progress value={100 - loanProgress} className="h-2" />
									</div>
								)}

								{/* Info Grid */}
								<div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/40">
									<div className="text-center">
										<div className="flex items-center justify-center gap-1 text-muted-foreground">
											<Home className="h-3.5 w-3.5" />
											<span className="text-xs">Surface</span>
										</div>
										<p className="font-medium mt-1">{property.surface} m²</p>
									</div>
									<div className="text-center">
										<div className="flex items-center justify-center gap-1 text-muted-foreground">
											<Key className="h-3.5 w-3.5" />
											<span className="text-xs">Détention</span>
										</div>
										<p className="font-medium mt-1">{property.ownership}%</p>
									</div>
									<div className="text-center">
										<div className="flex items-center justify-center gap-1 text-muted-foreground">
											{isRented ? (
												<Users className="h-3.5 w-3.5" />
											) : (
												<Calendar className="h-3.5 w-3.5" />
											)}
											<span className="text-xs">{isRented ? 'Locataire' : 'Type'}</span>
										</div>
										<p className="font-medium mt-1">
											{isRented ? `${property.tenants} loc.` : 'RP'}
										</p>
									</div>
								</div>

								{/* Rent Info if applicable */}
								{isRented && (
									<div className="rounded-xl bg-[oklch(0.55_0.15_145)]/10 p-3">
										<div className="flex justify-between items-center">
											<div>
												<p className="text-xs text-[oklch(0.55_0.15_145)]">Loyer mensuel</p>
												<p className="text-lg font-semibold number-display text-[oklch(0.55_0.15_145)]">
													{formatCurrency(property.monthlyRent)}
												</p>
											</div>
											<div className="text-right">
												<p className="text-xs text-muted-foreground">Net de charges</p>
												<p className="font-medium number-display">
													{formatCurrency(property.monthlyRent - property.monthlyCharges)}
												</p>
											</div>
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
