'use client'

import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import { Button, Loader2 } from '@/components'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { profileFormSchema } from '../forms/profile-form-schema'
import { useProfileQuery, useUpdateProfileMutation } from '../hooks/use-profile-query'

export function ProfileForm() {
	const { data: profile, isLoading: isLoadingProfile } = useProfileQuery()
	const updateMutation = useUpdateProfileMutation()

	const form = useForm({
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
				})
				toast.success('Profil mis à jour')
			} catch (err) {
				toast.error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour')
			}
		},
	})

	// Update form values when profile data is loaded
	useEffect(() => {
		if (profile) {
			form.setFieldValue('name', profile.name || '')
			form.setFieldValue('email', profile.email)
		}
	}, [profile, form])

	if (isLoadingProfile) {
		return (
			<div className="flex items-center justify-center py-8">
				<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
			</div>
		)
	}

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault()
				form.handleSubmit()
			}}
		>
			<FieldGroup>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<form.Field
						name="name"
						children={(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor="profile-name">Nom</FieldLabel>
									<Input
										id="profile-name"
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
										placeholder="Votre nom"
									/>
									{isInvalid && (
										<FieldError errors={field.state.meta.errors} />
									)}
								</Field>
							)
						}}
					/>

					<form.Field
						name="email"
						children={(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor="profile-email">Email</FieldLabel>
									<Input
										id="profile-email"
										name={field.name}
										type="email"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
										placeholder="votre@email.com"
									/>
									{isInvalid && (
										<FieldError errors={field.state.meta.errors} />
									)}
								</Field>
							)
						}}
					/>
				</div>
			</FieldGroup>

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
	)
}
