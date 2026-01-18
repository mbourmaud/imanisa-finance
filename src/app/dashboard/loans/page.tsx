'use client';

import Link from 'next/link';
import {
	ArrowDown,
	Box,
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
	Flex,
	GlassCard,
	Grid,
	HStack,
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
	VStack,
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
			<HStack justify="between" align="start">
				<VStack gap="sm">
					<Skeleton style={{ height: '1rem', width: '6rem' }} />
					<Skeleton style={{ height: '2rem', width: '8rem' }} />
					<Skeleton style={{ height: '0.75rem', width: '5rem' }} />
				</VStack>
				<Skeleton style={{ height: '2.5rem', width: '2.5rem', borderRadius: '0.75rem' }} />
			</HStack>
		</GlassCard>
	);
}

function LoanCardSkeleton() {
	return (
		<Card style={{ borderColor: 'hsl(var(--border) / 0.6)' }}>
			<CardHeader style={{ paddingBottom: '0.75rem' }}>
				<HStack justify="between" align="start">
					<HStack gap="md" align="center">
						<Skeleton style={{ height: '3rem', width: '3rem', borderRadius: '0.75rem' }} />
						<VStack gap="sm">
							<Skeleton style={{ height: '1.25rem', width: '10rem' }} />
							<Skeleton style={{ height: '1rem', width: '8rem' }} />
						</VStack>
					</HStack>
					<Box style={{ display: 'none', textAlign: 'right' }} data-show-sm>
						<Skeleton style={{ height: '2rem', width: '7rem', marginBottom: '0.25rem' }} />
						<Skeleton style={{ height: '0.75rem', width: '5rem' }} />
					</Box>
				</HStack>
			</CardHeader>
			<CardContent>
				<VStack gap="md">
					<VStack gap="sm">
						<Skeleton style={{ height: '0.75rem', width: '100%' }} />
						<Skeleton style={{ height: '0.5rem', width: '100%' }} />
					</VStack>
					<Grid
						cols={2}
						colsSm={4}
						gap="md"
						style={{ paddingTop: '0.5rem', borderTop: '1px solid hsl(var(--border) / 0.4)' }}
					>
						<Box rounded="xl" p="sm" style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}>
							<Skeleton style={{ height: '0.75rem', width: '4rem', marginBottom: '0.5rem' }} />
							<Skeleton style={{ height: '1.25rem', width: '5rem' }} />
							<Skeleton style={{ height: '0.75rem', width: '3.5rem', marginTop: '0.25rem' }} />
						</Box>
						<Box rounded="xl" p="sm" style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}>
							<Skeleton style={{ height: '0.75rem', width: '4rem', marginBottom: '0.5rem' }} />
							<Skeleton style={{ height: '1.25rem', width: '5rem' }} />
							<Skeleton style={{ height: '0.75rem', width: '3.5rem', marginTop: '0.25rem' }} />
						</Box>
						<Box rounded="xl" p="sm" style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}>
							<Skeleton style={{ height: '0.75rem', width: '4rem', marginBottom: '0.5rem' }} />
							<Skeleton style={{ height: '1.25rem', width: '5rem' }} />
							<Skeleton style={{ height: '0.75rem', width: '3.5rem', marginTop: '0.25rem' }} />
						</Box>
						<Box rounded="xl" p="sm" style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}>
							<Skeleton style={{ height: '0.75rem', width: '4rem', marginBottom: '0.5rem' }} />
							<Skeleton style={{ height: '1.25rem', width: '5rem' }} />
							<Skeleton style={{ height: '0.75rem', width: '3.5rem', marginTop: '0.25rem' }} />
						</Box>
					</Grid>
				</VStack>
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
		<VStack gap="xl">
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
					<VStack gap="md">
						<LoanCardSkeleton />
						<LoanCardSkeleton />
						<LoanCardSkeleton />
					</VStack>
				</>
			)}

			{/* Error State */}
			{isError && !isLoading && (
				<Card style={{ borderColor: 'hsl(var(--destructive) / 0.5)' }}>
					<CardContent style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
						<VStack gap="md" align="center" style={{ textAlign: 'center' }}>
							<Text style={{ color: 'hsl(var(--destructive))' }}>
								{error instanceof Error ? error.message : 'Une erreur est survenue'}
							</Text>
							<Button onClick={() => refetch()} variant="outline" size="sm">
								<Loader2 style={{ height: '1rem', width: '1rem', marginRight: '0.5rem' }} />
								Réessayer
							</Button>
						</VStack>
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
						<VStack gap="md">
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
											<HStack justify="between" align="start">
												<HStack gap="md" align="center">
													<Flex
														align="center"
														justify="center"
														style={{
															height: '3rem',
															width: '3rem',
															borderRadius: '0.75rem',
															backgroundColor: 'hsl(var(--primary) / 0.1)',
															color: 'hsl(var(--primary))',
														}}
													>
														<Icon style={{ height: '1.5rem', width: '1.5rem' }} />
													</Flex>
													<VStack gap="none">
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
													</VStack>
												</HStack>
												<HStack gap="md" align="center">
													<Box style={{ display: 'none', textAlign: 'right' }} data-show-sm>
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
													</Box>
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
												</HStack>
											</HStack>
										</CardHeader>
										<CardContent>
											<VStack gap="md">
												{/* Mobile: Show remaining amount */}
												<Box display="block" data-hide-sm>
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
												</Box>

												{/* Progress Bar */}
												<VStack gap="sm">
													<HStack justify="between">
														<Text size="xs" color="muted">
															Remboursé: {formatCurrency(loan.initialAmount - loan.remainingAmount)}
														</Text>
														<Text size="xs" weight="medium">
															{progress.toFixed(1)}%
														</Text>
													</HStack>
													<Progress value={progress} style={{ height: '0.5rem' }} />
												</VStack>

												{/* Info Grid */}
												<Grid
													cols={2}
													colsSm={4}
													gap="md"
													style={{
														paddingTop: '0.5rem',
														borderTop: '1px solid hsl(var(--border) / 0.4)',
													}}
												>
													<Box
														rounded="xl"
														p="sm"
														style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}
													>
														<HStack
															gap="xs"
															align="center"
															style={{
																color: 'hsl(var(--muted-foreground))',
																marginBottom: '0.25rem',
															}}
														>
															<Euro style={{ height: '0.875rem', width: '0.875rem' }} />
															<Text size="xs">Mensualité</Text>
														</HStack>
														<Text weight="semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
															{formatCurrency(loan.monthlyPayment)}
														</Text>
														{loanInsuranceTotal > 0 && (
															<Text size="xs" color="muted">
																+ {formatCurrency(loanInsuranceTotal)} assurance
															</Text>
														)}
													</Box>
													<Box
														rounded="xl"
														p="sm"
														style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}
													>
														<HStack
															gap="xs"
															align="center"
															style={{
																color: 'hsl(var(--muted-foreground))',
																marginBottom: '0.25rem',
															}}
														>
															<Percent style={{ height: '0.875rem', width: '0.875rem' }} />
															<Text size="xs">Taux</Text>
														</HStack>
														<Text weight="semibold">{loan.rate}%</Text>
														<Text size="xs" color="muted">
															Taux nominal
														</Text>
													</Box>
													<Box
														rounded="xl"
														p="sm"
														style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}
													>
														<HStack
															gap="xs"
															align="center"
															style={{
																color: 'hsl(var(--muted-foreground))',
																marginBottom: '0.25rem',
															}}
														>
															<Calendar style={{ height: '0.875rem', width: '0.875rem' }} />
															<Text size="xs">Durée restante</Text>
														</HStack>
														<Text weight="semibold">{formatRemainingTime(loan.endDate)}</Text>
														{loan.endDate && (
															<Text size="xs" color="muted">
																{remainingMonths} échéances
															</Text>
														)}
													</Box>
													<Box
														rounded="xl"
														p="sm"
														style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}
													>
														<HStack
															gap="xs"
															align="center"
															style={{
																color: 'hsl(var(--muted-foreground))',
																marginBottom: '0.25rem',
															}}
														>
															<ArrowDown style={{ height: '0.875rem', width: '0.875rem' }} />
															<Text size="xs">Montant initial</Text>
														</HStack>
														<Text weight="semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
															{formatCurrency(loan.initialAmount)}
														</Text>
														<Text size="xs" color="muted">
															Emprunté
														</Text>
													</Box>
												</Grid>
											</VStack>
										</CardContent>
									</Card>
								);
							})}
						</VStack>

						{/* Summary Card */}
						{summary && totalMonthly > 0 && (
							<Card
								style={{
									borderColor: 'hsl(var(--border) / 0.6)',
									backgroundColor: 'hsl(var(--muted) / 0.2)',
								}}
							>
								<CardContent style={{ paddingTop: '1.5rem' }}>
									<HStack
										justify="between"
										align="center"
										gap="md"
										style={{ flexDirection: 'column' }}
										data-sm-row
									>
										<VStack gap="none">
											<Text weight="medium">Total mensuel</Text>
											<Text size="sm" color="muted">
												Tous crédits confondus
											</Text>
										</VStack>
										<Box style={{ textAlign: 'right' }}>
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
										</Box>
									</HStack>
								</CardContent>
							</Card>
						)}
					</>
				))}
		</VStack>
	);
}
