import type { ReactNode } from 'react';
import { Card, ImportDropZone, Label } from '@/components';
import { SelectField } from '@/lib/forms';

interface SelectOption {
	value: string;
	label: string;
}

interface ImportUploadFormProps {
	// Bank field
	bankFieldSlot: ReactNode;
	bankOptions: SelectOption[];
	noBanksHelpText?: string;
	// Account field
	accountFieldSlot: ReactNode;
	accountOptions: SelectOption[];
	accountPlaceholder: string;
	accountDisabled: boolean;
	noAccountsHelpText?: string;
	// Drop zone
	canUpload: boolean;
	isUploading: boolean;
	isDragActive: boolean;
	onDragEnter: (e: React.DragEvent) => void;
	onDragLeave: (e: React.DragEvent) => void;
	onDragOver: (e: React.DragEvent) => void;
	onDrop: (e: React.DragEvent) => void;
	onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
			<div className="flex flex-col gap-4">
				{bankFieldSlot}
				{accountFieldSlot}

				<div className="flex flex-col gap-1">
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
				</div>
			</div>
		</Card>
	);
}
