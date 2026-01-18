'use client';

import Link from 'next/link';
import {
	ArrowDown,
	Building2,
	Button,
	Calendar,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CreditCard,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	EmptyState as EmptyStateComponent,
	Euro,
	ExternalLink,
	GlassCard,
	Loader2,
	MoreHorizontal,
	PageHeader,
	Percent,
	Progress,
	Skeleton,
	StatCard,
	StatCardGrid,
	Text,
	TrendingDown,
} from '@/components';
import { useLoansQuery } from '@/features/loans';
import type { PropertyType } from '@/lib/prisma';

// Helper functions
function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: 0,
	}).format(amount);
}

function getPropertyIcon(type: PropertyType) {
	switch (type) {
		case 'HOUSE':
		case 'APARTMENT':
			return Building2;
		default:
			return CreditCard;
	}
}

function calculateRemainingMonths(endDate: string | null): number {
	if (!endDate) return 0;
	const end = new Date(endDate);
	const now = new Date();
	const months = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth());
	return Math.max(0, months);
}

function formatRemainingTime(endDate: string | null): string {
	if (!endDate) return 'Non définie';
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

// Loading skeleton components
function StatsCardSkeleton() {
	return (
		<GlassCard padding="md">
			<div className="flex justify-between items-start">
				<div className="flex flex-col gap-3">
					<Skeleton style={{ height: '1rem', width: '6rem' }} />
					<Skeleton style={{ height: '2rem', width: '8rem' }} />
					<Skeleton style={{ height: '0.75rem', width: '5rem' }} />
				</div>
				<Skeleton style={{ height: '2.5rem', width: '2.5rem', borderRadius: '0.75rem' }} />
			</div>
		</GlassCard>
	);
}

function LoanCardSkeleton() {
	return (
		<Card style={{ borderColor: 'hsl(var(--border) / 0.6)' }}>
			<CardHeader style={{ paddingBottom: '0.75rem' }}>
				<div className="flex justify-between items-start">
					<div className="flex items-center gap-4">
						<Skeleton style={{ height: '3rem', width: '3rem', borderRadius: '0.75rem' }} />
						<div className="flex flex-col gap-3">
							<Skeleton style={{ height: '1.25rem', width: '10rem' }} />
							<Skeleton style={{ height: '1rem', width: '8rem' }} />
						</div>
					</div>
					<div className="hidden sm:block" style={{ textAlign: 'right' }}>
						<Skeleton style={{ height: '2rem', width: '7rem', marginBottom: '0.25rem' }} />
						<Skeleton style={{ height: '0.75rem', width: '5rem' }} />
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-3">
						<Skeleton style={{ height: '0.75rem', width: '100%' }} />
						<Skeleton style={{ height: '0.5rem', width: '100%' }} />
					</div>
					<div
						className="grid grid-cols-2 sm:grid-cols-4 gap-4"
						style={{ paddingTop: '0.5rem', borderTop: '1px solid hsl(var(--border) / 0.4)' }}
					>
						<div className="rounded-xl p-3" style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}>
							<Skeleton style={{ height: '0.75rem', width: '4rem', marginBottom: '0.5rem' }} />
							<Skeleton style={{ height: '1.25rem', width: '5rem' }} />
							<Skeleton style={{ height: '0.75rem', width: '3.5rem', marginTop: '0.25rem' }} />
						</div>
						<div className="rounded-xl p-3" style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}>
							<Skeleton style={{ height: '0.75rem', width: '4rem', marginBottom: '0.5rem' }} />
							<Skeleton style={{ height: '1.25rem', width: '5rem' }} />
							<Skeleton style={{ height: '0.75rem', width: '3.5rem', marginTop: '0.25rem' }} />
						</div>
						<div className="rounded-xl p-3" style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}>
							<Skeleton style={{ height: '0.75rem', width: '4rem', marginBottom: '0.5rem' }} />
							<Skeleton style={{ height: '1.25rem', width: '5rem' }} />
							<Skeleton style={{ height: '0.75rem', width: '3.5rem', marginTop: '0.25rem' }} />
						</div>
						<div className="rounded-xl p-3" style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}>
							<Skeleton style={{ height: '0.75rem', width: '4rem', marginBottom: '0.5rem' }} />
							<Skeleton style={{ height: '1.25rem', width: '5rem' }} />
							<Skeleton style={{ height: '0.75rem', width: '3.5rem', marginTop: '0.25rem' }} />
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
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
						<Building2 style={{ height: '1rem', width: '1rem', marginRight: '0.5rem' }} />
						Voir les biens
					</Link>
				</Button>
			}
		/>
	);
}

