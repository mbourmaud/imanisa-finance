'use client'

import Link from 'next/link'
import {
	ArrowDown,
	Building2,
	Calendar,
	CreditCard,
	Euro,
	ExternalLink,
	Loader2,
	MoreHorizontal,
	Percent,
	TrendingDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState as EmptyStateComponent } from '@/components/ui/empty-state'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useLoansQuery } from '@/features/loans'
import type { PropertyType } from '@/lib/prisma'

// Helper functions
function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: 0,
	}).format(amount)
}

function getPropertyIcon(type: PropertyType) {
	switch (type) {
		case 'HOUSE':
		case 'APARTMENT':
			return Building2
		default:
			return CreditCard
	}
}

function calculateRemainingMonths(endDate: string | null): number {
	if (!endDate) return 0
	const end = new Date(endDate)
	const now = new Date()
	const months = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth())
	return Math.max(0, months)
}

function formatRemainingTime(endDate: string | null): string {
	if (!endDate) return 'Non définie'
	const months = calculateRemainingMonths(endDate)
	const years = Math.floor(months / 12)
	const remainingMonths = months % 12

	if (years > 0 && remainingMonths > 0) {
		return `${years} an${years > 1 ? 's' : ''} et ${remainingMonths} mois`
	}
	if (years > 0) {
		return `${years} an${years > 1 ? 's' : ''}`
	}
	return `${remainingMonths} mois`
}

// Loading skeleton components
function StatsCardSkeleton() {
	return (
		<div className="stat-card">
			<div className="stat-card-content">
				<div className="stat-card-text">
					<Skeleton className="h-4 w-24 mb-2" />
					<Skeleton className="h-8 w-32" />
					<Skeleton className="h-3 w-20 mt-2" />
				</div>
				<Skeleton className="h-10 w-10 rounded-xl" />
			</div>
		</div>
	)
}

