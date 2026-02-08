'use client'

import {
	AlertCircle,
	Button,
	PropertiesEmptyState,
	PropertyCard,
	PropertyCardSkeleton,
	EmptyState,
	RefreshCw,
} from '@/components'
import type { PropertyWithDetails } from '@/features/properties'

interface PropertiesGridProps {
	properties: PropertyWithDetails[]
	isLoading: boolean
	isError?: boolean
	onRetry?: () => void
	formatCurrency: (amount: number) => string
	onAddClick: () => void
}

export function PropertiesGrid({
	properties,
	isLoading,
	isError,
	onRetry,
	formatCurrency,
	onAddClick,
}: PropertiesGridProps) {
	if (isLoading) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<PropertyCardSkeleton />
				<PropertyCardSkeleton />
			</div>
		)
	}

	if (isError) {
		return (
			<EmptyState
				icon={AlertCircle}
				title="Impossible de charger les biens"
				description="Une erreur est survenue lors du chargement de vos biens immobiliers. Veuillez réessayer."
				action={
					onRetry && (
						<Button variant="outline" onClick={onRetry} iconLeft={<RefreshCw className="h-4 w-4" />}>
							Réessayer
						</Button>
					)
				}
			/>
		)
	}

	if (properties.length === 0) {
		return <PropertiesEmptyState onAddClick={onAddClick} />
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
			{properties.map((property) => (
				<PropertyCard key={property.id} property={property} formatCurrency={formatCurrency} />
			))}
		</div>
	)
}
