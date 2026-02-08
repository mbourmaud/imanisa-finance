/**
 * Property Documents API Routes
 * POST /api/properties/:id/documents - Upload a document
 */

import { type NextRequest, NextResponse } from 'next/server'
import { propertyDocumentRepository, propertyRepository } from '@/server/repositories'
import {
	uploadPropertyDocument,
	validateDocumentFile,
} from '@/lib/supabase/storage'

interface RouteParams {
	params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params

		const property = await propertyRepository.getById(id)
		if (!property) {
			return NextResponse.json(
				{ error: 'Bien immobilier introuvable' },
				{ status: 404 },
			)
		}

		const formData = await request.formData()
		const file = formData.get('file')
		const name = formData.get('name')

		if (!file || !(file instanceof File)) {
			return NextResponse.json(
				{ error: 'Aucun fichier fourni' },
				{ status: 400 },
			)
		}

		if (!name || typeof name !== 'string' || !name.trim()) {
			return NextResponse.json(
				{ error: 'Le nom du document est requis' },
				{ status: 400 },
			)
		}

		const validation = validateDocumentFile(file.size, file.type)
		if (!validation.valid) {
			return NextResponse.json(
				{ error: validation.error },
				{ status: 400 },
			)
		}

		const { path, error: uploadError } = await uploadPropertyDocument(
			id,
			file,
			file.name,
		)

		if (uploadError || !path) {
			console.error('[API/documents] Upload failed:', uploadError)
			return NextResponse.json(
				{ error: 'Impossible de charger le fichier' },
				{ status: 500 },
			)
		}

		const document = await propertyDocumentRepository.create({
			propertyId: id,
			name: name.trim(),
			storagePath: path,
			filename: file.name,
			fileSize: file.size,
			mimeType: file.type,
		})

		return NextResponse.json(document, { status: 201 })
	} catch (error) {
		console.error('[API/documents] Create failed:', error)
		return NextResponse.json(
			{ error: 'Impossible de créer le document' },
			{ status: 500 },
		)
	}
}