function LoanCardSkeleton() {
	return (
		<Card className="border-border/60">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-4">
						<Skeleton className="h-12 w-12 rounded-xl" />
						<div>
							<Skeleton className="h-5 w-40 mb-2" />
							<Skeleton className="h-4 w-32" />
						</div>
					</div>
					<div className="text-right hidden sm:block">
						<Skeleton className="h-8 w-28 mb-1" />
						<Skeleton className="h-3 w-20" />
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div>
					<Skeleton className="h-3 w-full mb-2" />
					<Skeleton className="h-2 w-full" />
				</div>
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-border/40">
					<div className="rounded-xl bg-muted/30 p-3">
						<Skeleton className="h-3 w-16 mb-2" />
						<Skeleton className="h-5 w-20" />
						<Skeleton className="h-3 w-14 mt-1" />
					</div>
					<div className="rounded-xl bg-muted/30 p-3">
						<Skeleton className="h-3 w-16 mb-2" />
						<Skeleton className="h-5 w-20" />
						<Skeleton className="h-3 w-14 mt-1" />
					</div>
					<div className="rounded-xl bg-muted/30 p-3">
						<Skeleton className="h-3 w-16 mb-2" />
						<Skeleton className="h-5 w-20" />
						<Skeleton className="h-3 w-14 mt-1" />
					</div>
					<div className="rounded-xl bg-muted/30 p-3">
						<Skeleton className="h-3 w-16 mb-2" />
						<Skeleton className="h-5 w-20" />
						<Skeleton className="h-3 w-14 mt-1" />
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

// Empty state component
function EmptyState() {
	return (
		<EmptyStateComponent
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
	)
}

export default function LoansPage() {
	const { data, isLoading, isError, error, refetch } = useLoansQuery()

	const loans = data?.loans ?? []
	const summary = data?.summary ?? null

	// Calculate total monthly with insurance
	const totalMonthly = summary ? summary.totalMonthlyPayment + summary.totalInsurance : 0

	return (
		<div className="space-y-8">
			{/* Header */}
			<PageHeader
				title="Crédits"
				description="Suivez vos emprunts et échéanciers"
			/>

			{/* Loading State */}
			{isLoading && (
				<>
					<div className="grid gap-4 sm:gap-5 grid-cols-2 lg:grid-cols-4 stagger-children">
						<StatsCardSkeleton />
						<StatsCardSkeleton />
						<StatsCardSkeleton />
						<StatsCardSkeleton />
					</div>
					<div className="space-y-4">
						<LoanCardSkeleton />
						<LoanCardSkeleton />
						<LoanCardSkeleton />
					</div>
				</>
			)}

			{/* Error State */}
			{isError && !isLoading && (
				<Card className="border-destructive/50">
					<CardContent className="py-8">
						<div className="flex flex-col items-center justify-center text-center">
							<p className="text-destructive mb-4">
								{error instanceof Error ? error.message : 'Une erreur est survenue'}
							</p>
							<Button onClick={() => refetch()} variant="outline" size="sm">
								<Loader2 className="h-4 w-4 mr-2" />
								Réessayer
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Content */}
			{!isLoading && !isError && (
				loans.length === 0 ? (
					<EmptyState />
				) : (
					<>
							{/* Stats Overview */}
							{summary && (
								<div className="grid gap-4 sm:gap-5 grid-cols-2 lg:grid-cols-4 stagger-children">
									<div className="stat-card">
										<div className="stat-card-content">
											<div className="stat-card-text">
												<p className="text-xs sm:text-sm font-medium text-muted-foreground">Capital restant dû</p>
												<p className="stat-card-value">{formatCurrency(summary.totalRemaining)}</p>
												<p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">
													{summary.totalLoans} crédit{summary.totalLoans > 1 ? 's' : ''} actif{summary.totalLoans > 1 ? 's' : ''}
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
													Dont {formatCurrency(summary.totalInsurance)} assurance
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
												<p className="stat-card-value">{summary.averageRate.toFixed(2)}%</p>
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
							)}

							{/* Loans List */}
							<div className="space-y-4">
								{loans.map((loan) => {
									const Icon = getPropertyIcon(loan.property.type)
									const progress = ((loan.initialAmount - loan.remainingAmount) / loan.initialAmount) * 100
									const remainingMonths = calculateRemainingMonths(loan.endDate)
									const loanInsuranceTotal = loan.loanInsurances.reduce((sum, ins) => sum + ins.monthlyPremium, 0)

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
																{loan.lender || 'Prêt familial'} · {loan.rate}%
															</p>
															<Link
																href={`/dashboard/real-estate/${loan.propertyId}`}
																className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-0.5"
															>
																{loan.property.name}
																<ExternalLink className="h-3 w-3" />
															</Link>
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
																<DropdownMenuItem asChild>
																	<Link href={`/dashboard/real-estate/${loan.propertyId}`}>
																		Voir le bien
																	</Link>
																</DropdownMenuItem>
																<DropdownMenuSeparator />
																<DropdownMenuItem className="text-muted-foreground">
																	Autres options à venir
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</div>
												</div>
											</CardHeader>
											<CardContent className="space-y-4">
												{/* Mobile: Show remaining amount */}
												<div className="sm:hidden">
													<p className="text-2xl font-semibold number-display">
														{formatCurrency(loan.remainingAmount)}
													</p>
													<p className="text-xs text-muted-foreground">Capital restant</p>
												</div>

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
														{loanInsuranceTotal > 0 && (
															<p className="text-xs text-muted-foreground">
																+ {formatCurrency(loanInsuranceTotal)} assurance
															</p>
														)}
													</div>
													<div className="rounded-xl bg-muted/30 p-3">
														<div className="flex items-center gap-1 text-muted-foreground mb-1">
															<Percent className="h-3.5 w-3.5" />
															<span className="text-xs">Taux</span>
														</div>
														<p className="font-semibold">{loan.rate}%</p>
														<p className="text-xs text-muted-foreground">Taux nominal</p>
													</div>
													<div className="rounded-xl bg-muted/30 p-3">
														<div className="flex items-center gap-1 text-muted-foreground mb-1">
															<Calendar className="h-3.5 w-3.5" />
															<span className="text-xs">Durée restante</span>
														</div>
														<p className="font-semibold">{formatRemainingTime(loan.endDate)}</p>
														{loan.endDate && (
															<p className="text-xs text-muted-foreground">{remainingMonths} échéances</p>
														)}
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
									)
								})}
							</div>

							{/* Summary Card */}
							{summary && totalMonthly > 0 && (
								<Card className="border-border/60 bg-muted/20">
									<CardContent className="pt-6">
										<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
											<div>
												<p className="font-medium">Total mensuel</p>
												<p className="text-sm text-muted-foreground">Tous crédits confondus</p>
											</div>
											<div className="text-right">
												<p className="text-3xl font-semibold number-display">
													{formatCurrency(totalMonthly)}
												</p>
												<p className="text-sm text-muted-foreground">
													{formatCurrency(summary.totalMonthlyPayment)} capital +{' '}
													{formatCurrency(summary.totalInsurance)} assurance
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
							)}
					</>
				)
			)}
		</div>
	)
}
