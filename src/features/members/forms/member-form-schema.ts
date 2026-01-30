import * as v from 'valibot'

export const memberFormSchema = v.object({
	name: v.pipe(
		v.string(),
		v.trim(),
		v.minLength(1, 'Le nom est requis'),
		v.maxLength(100, 'Le nom ne peut pas dépasser 100 caractères'),
	),
	color: v.pipe(
		v.string(),
		v.minLength(1, 'La couleur est requise'),
	),
})

export type MemberFormValues = v.InferOutput<typeof memberFormSchema>
