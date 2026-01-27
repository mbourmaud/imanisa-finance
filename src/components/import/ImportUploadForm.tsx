import type { ReactNode } from 'react'
import { Card, Flex, ImportDropZone, Label } from '@/components'
import { SelectField } from '@/lib/forms'

interface SelectOption {
	value: string
	label: string
}

interface ImportUploadFormProps {
	// Bank field
	bankFieldSlot: ReactNode
	bankOptions: SelectOption[]
	noBanksHelpText?: string
	// Account field
	accountFieldSlot: ReactNode
	accountOptions: SelectOption[]
	accountPlaceholder: string
	accountDisabled: boolean
	noAccountsHelpText?: string
	// Drop zone
	canUpload: boolean
	isUploading: boolean
	isDragActive: boolean
	onDragEnter: (e: React.DragEvent) => void
	onDragLeave: (e: React.DragEvent) => void
	onDragOver: (e: React.DragEvent) => void
	onDrop: (e: React.DragEvent) => void
	onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function ImportUploadForm({
	bankFieldSlot,
	bankOptions,
	noBanksHelpText,
	accountFieldSlot,
	accountOptions,
	accountPlaceholder,
	accountDisabled,
	noAccountsHelpText,
	canUpload,
	isUploading,
	isDragActive,
	onDragEnter,
	onDragLeave,
	onDragOver,
	onDrop,
	onFileSelect,
}: ImportUploadFormProps) {
	return (
		<Card padding="lg">
			<Flex direction="col" gap="md">
				{bankFieldSlot}
				{accountFieldSlot}

				<Flex direction="col" gap="xs">
					<Label htmlFor="import-file-input">3. Fichier</Label>
					<ImportDropZone
						canUpload={canUpload}
						isUploading={isUploading}
						isDragActive={isDragActive}
						onDragEnter={onDragEnter}
						onDragLeave={onDragLeave}
						onDragOver={onDragOver}
						onDrop={onDrop}
						onFileSelect={onFileSelect}
					/>
				</Flex>
			</Flex>
		</Card>
	)
}
