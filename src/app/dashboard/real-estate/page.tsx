'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
	Building2,
	Home,
	MapPin,
	MoreHorizontal,
	Plus,
	TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import type { PropertyType, PropertyUsage, Loan } from '@prisma/client'

// Type for property with members and related data
interface PropertyMemberWithDetails {
	id: string
	memberId: string
	ownershipShare: number
	member: {
		id: string
		name: string
		color: string | null
	}
}

interface PropertyWithDetails {
	id: string
	name: string
	type: PropertyType
	usage: PropertyUsage
	address: string
	address2: string | null
	city: string
	postalCode: string
	surface: number
	rooms: number | null
	bedrooms: number | null
	purchasePrice: number
	purchaseDate: string
	notaryFees: number
	agencyFees: number | null
	currentValue: number
	rentAmount: number | null
	rentCharges: number | null
	notes: string | null
	createdAt: string
	updatedAt: string
	propertyMembers: PropertyMemberWithDetails[]
	loans: Loan[]
	_count: {
		loans: number
		utilityContracts: number
	}
}

interface PropertySummary {
	totalProperties: number
	totalValue: number
	totalLoansRemaining: number
	totalEquity: number
	byType: Record<string, { count: number; value: number }>
	byUsage: Record<string, { count: number; value: number }>
}

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: 0,
	}).format(amount)
}

function getPropertyTypeLabel(type: PropertyType): string {
	switch (type) {
		case 'HOUSE':
			return 'Maison'
		case 'APARTMENT':
			return 'Appartement'
		default:
			return type
	}
}

function getPropertyUsageLabel(usage: PropertyUsage): string {
	switch (usage) {
		case 'PRIMARY':
			return 'Résidence principale'
		case 'SECONDARY':
			return 'Résidence secondaire'
		case 'RENTAL':
			return 'Locatif'
		default:
			return usage
	}
}

function PropertyCardSkeleton() {
	return (
		<Card className="border-border/60">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-3">
						<Skeleton className="h-12 w-12 rounded-xl" />
						<div className="space-y-2">
							<Skeleton className="h-5 w-40" />
							<Skeleton className="h-3 w-32" />
						</div>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-2 gap-4">
					<Skeleton className="h-20 rounded-xl" />
					<Skeleton className="h-20 rounded-xl" />
				</div>
				<Skeleton className="h-6 w-full" />
			</CardContent>
		</Card>
	)
}

function StatsCardSkeleton() {
	return (
		<div className="stat-card">
			<div className="stat-card-content">
				<div className="stat-card-text">
					<Skeleton className="h-4 w-24 mb-2" />
					<Skeleton className="h-8 w-32 mb-2" />
					<Skeleton className="h-3 w-20" />
				</div>
				<Skeleton className="h-10 w-10 rounded-lg" />
			</div>
		</div>
	)
}

function EmptyState() {
	return (
		<Card className="border-border/60 border-dashed">
			<CardContent className="flex flex-col items-center justify-center py-12">
				<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
					<Building2 className="h-8 w-8 text-muted-foreground" />
				</div>
				<h3 className="text-lg font-medium mb-1">Aucun bien immobilier</h3>
				<p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
					Ajoutez votre premier bien pour commencer à suivre votre patrimoine immobilier.
				</p>
				<Button className="gap-2">
					<Plus className="h-4 w-4" />
					Ajouter un bien
				</Button>
			</CardContent>
		</Card>
	)
}

