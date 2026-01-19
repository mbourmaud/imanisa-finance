import type { PropertyType, PropertyUsage } from '@/lib/prisma'

export function getPropertyTypeLabel(type: PropertyType): string {
	switch (type) {
		case 'HOUSE':
			return 'Maison'
		case 'APARTMENT':
			return 'Appartement'
		default:
			return type
	}
}

export function getPropertyUsageLabel(usage: PropertyUsage): string {
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
