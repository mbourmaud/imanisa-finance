/**
 * TanStack Query hooks for property documents
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { propertyKeys } from './use-properties-query'

/**
 * Upload a document for a property
 */
export function useUploadPropertyDocumentMutation() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			propertyId,
			file,
			name,
		}: {
			propertyId: string
			file: File
			name: string
		}) => {
			const formData = new FormData()
			formData.append('file', file)
			formData.append('name', name)

			const response = await fetch(
				`/api/properties/${propertyId}/documents`,
				{
					method: 'POST',
					body: formData,
				},
			)

			if (!response.ok) {
				const data = await response.json().catch(() => ({}))
				throw new Error(
					data.error || 'Impossible de charger le document',
				)
			}

			return response.json()
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: propertyKeys.detail(variables.propertyId),
			})
		},
	})
}

/**
 * Delete a document from a property
 */
export function useDeletePropertyDocumentMutation() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			propertyId,
			docId,
		}: {
			propertyId: string
			docId: string
		}) => {
			const response = await fetch(
				`/api/properties/${propertyId}/documents/${docId}`,
				{ method: 'DELETE' },
			)

			if (!response.ok) {
				const data = await response.json().catch(() => ({}))
				throw new Error(
					data.error || 'Impossible de supprimer le document',
				)
			}

			return response.json()
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: propertyKeys.detail(variables.propertyId),
			})
		},
	})
}

/**
 * Get a signed download URL for a document
 */
export async function getDocumentDownloadUrl(
	propertyId: string,
	docId: string,
): Promise<string> {
	const response = await fetch(
		`/api/properties/${propertyId}/documents/${docId}`,
	)

	if (!response.ok) {
		const data = await response.json().catch(() => ({}))
		throw new Error(
			data.error || 'Impossible de récupérer le lien de téléchargement',
		)
	}

	const { url } = await response.json()
	return url
}
