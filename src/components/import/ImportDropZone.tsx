import { Button, FileSpreadsheet, Loader2, Upload } from '@/components';

interface ImportDropZoneProps {
	canUpload: boolean;
	isUploading: boolean;
	isDragActive: boolean;
	onDragEnter: (e: React.DragEvent) => void;
	onDragLeave: (e: React.DragEvent) => void;
	onDragOver: (e: React.DragEvent) => void;
	onDrop: (e: React.DragEvent) => void;
	onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * File drop zone for CSV/Excel import
 */
export function ImportDropZone({
	canUpload,
	isUploading,
	isDragActive,
	onDragEnter,
	onDragLeave,
	onDragOver,
	onDrop,
	onFileSelect,
}: ImportDropZoneProps) {
	const borderColor = !canUpload
		? 'border-border/40'
		: isDragActive
			? 'border-primary'
			: 'border-border/60';

	const bgColor = !canUpload ? 'bg-muted/10' : isDragActive ? 'bg-primary/5' : 'bg-white/50';

	return (
		<div
			role="presentation"
			onDragEnter={onDragEnter}
			onDragLeave={onDragLeave}
			onDragOver={onDragOver}
			onDrop={onDrop}
			className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all ${borderColor} ${bgColor} ${!canUpload ? 'opacity-60' : ''}`}
		>
			<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
				{isUploading ? (
					<Loader2 className="h-7 w-7 animate-spin" />
				) : (
					<FileSpreadsheet className="h-7 w-7" />
				)}
			</div>
			<h3 className="mt-2 text-base font-semibold tracking-tight">
				{isUploading ? 'Upload en cours...' : 'Import CSV / Excel'}
			</h3>
			<p className="mt-1 max-w-xs text-center text-sm text-muted-foreground">
				Glissez votre fichier ici ou cliquez pour sélectionner
			</p>
			<label htmlFor="import-file-input" className="mt-4">
				<input
					id="import-file-input"
					type="file"
					accept=".csv,.xlsx,.xls"
					onChange={onFileSelect}
					className="hidden"
					disabled={!canUpload}
				/>
				<Button disabled={!canUpload} asChild iconLeft={<Upload className="h-4 w-4" />}>
					<span>Sélectionner un fichier</span>
				</Button>
			</label>
			<p className="mt-2 text-xs text-muted-foreground">.csv, .xlsx · Max 10 MB</p>
		</div>
	);
}
