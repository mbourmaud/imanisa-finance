import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export function useGoogleLoginMutation() {
	const supabase = createClient()

	return useMutation({
		mutationFn: async () => {
			const { error } = await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					redirectTo: `${window.location.origin}/auth/callback`,
				},
			})
			if (error) {
				throw new Error(error.message)
			}
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: 'Erreur lors de la connexion. Veuillez réessayer.'
			)
		},
	})
}
