'use client';

import Link from 'next/link';
import {
	ArrowDown,
	Building2,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	ContentSkeleton,
	CreditCard,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	EmptyState as EmptyStateComponent,
	Euro,
	ExternalLink,
	Flex,
	GlassCard,
	IconBox,
	Loader2,
	MoreHorizontal,
	PageHeader,
	Percent,
	Progress,
	Skeleton,
	StatCard,
	StatCardGrid,
	TrendingDown,
	Calendar,
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
			<Flex direction="row" justify="between" align="start">
				<Flex direction="col" gap="sm">
					<Skeleton style={{ height: '1rem', width: '6rem' }} />
					<Skeleton style={{ height: '2rem', width: '8rem' }} />
					<Skeleton style={{ height: '0.75rem', width: '5rem' }} />
				</Flex>
				<Skeleton style={{ height: '2.5rem', width: '2.5rem', borderRadius: '0.75rem' }} />
			</Flex>
		</GlassCard>
	);
}

function LoanCardSkeleton() {
	return (
		<Card style={{ borderColor: 'hsl(var(--border) / 0.6)' }}>
			<CardHeader style={{ paddingBottom: '0.75rem' }}>
				<Flex direction="row" justify="between" align="start">
					<Flex direction="row" gap="md">
						<ContentSkeleton variant="icon" size="lg" />
						<Flex direction="col" gap="sm">
							<Skeleton style={{ height: '1.25rem', width: '10rem' }} />
							<Skeleton style={{ height: '1rem', width: '8rem' }} />
						</Flex>
					</Flex>
					<Flex direction="col" gap="xs" align="end" data-show-sm style={{ display: 'none' }}>
						<Skeleton style={{ height: '2rem', width: '7rem' }} />
						<Skeleton style={{ height: '0.75rem', width: '5rem' }} />
					</Flex>
				</Flex>
			</CardHeader>
			<CardContent>
				<Flex direction="col" gap="md">
					<Flex direction="col" gap="sm">
						<Skeleton style={{ height: '0.75rem', width: '100%' }} />
						<Skeleton style={{ height: '0.5rem', width: '100%' }} />
					</Flex>
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
							gap: '1rem',
							paddingTop: '0.5rem',
							borderTop: '1px solid hsl(var(--border) / 0.4)',
						}}
					>
						{[1, 2, 3, 4].map((i) => (
							<div
								key={i}
								style={{ backgroundColor: 'hsl(var(--muted) / 0.3)', borderRadius: '0.75rem', padding: '0.75rem' }}
							>
								<Skeleton style={{ height: '0.75rem', width: '4rem', marginBottom: '0.5rem' }} />
								<Skeleton style={{ height: '1.25rem', width: '5rem' }} />
								<Skeleton style={{ height: '0.75rem', width: '3.5rem', marginTop: '0.25rem' }} />
							</div>
						))}
					</div>
				</Flex>
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
		<Flex direction="col" gap="xl">
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
					<Flex direction="col" gap="md">
						<LoanCardSkeleton />
						<LoanCardSkeleton />
						<LoanCardSkeleton />
					</Flex>
				</>
			)}

			{/* Error State */}
			{isError && !isLoading && (
				<Card style={{ borderColor: 'hsl(var(--destructive) / 0.5)' }}>
					<CardContent style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
						<Flex direction="col" gap="md" align="center">
							<span className="text-destructive">
								{error instanceof Error ? error.message : 'Une erreur est survenue'}
							</span>
							<Button onClick={() => refetch()} variant="outline" size="sm">
								<Loader2 style={{ height: '1rem', width: '1rem', marginRight: '0.5rem' }} />
								Réessayer
							</Button>
						</Flex>
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
						<Flex direction="col" gap="md">
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
											<Flex direction="row" justify="between" align="start">
												<Flex direction="row" gap="md">
													<IconBox icon={Icon} size="lg" variant="primary" rounded="xl" />
													<Flex direction="col" gap="xs">
														<CardTitle style={{ fontSize: '1.125rem', fontWeight: 500 }}>
															{loan.name}
														</CardTitle>
														<span className="text-sm text-muted-foreground">
															{loan.lender || 'Prêt familial'} · {loan.rate}%
														</span>
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
													</Flex>
												</Flex>
												<Flex direction="row" gap="md">
													<Flex direction="col" gap="xs" align="end" data-show-sm style={{ display: 'none' }}>
														<span
															className="text-2xl font-semibold"
															style={{ fontVariantNumeric: 'tabular-nums' }}
														>
															{formatCurrency(loan.remainingAmount)}
														</span>
														<span className="text-xs text-muted-foreground">
															Capital restant
														</span>
													</Flex>
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
												</Flex>
											</Flex>
										</CardHeader>
										<CardContent>
											<Flex direction="col" gap="md">
												{/* Mobile: Show remaining amount */}
												<Flex
													direction="col"
													gap="xs"
													data-show-mobile
													style={{ display: 'block' }}
												>
													<span
														className="text-2xl font-semibold"
														style={{ fontVariantNumeric: 'tabular-nums' }}
													>
														{formatCurrency(loan.remainingAmount)}
													</span>
													<span className="text-xs text-muted-foreground">
														Capital restant
													</span>
												</Flex>

												{/* Progress Bar */}
												<Flex direction="col" gap="sm">
													<Flex direction="row" justify="between">
														<span className="text-xs text-muted-foreground">
															Remboursé: {formatCurrency(loan.initialAmount - loan.remainingAmount)}
														</span>
														<span className="text-xs font-medium">
															{progress.toFixed(1)}%
														</span>
													</Flex>
													<Progress value={progress} style={{ height: '0.5rem' }} />
												</Flex>

												{/* Info Grid */}
												<div
													style={{
														display: 'grid',
														gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
														gap: '1rem',
														paddingTop: '0.5rem',
														borderTop: '1px solid hsl(var(--border) / 0.4)',
													}}
												>
													<Flex
														direction="col"
														gap="xs"
														style={{
															backgroundColor: 'hsl(var(--muted) / 0.3)',
															borderRadius: '0.75rem',
															padding: '0.75rem',
														}}
													>
														<Flex
															direction="row"
															gap="sm"
															style={{ color: 'hsl(var(--muted-foreground))' }}
														>
															<Euro style={{ height: '0.875rem', width: '0.875rem' }} />
															<span className="text-xs">Mensualité</span>
														</Flex>
														<span
															className="font-semibold"
															style={{ fontVariantNumeric: 'tabular-nums' }}
														>
															{formatCurrency(loan.monthlyPayment)}
														</span>
														{loanInsuranceTotal > 0 && (
															<span className="text-xs text-muted-foreground">
																+ {formatCurrency(loanInsuranceTotal)} assurance
															</span>
														)}
													</Flex>
													<Flex
														direction="col"
														gap="xs"
														style={{
															backgroundColor: 'hsl(var(--muted) / 0.3)',
															borderRadius: '0.75rem',
															padding: '0.75rem',
														}}
													>
														<Flex
															direction="row"
															gap="sm"
															style={{ color: 'hsl(var(--muted-foreground))' }}
														>
															<Percent style={{ height: '0.875rem', width: '0.875rem' }} />
															<span className="text-xs">Taux</span>
														</Flex>
														<span className="font-semibold">{loan.rate}%</span>
														<span className="text-xs text-muted-foreground">
															Taux nominal
														</span>
													</Flex>
													<Flex
														direction="col"
														gap="xs"
														style={{
															backgroundColor: 'hsl(var(--muted) / 0.3)',
															borderRadius: '0.75rem',
															padding: '0.75rem',
														}}
													>
														<Flex
															direction="row"
															gap="sm"
															style={{ color: 'hsl(var(--muted-foreground))' }}
														>
															<Calendar style={{ height: '0.875rem', width: '0.875rem' }} />
															<span className="text-xs">Durée restante</span>
														</Flex>
														<span className="font-semibold">{formatRemainingTime(loan.endDate)}</span>
														{loan.endDate && (
															<span className="text-xs text-muted-foreground">
																{remainingMonths} échéances
															</span>
														)}
													</Flex>
													<Flex
														direction="col"
														gap="xs"
														style={{
															backgroundColor: 'hsl(var(--muted) / 0.3)',
															borderRadius: '0.75rem',
															padding: '0.75rem',
														}}
													>
														<Flex
															direction="row"
															gap="sm"
															style={{ color: 'hsl(var(--muted-foreground))' }}
														>
															<ArrowDown style={{ height: '0.875rem', width: '0.875rem' }} />
															<span className="text-xs">Montant initial</span>
														</Flex>
														<span
															className="font-semibold"
															style={{ fontVariantNumeric: 'tabular-nums' }}
														>
															{formatCurrency(loan.initialAmount)}
														</span>
														<span className="text-xs text-muted-foreground">
															Emprunté
														</span>
													</Flex>
												</div>
											</Flex>
										</CardContent>
									</Card>
								);
							})}
						</Flex>

						{/* Summary Card */}
						{summary && totalMonthly > 0 && (
							<Card
								style={{
									borderColor: 'hsl(var(--border) / 0.6)',
									backgroundColor: 'hsl(var(--muted) / 0.2)',
								}}
							>
								<CardContent style={{ paddingTop: '1.5rem' }}>
									<Flex direction="row" justify="between" align="center">
										<Flex direction="col" gap="xs">
											<span className="font-medium">Total mensuel</span>
											<span className="text-sm text-muted-foreground">
												Tous crédits confondus
											</span>
										</Flex>
										<Flex direction="col" gap="xs" align="end">
											<span
												className="text-3xl font-semibold"
												style={{ fontVariantNumeric: 'tabular-nums' }}
											>
												{formatCurrency(totalMonthly)}
											</span>
											<span className="text-sm text-muted-foreground">
												{formatCurrency(summary.totalMonthlyPayment)} capital +{' '}
												{formatCurrency(summary.totalInsurance)} assurance
											</span>
										</Flex>
									</Flex>
								</CardContent>
							</Card>
						)}
					</>
				))}
		</Flex>
	);
}