export default function RealEstatePage() {
	const [properties, setProperties] = useState<PropertyWithDetails[]>([])
	const [summary, setSummary] = useState<PropertySummary | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const fetchProperties = useCallback(async () => {
		try {
			setLoading(true)
			setError(null)
			const response = await fetch('/api/properties')
			if (!response.ok) {
				throw new Error('Erreur lors du chargement des biens')
			}
			const data = await response.json()
			setProperties(data.properties)
			setSummary(data.summary)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Une erreur est survenue')
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchProperties()
	}, [fetchProperties])

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

			{/* Error state */}
			{error && (
				<Card className="border-destructive/50 bg-destructive/5">
					<CardContent className="py-4">
						<p className="text-sm text-destructive">{error}</p>
						<Button variant="outline" size="sm" className="mt-2" onClick={fetchProperties}>
							Réessayer
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Stats Overview */}
			<div className="grid gap-4 sm:gap-5 grid-cols-2 lg:grid-cols-4 stagger-children">
				{loading ? (
					<>
						<StatsCardSkeleton />
						<StatsCardSkeleton />
						<StatsCardSkeleton />
						<StatsCardSkeleton />
					</>
				) : summary ? (
					<>
						<div className="stat-card">
							<div className="stat-card-content">
								<div className="stat-card-text">
									<p className="text-xs sm:text-sm font-medium text-muted-foreground">Valeur totale</p>
									<p className="stat-card-value">{formatCurrency(summary.totalValue)}</p>
									<p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">
										{summary.totalProperties} bien{summary.totalProperties > 1 ? 's' : ''}
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
									<p className="stat-card-value value-positive">{formatCurrency(summary.totalEquity)}</p>
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
									<p className="text-xs sm:text-sm font-medium text-muted-foreground">Crédits restants</p>
									<p className="stat-card-value">{formatCurrency(summary.totalLoansRemaining)}</p>
									<p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">
										{summary.totalValue > 0
											? `${((summary.totalLoansRemaining / summary.totalValue) * 100).toFixed(0)}% de la valeur`
											: '-'}
									</p>
								</div>
								<div className="stat-card-icon">
									<TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 rotate-180" />
								</div>
							</div>
						</div>

						<div className="stat-card">
							<div className="stat-card-content">
								<div className="stat-card-text">
									<p className="text-xs sm:text-sm font-medium text-muted-foreground">Équité</p>
									<p className="stat-card-value">
										{summary.totalValue > 0
											? `${((summary.totalEquity / summary.totalValue) * 100).toFixed(0)}%`
											: '-'}
									</p>
									<p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">Du patrimoine</p>
								</div>
								<div className="stat-card-icon">
									<Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
								</div>
							</div>
						</div>
					</>
				) : null}
			</div>

			{/* Credit Progress */}
			{!loading && summary && summary.totalValue > 0 && (
				<Card className="border-border/60">
					<CardContent className="pt-6">
						<div className="flex items-center justify-between mb-3">
							<div>
								<p className="font-medium">Capital restant dû</p>
								<p className="text-sm text-muted-foreground">
									{formatCurrency(summary.totalLoansRemaining)} sur {formatCurrency(summary.totalValue)}
								</p>
							</div>
							<p className="text-lg font-semibold number-display">
								{((summary.totalLoansRemaining / summary.totalValue) * 100).toFixed(1)}%
							</p>
						</div>
						<Progress value={(summary.totalLoansRemaining / summary.totalValue) * 100} className="h-3" />
						<p className="mt-2 text-xs text-muted-foreground">
							Équité: {formatCurrency(summary.totalEquity)} ({((summary.totalEquity / summary.totalValue) * 100).toFixed(1)}%)
						</p>
					</CardContent>
				</Card>
			)}

			{/* Properties Grid */}
			{loading ? (
				<div className="grid gap-6 lg:grid-cols-2">
					<PropertyCardSkeleton />
					<PropertyCardSkeleton />
				</div>
			) : properties.length === 0 ? (
				<EmptyState />
			) : (
				<div className="grid gap-6 lg:grid-cols-2">
					{properties.map((property) => {
						const totalLoansRemaining = property.loans.reduce((sum, loan) => sum + loan.remainingAmount, 0)
						const appreciation =
							((property.currentValue - property.purchasePrice) / property.purchasePrice) * 100
						const equity = property.currentValue - totalLoansRemaining
						const loanProgress = property.purchasePrice > 0
							? (totalLoansRemaining / property.purchasePrice) * 100
							: 0
						const isRental = property.usage === 'RENTAL'

						return (
							<Card key={property.id} className="border-border/60 group overflow-hidden">
								<CardHeader className="pb-3">
									<div className="flex items-start justify-between">
										<Link href={`/dashboard/real-estate/${property.id}`} className="flex items-center gap-3 flex-1 min-w-0">
											<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
												{property.type === 'HOUSE' ? (
													<Home className="h-6 w-6" />
												) : (
													<Building2 className="h-6 w-6" />
												)}
											</div>
											<div className="min-w-0">
												<CardTitle className="text-lg font-medium truncate">{property.name}</CardTitle>
												<div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
													<MapPin className="h-3 w-3 shrink-0" />
													<span className="truncate">{property.address}, {property.city}</span>
												</div>
											</div>
										</Link>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
												>
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem asChild>
													<Link href={`/dashboard/real-estate/${property.id}`}>Voir les détails</Link>
												</DropdownMenuItem>
												<DropdownMenuItem>Modifier</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem className="text-destructive">Supprimer</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
									<div className="flex flex-wrap gap-1.5 mt-2">
										<span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
											{getPropertyTypeLabel(property.type)}
										</span>
										<span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
											{getPropertyUsageLabel(property.usage)}
										</span>
										{property.propertyMembers.length > 0 && (
											<span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
												{property.propertyMembers.map(pm => pm.member.name).join(', ')}
											</span>
										)}
									</div>
								</CardHeader>
								<CardContent className="space-y-4">
									{/* Value & Equity */}
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
												{property.currentValue > 0
													? `${((equity / property.currentValue) * 100).toFixed(0)}% de la valeur`
													: '-'}
											</p>
										</div>
									</div>

									{/* Loan Progress */}
									{totalLoansRemaining > 0 && (
										<div>
											<div className="flex justify-between text-xs mb-1">
												<span className="text-muted-foreground">
													Crédit restant ({property._count.loans} prêt{property._count.loans > 1 ? 's' : ''})
												</span>
												<span className="number-display">
													{formatCurrency(totalLoansRemaining)}
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
												<Building2 className="h-3.5 w-3.5" />
												<span className="text-xs">Pièces</span>
											</div>
											<p className="font-medium mt-1">{property.rooms || '-'}</p>
										</div>
										<div className="text-center">
											<div className="flex items-center justify-center gap-1 text-muted-foreground">
												<Building2 className="h-3.5 w-3.5" />
												<span className="text-xs">Chambres</span>
											</div>
											<p className="font-medium mt-1">{property.bedrooms || '-'}</p>
										</div>
									</div>

									{/* Rent Info if rental */}
									{isRental && property.rentAmount && (
										<div className="rounded-xl bg-[oklch(0.55_0.15_145)]/10 p-3">
											<div className="flex justify-between items-center">
												<div>
													<p className="text-xs text-[oklch(0.55_0.15_145)]">Loyer mensuel</p>
													<p className="text-lg font-semibold number-display text-[oklch(0.55_0.15_145)]">
														{formatCurrency(property.rentAmount)}
													</p>
												</div>
												{property.rentCharges && (
													<div className="text-right">
														<p className="text-xs text-muted-foreground">Net de charges</p>
														<p className="font-medium number-display">
															{formatCurrency(property.rentAmount - property.rentCharges)}
														</p>
													</div>
												)}
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						)
					})}
				</div>
			)}
		</div>
	)
}
