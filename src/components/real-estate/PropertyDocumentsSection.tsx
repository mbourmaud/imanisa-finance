'use client'

import { useCallback, useRef, useState } from 'react'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	Button,
	Card,
	Download,
	FileText,
	Image,
	Loader2,
	Plus,
	Trash2,
	Upload,
} from '@/components'
import {
	getDocumentDownloadUrl,
	useDeletePropertyDocumentMutation,
	useUploadPropertyDocumentMutation,
	type PropertyDocument,
} from '@/features/properties'
import { toast } from 'sonner'

const ACCEPTED_TYPES = [
	'application/pdf',
	'image/png',
	'image/jpeg',
	'image/jpg',
	'image/webp',
]
const ACCEPTED_EXTENSIONS = '.pdf,.png,.jpg,.jpeg,.webp'
const MAX_SIZE = 20 * 1024 * 1024 // 20 MB

function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} o`
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`
	return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString('fr-FR', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	})
}

function getDocumentIcon(mimeType: string) {
	if (mimeType.startsWith('image/')) return Image
	return FileText
}

function getNameFromFilename(filename: string): string {
	return filename.replace(/\.[^.]+$/, '')
}

interface UploadingFile {
	file: File
	name: string
	progress: 'pending' | 'uploading' | 'done' | 'error'
	error?: string
}

interface PropertyDocumentsSectionProps {
	propertyId: string
	documents: PropertyDocument[]
}

