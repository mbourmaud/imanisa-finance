/**
 * Single Property Document API Routes
 * GET /api/properties/:id/documents/:docId - Get signed download URL
 * DELETE /api/properties/:id/documents/:docId - Delete document
 */

import { type NextRequest, NextResponse } from 'next/server'
import { propertyDocumentRepository } from '@/server/repositories'
import {
	deletePropertyDocument,
	getPropertyDocumentSignedUrl,
} from '@/lib/supabase/storage'

interface RouteParams {
	params: Promise<{ id: string; docId: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
	try {
		const { id, docId } = await params

		const document = await propertyDocumentRepository.getById(docId)
		if (!document || document.propertyId !== id) {
			return NextResponse.json(
				{ error: 'Document introuvable' },
				{ status: 404 },
			)
		}

		const { url, error } = await getPropertyDocumentSignedUrl(
			document.storagePath,
			3600,
		)

		if (error || !url) {
			console.error('[API/documents] Signed URL failed:', error)
			return NextResponse.json(
				{ error: 'Impossible de générer le lien de téléchargement' },
				{ status: 500 },
			)
		}

		return NextResponse.json({ url })
	} catch (error) {
		console.error('[API/documents] GET failed:', error)
		return NextResponse.json(
			{ error: 'Impossible de récupérer le document' },
			{ status: 500 },
		)
	}
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
	try {
		const { id, docId } = await params

		const document = await propertyDocumentRepository.getById(docId)
		if (!document || document.propertyId !== id) {
			return NextResponse.json(
				{ error: 'Document introuvable' },
				{ status: 404 },
			)
		}

		const { error: storageError } = await deletePropertyDocument(
			document.storagePath,
		)
		if (storageError) {
			console.error('[API/documents] Storage delete failed:', storageError)
		}

		await propertyDocumentRepository.delete(docId)

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('[API/documents] DELETE failed:', error)
		return NextResponse.json(
			{ error: 'Impossible de supprimer le document' },
			{ status: 500 },
		)
	}
}
