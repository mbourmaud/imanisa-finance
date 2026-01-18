'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { Button, Loader2 } from '@/components';
import { TextField, useAppForm } from '@/lib/forms';
import { profileFormSchema } from '../forms/profile-form-schema';
import { useProfileQuery, useUpdateProfileMutation } from '../hooks/use-profile-query';

export function ProfileForm() {
	const { data: profile, isLoading: isLoadingProfile } = useProfileQuery();
	const updateMutation = useUpdateProfileMutation();

	const form = useAppForm({
		defaultValues: {
			name: '',
			email: '',
		},
		validators: {
			onChange: profileFormSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				await updateMutation.mutateAsync({
					name: value.name,
					email: value.email,
				});
				toast.success('Profil mis à jour');
			} catch (err) {
				toast.error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
			}
		},
	});

	// Update form values when profile data is loaded
	useEffect(() => {
		if (profile) {
			form.setFieldValue('name', profile.name || '');
			form.setFieldValue('email', profile.email);
		}
	}, [profile, form]);

	if (isLoadingProfile) {
		return (
			<div className="flex items-center justify-center py-8">
				<Loader2
					style={{
						height: '1.5rem',
						width: '1.5rem',
						animation: 'spin 1s linear infinite',
						color: 'hsl(var(--muted-foreground))',
					}}
				/>
			</div>
		);
	}

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<form.AppField name="name">
					{() => <TextField label="Nom" placeholder="Votre nom" />}
				</form.AppField>

				<form.AppField name="email">
					{() => <TextField label="Email" type="email" placeholder="votre@email.com" />}
				</form.AppField>
			</div>

			<div className="flex justify-end mt-4">
				<form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
					{([canSubmit, isSubmitting]) => (
						<Button type="submit" disabled={!canSubmit || updateMutation.isPending}>
							{isSubmitting || updateMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
						</Button>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}