export default function LoansPage() {
	const { data, isLoading, isError, error, refetch } = useLoansQuery();

	const loans = data?.loans ?? [];
	const summary = data?.summary ?? null;

	// Calculate total monthly with insurance
	const totalMonthly = summary ? summary.totalMonthlyPayment + summary.totalInsurance : 0;

	return (
		<div className="flex flex-col gap-8">
			{/* Header */}
			<PageHeader title="Crédits" description="Suivez vos emprunts et échéanciers" />

			{/* Loading State */}
			{isLoading && (
				<>
					<StatCardGrid columns={4}>
						<StatsCardSkeleton />
						<StatsCardSkeleton />
						<StatsCardSkeleton />
						<StatsCardSkeleton />
					</StatCardGrid>
					<div className="flex flex-col gap-4">
						<LoanCardSkeleton />
						<LoanCardSkeleton />
						<LoanCardSkeleton />
					</div>
				</>
			)}

			{/* Error State */}
			{isError && !isLoading && (
				<Card style={{ borderColor: 'hsl(var(--destructive) / 0.5)' }}>
					<CardContent style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
						<div className="flex flex-col items-center gap-4 text-center">
							<Text style={{ color: 'hsl(var(--destructive))' }}>
								{error instanceof Error ? error.message : 'Une erreur est survenue'}
							</Text>
							<Button onClick={() => refetch()} variant="outline" size="sm">
								<Loader2 style={{ height: '1rem', width: '1rem', marginRight: '0.5rem' }} />
								Réessayer
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Content */}
			{!isLoading &&
				!isError &&
				(loans.length === 0 ? (
					<EmptyState />
				) : (
					<>
						{/* Stats Overview */}
						{summary && (
							<StatCardGrid columns={4}>
								<StatCard
									label="Capital restant dû"
									value={formatCurrency(summary.totalRemaining)}
									description={`${summary.totalLoans} crédit${summary.totalLoans > 1 ? 's' : ''} actif${summary.totalLoans > 1 ? 's' : ''}`}
									icon={TrendingDown}
									variant="coral"
								/>

								<StatCard
									label="Mensualités"
									value={formatCurrency(totalMonthly)}
									description={`Dont ${formatCurrency(summary.totalInsurance)} assurance`}
									icon={Euro}
									variant="default"
								/>

								<StatCard
									label="Taux moyen"
									value={`${summary.averageRate.toFixed(2)}%`}
									description="Sur capital restant"
									icon={Percent}
									variant="default"
								/>

								<StatCard
									label="Coût annuel"
									value={formatCurrency(totalMonthly * 12)}
									description="Remboursements/an"
									icon={Calendar}
									variant="default"
								/>
							</StatCardGrid>
						)}

						{/* Loans List */}
						<div className="flex flex-col gap-4">
							{loans.map((loan) => {
								const Icon = getPropertyIcon(loan.property.type);
								const progress =
									((loan.initialAmount - loan.remainingAmount) / loan.initialAmount) * 100;
								const remainingMonths = calculateRemainingMonths(loan.endDate);
								const loanInsuranceTotal = loan.loanInsurances.reduce(
									(sum, ins) => sum + ins.monthlyPremium,
									0,
								);

								return (
									<Card key={loan.id} style={{ borderColor: 'hsl(var(--border) / 0.6)' }}>
										<CardHeader style={{ paddingBottom: '0.75rem' }}>
											<div className="flex justify-between items-start">
												<div className="flex items-center gap-4">
													<div
														className="flex items-center justify-center h-12 w-12 rounded-xl"
														style={{
															backgroundColor: 'hsl(var(--primary) / 0.1)',
															color: 'hsl(var(--primary))',
														}}
													>
														<Icon style={{ height: '1.5rem', width: '1.5rem' }} />
													</div>
													<div className="flex flex-col">
														<CardTitle style={{ fontSize: '1.125rem', fontWeight: 500 }}>
															{loan.name}
														</CardTitle>
														<Text size="sm" color="muted">
															{loan.lender || 'Prêt familial'} · {loan.rate}%
														</Text>
														<Link
															href={`/dashboard/real-estate/${loan.propertyId}`}
															style={{
																fontSize: '0.75rem',
																color: 'hsl(var(--muted-foreground))',
																display: 'flex',
																alignItems: 'center',
																gap: '0.25rem',
																marginTop: '0.125rem',
															}}
														>
															{loan.property.name}
															<ExternalLink style={{ height: '0.75rem', width: '0.75rem' }} />
														</Link>
													</div>
												</div>
												<div className="flex items-center gap-4">
													<div className="hidden sm:block" style={{ textAlign: 'right' }}>
														<Text
															size="2xl"
															weight="semibold"
															style={{ fontVariantNumeric: 'tabular-nums' }}
														>
															{formatCurrency(loan.remainingAmount)}
														</Text>
														<Text size="xs" color="muted">
															Capital restant
														</Text>
													</div>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button
																variant="ghost"
																size="icon"
																style={{
																	height: '2rem',
																	width: '2rem',
																	opacity: 0,
																	transition: 'opacity 0.2s',
																}}
															>
																<MoreHorizontal style={{ height: '1rem', width: '1rem' }} />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuItem asChild>
																<Link href={`/dashboard/real-estate/${loan.propertyId}`}>
																	Voir le bien
																</Link>
															</DropdownMenuItem>
															<DropdownMenuSeparator />
															<DropdownMenuItem style={{ color: 'hsl(var(--muted-foreground))' }}>
																Autres options à venir
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</div>
											</div>
										</CardHeader>
										<CardContent>
											<div className="flex flex-col gap-4">
												{/* Mobile: Show remaining amount */}
												<div className="block sm:hidden">
													<Text
														size="2xl"
														weight="semibold"
														style={{ fontVariantNumeric: 'tabular-nums' }}
													>
														{formatCurrency(loan.remainingAmount)}
													</Text>
													<Text size="xs" color="muted">
														Capital restant
													</Text>
												</div>

												{/* Progress Bar */}
												<div className="flex flex-col gap-3">
													<div className="flex justify-between">
														<Text size="xs" color="muted">
															Remboursé: {formatCurrency(loan.initialAmount - loan.remainingAmount)}
														</Text>
														<Text size="xs" weight="medium">
															{progress.toFixed(1)}%
														</Text>
													</div>
													<Progress value={progress} style={{ height: '0.5rem' }} />
												</div>

												{/* Info Grid */}
												<div
													className="grid grid-cols-2 sm:grid-cols-4 gap-4"
													style={{
														paddingTop: '0.5rem',
														borderTop: '1px solid hsl(var(--border) / 0.4)',
													}}
												>
													<div
														className="rounded-xl p-3"
														style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}
													>
														<div
															className="flex items-center gap-2 mb-1"
															style={{ color: 'hsl(var(--muted-foreground))' }}
														>
															<Euro style={{ height: '0.875rem', width: '0.875rem' }} />
															<Text size="xs">Mensualité</Text>
														</div>
														<Text weight="semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
															{formatCurrency(loan.monthlyPayment)}
														</Text>
														{loanInsuranceTotal > 0 && (
															<Text size="xs" color="muted">
																+ {formatCurrency(loanInsuranceTotal)} assurance
															</Text>
														)}
													</div>
													<div
														className="rounded-xl p-3"
														style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}
													>
														<div
															className="flex items-center gap-2 mb-1"
															style={{ color: 'hsl(var(--muted-foreground))' }}
														>
															<Percent style={{ height: '0.875rem', width: '0.875rem' }} />
															<Text size="xs">Taux</Text>
														</div>
														<Text weight="semibold">{loan.rate}%</Text>
														<Text size="xs" color="muted">
															Taux nominal
														</Text>
													</div>
													<div
														className="rounded-xl p-3"
														style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}
													>
														<div
															className="flex items-center gap-2 mb-1"
															style={{ color: 'hsl(var(--muted-foreground))' }}
														>
															<Calendar style={{ height: '0.875rem', width: '0.875rem' }} />
															<Text size="xs">Durée restante</Text>
														</div>
														<Text weight="semibold">{formatRemainingTime(loan.endDate)}</Text>
														{loan.endDate && (
															<Text size="xs" color="muted">
																{remainingMonths} échéances
															</Text>
														)}
													</div>
													<div
														className="rounded-xl p-3"
														style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}
													>
														<div
															className="flex items-center gap-2 mb-1"
															style={{ color: 'hsl(var(--muted-foreground))' }}
														>
															<ArrowDown style={{ height: '0.875rem', width: '0.875rem' }} />
															<Text size="xs">Montant initial</Text>
														</div>
														<Text weight="semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
															{formatCurrency(loan.initialAmount)}
														</Text>
														<Text size="xs" color="muted">
															Emprunté
														</Text>
													</div>
												</div>
											</div>
										</CardContent>
									</Card>
								);
							})}
						</div>

						{/* Summary Card */}
						{summary && totalMonthly > 0 && (
							<Card
								style={{
									borderColor: 'hsl(var(--border) / 0.6)',
									backgroundColor: 'hsl(var(--muted) / 0.2)',
								}}
							>
								<CardContent style={{ paddingTop: '1.5rem' }}>
									<div className="flex flex-col sm:flex-row justify-between items-center gap-4">
										<div className="flex flex-col">
											<Text weight="medium">Total mensuel</Text>
											<Text size="sm" color="muted">
												Tous crédits confondus
											</Text>
										</div>
										<div style={{ textAlign: 'right' }}>
											<Text
												size="3xl"
												weight="semibold"
												style={{ fontVariantNumeric: 'tabular-nums' }}
											>
												{formatCurrency(totalMonthly)}
											</Text>
											<Text size="sm" color="muted">
												{formatCurrency(summary.totalMonthlyPayment)} capital +{' '}
												{formatCurrency(summary.totalInsurance)} assurance
											</Text>
										</div>
									</div>
								</CardContent>
							</Card>
						)}
					</>
				))}
		</div>
	);
}