export function PropertyDocumentsSection({
	propertyId,
	documents,
}: PropertyDocumentsSectionProps) {
	const [deletingDocId, setDeletingDocId] = useState<string | null>(null)
	const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null)
	const [isDragOver, setIsDragOver] = useState(false)
	const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
	const fileInputRef = useRef<HTMLInputElement>(null)
	const deleteMutation = useDeletePropertyDocumentMutation()
	const uploadMutation = useUploadPropertyDocumentMutation()

	const isUploading = uploadingFiles.some(
		(f) => f.progress === 'pending' || f.progress === 'uploading',
	)

	const validateAndFilterFiles = useCallback((files: FileList | File[]): File[] => {
		const valid: File[] = []
		const errors: string[] = []

		for (const file of Array.from(files)) {
			if (!ACCEPTED_TYPES.includes(file.type)) {
				errors.push(`${file.name} : format non supporté`)
				continue
			}
			if (file.size > MAX_SIZE) {
				errors.push(
					`${file.name} : trop volumineux (${formatFileSize(file.size)}, max 20 Mo)`,
				)
				continue
			}
			valid.push(file)
		}

		if (errors.length > 0) {
			toast.error(errors.join('\n'))
		}

		return valid
	}, [])

	const uploadFiles = useCallback(
		async (files: File[]) => {
			if (files.length === 0) return

			const entries: UploadingFile[] = files.map((file) => ({
				file,
				name: getNameFromFilename(file.name),
				progress: 'pending' as const,
			}))

			setUploadingFiles((prev) => [...prev, ...entries])

			let successCount = 0

			for (let i = 0; i < entries.length; i++) {
				const entry = entries[i]

				setUploadingFiles((prev) =>
					prev.map((f) =>
						f === entry ? { ...f, progress: 'uploading' } : f,
					),
				)

				try {
					await uploadMutation.mutateAsync({
						propertyId,
						file: entry.file,
						name: entry.name,
					})
					successCount++

					setUploadingFiles((prev) =>
						prev.map((f) =>
							f === entry ? { ...f, progress: 'done' } : f,
						),
					)
				} catch (error) {
					const message =
						error instanceof Error
							? error.message
							: 'Erreur inconnue'

					setUploadingFiles((prev) =>
						prev.map((f) =>
							f === entry
								? { ...f, progress: 'error', error: message }
								: f,
						),
					)
				}
			}

			if (successCount > 0) {
				const label =
					successCount === 1
						? 'Document ajouté'
						: `${successCount} documents ajoutés`
				toast.success(label)
			}

			// Clear completed uploads after a short delay
			setTimeout(() => {
				setUploadingFiles((prev) =>
					prev.filter((f) => f.progress === 'error'),
				)
			}, 2000)
		},
		[propertyId, uploadMutation],
	)

	const handleFiles = useCallback(
		(files: FileList | File[]) => {
			const valid = validateAndFilterFiles(files)
			uploadFiles(valid)
		},
		[validateAndFilterFiles, uploadFiles],
	)

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
		setIsDragOver(true)
	}, [])

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
		setIsDragOver(false)
	}, [])

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault()
			e.stopPropagation()
			setIsDragOver(false)

			if (e.dataTransfer.files.length > 0) {
				handleFiles(e.dataTransfer.files)
			}
		},
		[handleFiles],
	)

	const handleFileInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (e.target.files && e.target.files.length > 0) {
				handleFiles(e.target.files)
				// Reset input so same files can be re-selected
				e.target.value = ''
			}
		},
		[handleFiles],
	)

	const handleDownload = async (doc: PropertyDocument) => {
		setDownloadingDocId(doc.id)
		try {
			const url = await getDocumentDownloadUrl(propertyId, doc.id)
			window.open(url, '_blank')
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: 'Impossible de télécharger le document',
			)
		} finally {
			setDownloadingDocId(null)
		}
	}

	const handleDelete = async () => {
		if (!deletingDocId) return
		try {
			await deleteMutation.mutateAsync({
				propertyId,
				docId: deletingDocId,
			})
			toast.success('Document supprimé')
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: 'Impossible de supprimer le document',
			)
		} finally {
			setDeletingDocId(null)
		}
	}

	return (
		<>
			<Card
				padding="lg"
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				className={
					isDragOver
						? 'ring-2 ring-primary ring-offset-2 transition-shadow'
						: 'transition-shadow'
				}
			>
				<div className="flex items-center justify-between">
					<h3 className="text-base font-semibold tracking-tight flex items-center gap-2">
						<FileText className="h-4 w-4 text-muted-foreground" />
						Documents
					</h3>
					<Button
						variant="outline"
						size="sm"
						onClick={() => fileInputRef.current?.click()}
						disabled={isUploading}
					>
						<Plus className="h-4 w-4" />
						Ajouter
					</Button>
					<input
						ref={fileInputRef}
						type="file"
						accept={ACCEPTED_EXTENSIONS}
						multiple
						className="hidden"
						onChange={handleFileInputChange}
					/>
				</div>

				{/* Upload progress */}
				{uploadingFiles.length > 0 && (
					<div className="space-y-1.5">
						{uploadingFiles.map((uf, idx) => (
							<div
								key={`${uf.name}-${idx}`}
								className="flex items-center gap-3 rounded-lg border border-dashed border-border/60 p-2.5"
							>
								{uf.progress === 'uploading' || uf.progress === 'pending' ? (
									<Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
								) : uf.progress === 'error' ? (
									<span className="text-destructive text-xs shrink-0">✕</span>
								) : (
									<span className="text-emerald-600 text-xs shrink-0">✓</span>
								)}
								<span className="text-sm text-muted-foreground truncate flex-1">
									{uf.file.name}
								</span>
								{uf.progress === 'error' && (
									<span className="text-xs text-destructive shrink-0">
										{uf.error}
									</span>
								)}
							</div>
						))}
					</div>
				)}

				{/* Drop zone when empty */}
				{documents.length === 0 && uploadingFiles.length === 0 && (
					<button
						type="button"
						onClick={() => fileInputRef.current?.click()}
						className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 py-8 text-center hover:border-primary/40 hover:bg-muted/30 transition-colors cursor-pointer w-full"
					>
						<Upload className="h-8 w-8 text-muted-foreground/60" />
						<p className="text-sm text-muted-foreground">
							Glissez vos fichiers ici ou cliquez pour parcourir
						</p>
						<p className="text-xs text-muted-foreground/60">
							PDF, PNG, JPG, WEBP — 20 Mo max par fichier
						</p>
					</button>
				)}

				{/* Document grid */}
				{documents.length > 0 && (
					<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
						{documents.map((doc) => {
							const DocIcon = getDocumentIcon(doc.mimeType)
							const isDownloading = downloadingDocId === doc.id
							return (
								<div
									key={doc.id}
									className="group relative flex flex-col items-center gap-1.5 rounded-lg border border-border/40 p-3 hover:border-primary/40 hover:bg-muted/40 transition-colors cursor-pointer"
									onClick={() => !isDownloading && handleDownload(doc)}
									onKeyDown={(e) => {
										if (e.key === 'Enter' && !isDownloading) handleDownload(doc)
									}}
									tabIndex={0}
									role="button"
									aria-label={`Télécharger ${doc.name}`}
								>
									<Button
										variant="ghost"
										size="icon"
										className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
										onClick={(e) => {
											e.stopPropagation()
											setDeletingDocId(doc.id)
										}}
										disabled={deleteMutation.isPending}
										aria-label="Supprimer"
									>
										<Trash2 className="h-3 w-3 text-destructive" />
									</Button>
									{isDownloading ? (
										<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
									) : (
										<DocIcon className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
									)}
									<span className="text-xs text-center leading-tight line-clamp-2 w-full group-hover:text-primary transition-colors">
										{doc.name}
									</span>
								</div>
							)
						})}

						{/* Add button card */}
						<button
							type="button"
							onClick={() => fileInputRef.current?.click()}
							className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/40 p-3 hover:border-primary/40 hover:bg-muted/30 transition-colors cursor-pointer"
						>
							<Plus className="h-8 w-8 text-muted-foreground/30" />
							<span className="text-xs text-muted-foreground/40">
								Ajouter
							</span>
						</button>
					</div>
				)}
			</Card>

			<AlertDialog
				open={!!deletingDocId}
				onOpenChange={(open) => {
					if (!open) setDeletingDocId(null)
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Supprimer le document
						</AlertDialogTitle>
						<AlertDialogDescription>
							Cette action est irréversible. Le document sera
							définitivement supprimé.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Annuler</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									Suppression...
								</>
							) : (
								'Supprimer'
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
