'use client'

import { PropertiesEmptyState, PropertyCard, PropertyCardSkeleton } from '@/components'
import type { PropertyWithDetails } from '@/features/properties'

interface PropertiesGridProps {
	properties: PropertyWithDetails[]
	isLoading: boolean
	formatCurrency: (amount: number) => string
	onAddClick: () => void
}

export function PropertiesGrid({
	properties,
	isLoading,
	formatCurrency,
	onAddClick,
}: PropertiesGridProps) {
	if (isLoading) {
		return (
			<div className="grid grid-cols-2 gap-6">
				<PropertyCardSkeleton />
				<PropertyCardSkeleton />
			</div>
		)
	}

	if (properties.length === 0) {
		return <PropertiesEmptyState onAddClick={onAddClick} />
	}

	return (
		<div className="grid grid-cols-2 gap-6">
			{properties.map((property) => (
				<PropertyCard key={property.id} property={property} formatCurrency={formatCurrency} />
			))}
		</div>
	)
}
