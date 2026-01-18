import * as v from 'valibot';

/**
 * Schema Valibot pour le formulaire de profil utilisateur.
 */
export const profileFormSchema = v.object({
	name: v.pipe(
		v.string(),
		v.minLength(1, 'Le nom est requis'),
		v.maxLength(100, 'Le nom ne peut pas dépasser 100 caractères'),
	),
	email: v.pipe(v.string(), v.email('Veuillez entrer un email valide')),
});

export type ProfileFormValues = v.InferOutput<typeof profileFormSchema>;
