'use client'

import { Card, Home } from '@/components'
import type { PropertyUsage } from '@/features/properties'

interface PropertyInfoSectionProps {
	surface: number
	rooms: number | null
	bedrooms: number | null
	purchasePrice: number
	notaryFees: number
	agencyFees: number | null
	purchaseDate: string
	currentValue: number
	rentAmount: number | null
	rentCharges: number | null
	usage: PropertyUsage
	notes: string | null
}

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: 0,
	}).format(amount)
}

function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString('fr-FR', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	})
}

function DetailItem({
	label,
	value,
}: {
	label: string
	value: string | number | null | undefined
}) {
	if (value === null || value === undefined) return null
	return (
		<div className="flex flex-col">
			<p className="text-xs text-muted-foreground">{label}</p>
			<p className="font-medium">
				{typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
			</p>
		</div>
	)
}

function CurrencyItem({ label, value }: { label: string; value: number | null | undefined }) {
	if (value === null || value === undefined) return null
	return (
		<div className="flex flex-col">
			<p className="text-xs text-muted-foreground">{label}</p>
			<p className="font-medium tabular-nums">{formatCurrency(value)}</p>
		</div>
	)
}

export function PropertyInfoSection({
	surface,
	rooms,
	bedrooms,
	purchasePrice,
	notaryFees,
	agencyFees,
	purchaseDate,
	currentValue,
	rentAmount,
	rentCharges,
	usage,
	notes,
}: PropertyInfoSectionProps) {
	const isRental = usage === 'RENTAL'

	return (
		<Card padding="lg">
			<div className="flex flex-col gap-4">
				<div className="flex items-center gap-3">
					<Home className="h-4 w-4 text-muted-foreground" />
					<h3 className="text-base font-semibold tracking-tight">Informations</h3>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					<div className="flex flex-col gap-3">
						<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
							Caractéristiques
						</p>
						<div className="flex flex-col gap-3">
							<DetailItem label="Surface" value={`${surface} m²`} />
							<DetailItem label="Pièces" value={rooms} />
							<DetailItem label="Chambres" value={bedrooms} />
						</div>
					</div>
					<div className="flex flex-col gap-3">
						<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
							Achat
						</p>
						<div className="flex flex-col gap-3">
							<CurrencyItem label="Prix d'achat" value={purchasePrice} />
							<CurrencyItem label="Frais de notaire" value={notaryFees} />
							<CurrencyItem label="Frais d'agence" value={agencyFees} />
							<DetailItem label="Date d'achat" value={formatDate(purchaseDate)} />
						</div>
					</div>
					<div className="flex flex-col gap-3">
						<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
							{isRental ? 'Valeur & Revenus' : 'Valeur'}
						</p>
						<div className="flex flex-col gap-3">
							<CurrencyItem label="Valeur actuelle" value={currentValue} />
							{isRental && (
								<>
									<CurrencyItem label="Loyer mensuel" value={rentAmount} />
									<CurrencyItem label="Charges locatives" value={rentCharges} />
								</>
							)}
						</div>
					</div>
				</div>
				{notes && (
					<div className="mt-6 pt-6 border-t border-border/40">
						<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
							Notes
						</p>
						<p className="text-sm text-muted-foreground">{notes}</p>
					</div>
				)}
			</div>
		</Card>
	)
}
