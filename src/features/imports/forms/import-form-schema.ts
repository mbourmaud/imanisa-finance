import * as v from 'valibot';

/**
 * Schema Valibot pour le formulaire de sélection banque/compte
 * avant l'upload d'un fichier d'import.
 */
export const importFormSchema = v.object({
	bankId: v.pipe(
		v.string(),
		v.minLength(1, 'Veuillez sélectionner une banque'),
	),
	accountId: v.pipe(
		v.string(),
		v.minLength(1, 'Veuillez sélectionner un compte'),
	),
});

export type ImportFormValues = v.InferOutput<typeof importFormSchema>;
