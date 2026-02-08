'use client';

import Link from 'next/link';
import {
	Building2,
	Button,
	Card,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	Home,
	IconBox,
	MapPin,
	MoreHorizontal,
	Progress,
	PropertyBadge,
	PropertyInfoItem,
	PropertyRentBox,
	PropertyValueBox,
} from '@/components';
import type { PropertyWithDetails } from '@/features/properties';
import { getPropertyTypeLabel, getPropertyUsageLabel } from '@/features/properties';

interface PropertyCardProps {
	property: PropertyWithDetails;
	formatCurrency: (amount: number) => string;
}

export function PropertyCard({ property, formatCurrency }: PropertyCardProps) {
	const totalLoansRemaining = property.loans.reduce((sum, loan) => sum + loan.remainingAmount, 0);
	const appreciation =
		((property.currentValue - property.purchasePrice) / property.purchasePrice) * 100;
	const equity = property.currentValue - totalLoansRemaining;
	const loanProgress =
		property.purchasePrice > 0 ? (totalLoansRemaining / property.purchasePrice) * 100 : 0;
	const isRentalProperty = property.usage === 'RENTAL';

	return (
		<Card padding="lg" className="group overflow-hidden">
			<div className="flex flex-col gap-4">
				{/* Header */}
				<div className="flex flex-row justify-between">
					<Link
						href={`/dashboard/real-estate/${property.id}`}
						className="flex min-w-0 flex-1 items-center gap-3"
					>
						<IconBox
							icon={property.type === 'HOUSE' ? Home : Building2}
							size="lg"
							variant="primary"
							rounded="xl"
						/>
						<div className="min-w-0">
							<h3 className="truncate text-lg font-bold tracking-tight">{property.name}</h3>
							<div className="flex flex-row gap-1 mt-0.5">
								<MapPin className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
								<span className="truncate text-xs text-muted-foreground">
									{property.address}, {property.city}
								</span>
							</div>
						</div>
					</Link>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-10 w-10 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
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

				<div className="flex flex-row gap-2 flex-wrap">
					<PropertyBadge>{getPropertyTypeLabel(property.type)}</PropertyBadge>
					<PropertyBadge>{getPropertyUsageLabel(property.usage)}</PropertyBadge>
					{property.propertyMembers.length > 0 && (
						<PropertyBadge>
							{property.propertyMembers.map((pm) => pm.member.name).join(', ')}
						</PropertyBadge>
					)}
				</div>

				{/* Value & Equity */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<PropertyValueBox
						label="Valeur actuelle"
						value={formatCurrency(property.currentValue)}
						subtitle={`${appreciation >= 0 ? '+' : ''}${appreciation.toFixed(1)}% depuis l'achat`}
						subtitleColor={appreciation >= 0 ? 'positive' : 'negative'}
					/>
					<PropertyValueBox
						label="Équité"
						value={formatCurrency(equity)}
						subtitle={
							property.currentValue > 0
								? `${((equity / property.currentValue) * 100).toFixed(0)}% de la valeur`
								: '-'
						}
						subtitleColor="muted"
					/>
				</div>

				{/* Loan Progress */}
				{totalLoansRemaining > 0 && (
					<div className="flex flex-col gap-2">
						<div className="flex flex-row justify-between">
							<span className="text-xs text-muted-foreground">
								Crédit restant ({property._count.loans} prêt
								{property._count.loans > 1 ? 's' : ''})
							</span>
							<span className="text-xs tabular-nums">{formatCurrency(totalLoansRemaining)}</span>
						</div>
						<Progress value={100 - loanProgress} className="h-2" />
					</div>
				)}

				{/* Info Grid */}
				<div className="grid grid-cols-3 gap-2 sm:gap-4 border-t border-border/40 pt-2">
					<PropertyInfoItem icon={Home} label="Surface" value={`${property.surface} m²`} />
					<PropertyInfoItem icon={Building2} label="Pièces" value={property.rooms} />
					<PropertyInfoItem icon={Building2} label="Chambres" value={property.bedrooms} />
				</div>

				{/* Rent Info if rental */}
				{isRentalProperty && property.rentAmount && (
					<PropertyRentBox
						rentAmount={property.rentAmount}
						rentCharges={property.rentCharges}
						formatCurrency={formatCurrency}
					/>
				)}
			</div>
		</Card>
	);
}
