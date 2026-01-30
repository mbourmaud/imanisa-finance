import * as v from 'valibot'

export const accountFormSchema = v.object({
	name: v.pipe(
		v.string(),
		v.trim(),
		v.minLength(1, 'Le nom du compte est requis'),
		v.maxLength(100, 'Le nom ne peut pas dépasser 100 caractères'),
	),
	description: v.pipe(v.string(), v.trim()),
	exportUrl: v.pipe(v.string(), v.trim()),
	type: v.picklist(
		['CHECKING', 'SAVINGS', 'INVESTMENT', 'LOAN'],
		'Type de compte invalide',
	),
	memberIds: v.array(v.string()),
})

export type AccountFormValues = v.InferOutput<typeof accountFormSchema>
