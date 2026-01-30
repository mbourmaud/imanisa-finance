import * as v from 'valibot'

export const propertyFormSchema = v.object({
	name: v.pipe(
		v.string(),
		v.trim(),
		v.minLength(1, 'Le nom est requis'),
		v.maxLength(200, 'Le nom ne peut pas dépasser 200 caractères'),
	),
	type: v.pipe(
		v.string(),
		v.minLength(1, 'Le type est requis'),
		v.picklist(['APARTMENT', 'HOUSE'], 'Type invalide'),
	),
	usage: v.pipe(
		v.string(),
		v.minLength(1, "L'usage est requis"),
		v.picklist(['PRIMARY', 'SECONDARY', 'RENTAL'], 'Usage invalide'),
	),
	address: v.pipe(
		v.string(),
		v.trim(),
		v.minLength(1, "L'adresse est requise"),
	),
	address2: v.pipe(v.string(), v.trim()),
	city: v.pipe(
		v.string(),
		v.trim(),
		v.minLength(1, 'La ville est requise'),
	),
	postalCode: v.pipe(
		v.string(),
		v.trim(),
		v.minLength(1, 'Le code postal est requis'),
	),
	surface: v.pipe(
		v.string(),
		v.minLength(1, 'La surface est requise'),
	),
	rooms: v.string(),
	bedrooms: v.string(),
	purchasePrice: v.pipe(
		v.string(),
		v.minLength(1, "Le prix d'achat est requis"),
	),
	purchaseDate: v.pipe(
		v.string(),
		v.minLength(1, "La date d'achat est requise"),
	),
	notaryFees: v.pipe(
		v.string(),
		v.minLength(1, 'Les frais de notaire sont requis'),
	),
	agencyFees: v.string(),
	currentValue: v.pipe(
		v.string(),
		v.minLength(1, 'La valeur actuelle est requise'),
	),
	rentAmount: v.string(),
	rentCharges: v.string(),
	notes: v.pipe(v.string(), v.trim()),
})

export type PropertyFormValues = v.InferOutput<typeof propertyFormSchema>
