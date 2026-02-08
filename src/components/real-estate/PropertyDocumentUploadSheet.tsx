'use client'

import { useRef, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import * as v from 'valibot'
import { toast } from 'sonner'
import {
	Button,
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
	Input,
	Loader2,
	Sheet,
	SheetBody,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	Upload,
} from '@/components'
import { useUploadPropertyDocumentMutation } from '@/features/properties'

const ACCEPTED_TYPES = '.pdf,.png,.jpg,.jpeg,.webp'
const MAX_SIZE = 20 * 1024 * 1024 // 20 MB

const documentNameSchema = v.pipe(
	v.string(),
	v.minLength(1, 'Le nom du document est requis'),
	v.maxLength(200, 'Le nom ne peut pas dépasser 200 caractères'),
)

function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} o`
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`
	return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

interface PropertyDocumentUploadSheetProps {
	propertyId: string
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function PropertyDocumentUploadSheet({
	propertyId,
	open,
	onOpenChange,
}: PropertyDocumentUploadSheetProps) {
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [fileError, setFileError] = useState<string | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const uploadMutation = useUploadPropertyDocumentMutation()

	const form = useForm({
		defaultValues: {
			name: '',
		},
		validators: {
			onSubmit: v.object({ name: documentNameSchema }),
		},
		onSubmit: async ({ value }) => {
			if (!selectedFile) {
				setFileError('Veuillez sélectionner un fichier')
				return
			}

			await uploadMutation.mutateAsync({
				propertyId,
				file: selectedFile,
				name: value.name,
			})

			toast.success('Document ajouté')
			handleClose()
		},
	})

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFileError(null)
		const file = e.target.files?.[0]

		if (!file) {
			setSelectedFile(null)
			return
		}

		if (file.size > MAX_SIZE) {
			setFileError(
				`Fichier trop volumineux (${formatFileSize(file.size)}). Maximum : 20 Mo.`,
			)
			setSelectedFile(null)
			return
		}

		setSelectedFile(file)

		// Pre-fill name from filename (without extension)
		const nameWithoutExt = file.name.replace(/\.[^.]+$/, '')
		if (!form.getFieldValue('name')) {
			form.setFieldValue('name', nameWithoutExt)
		}
	}

	const handleClose = () => {
		setSelectedFile(null)
		setFileError(null)
		form.reset()
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
		onOpenChange(false)
	}

	return (
		<Sheet open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Ajouter un document</SheetTitle>
				</SheetHeader>

				<form
					id="document-upload-form"
					onSubmit={(e) => {
						e.preventDefault()
						form.handleSubmit()
					}}
				>
					<SheetBody>
						<FieldGroup>
							<Field data-invalid={!!fileError}>
								<FieldLabel htmlFor="document-file">
									Fichier
								</FieldLabel>
								<div className="flex flex-col gap-2">
									<Input
										ref={fileInputRef}
										id="document-file"
										type="file"
										accept={ACCEPTED_TYPES}
										onChange={handleFileChange}
										aria-invalid={!!fileError}
									/>
									{selectedFile && (
										<p className="text-xs text-muted-foreground">
											{selectedFile.name} (
											{formatFileSize(selectedFile.size)})
										</p>
									)}
									{fileError && (
										<p className="text-sm text-destructive">
											{fileError}
										</p>
									)}
								</div>
							</Field>

							<form.Field
								name="name"
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched &&
										!field.state.meta.isValid
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor="document-name">
												Nom du document
											</FieldLabel>
											<Input
												id="document-name"
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) =>
													field.handleChange(
														e.target.value,
													)
												}
												aria-invalid={isInvalid}
												placeholder="Acte de vente, bail, diagnostic..."
											/>
											{isInvalid && (
												<FieldError
													errors={
														field.state.meta.errors
													}
												/>
											)}
										</Field>
									)
								}}
							/>
						</FieldGroup>
					</SheetBody>
				</form>

				<SheetFooter>
					<Button
						variant="outline"
						onClick={handleClose}
						type="button"
					>
						Annuler
					</Button>
					<Button
						type="submit"
						form="document-upload-form"
						disabled={uploadMutation.isPending || !selectedFile}
					>
						{uploadMutation.isPending ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Chargement...
							</>
						) : (
							<>
								<Upload className="h-4 w-4" />
								Charger le document
							</>
						)}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	)
}
