import {
	AlertCircle,
	Button,
	CheckCircle2,
	Clock,
	FileSpreadsheet,
	Loader2,
	RefreshCw,
	RotateCcw,
	Trash2,
} from '@/components';

type ImportStatus = 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';

interface ImportAccount {
	id: string;
	name: string;
}

export interface ImportData {
	id: string;
	filename: string;
	bankKey: string;
	fileSize: number;
	createdAt: string;
	status: ImportStatus;
	recordsCount: number | null;
	errorMessage: string | null;
	account?: ImportAccount | null;
}

interface ImportRowProps {
	data: ImportData;
	bankName: string;
	onProcess: (importId: string, accountId?: string) => void;
	onReprocess: (importId: string, accountId?: string) => void;
	onDelete: () => void;
}

function getStatusIcon(status: ImportStatus) {
	switch (status) {
		case 'PROCESSED':
			return <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
		case 'PROCESSING':
			return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
		case 'FAILED':
			return <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
		default:
			return <Clock className="h-4 w-4 text-muted-foreground" />;
	}
}

function getStatusLabel(status: ImportStatus) {
	switch (status) {
		case 'PROCESSED':
			return 'Traité';
		case 'PROCESSING':
			return 'En cours...';
		case 'FAILED':
			return 'Erreur';
		default:
			return 'En attente';
	}
}

function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
	const date = new Date(dateStr);
	return date.toLocaleDateString('fr-FR', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

function getStatusBadgeClasses(status: ImportStatus) {
	switch (status) {
		case 'PROCESSED':
			return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
		case 'PROCESSING':
			return 'bg-primary/10 text-primary';
		case 'FAILED':
			return 'bg-red-500/10 text-red-600 dark:text-red-400';
		default:
			return 'bg-muted text-muted-foreground';
	}
}

/**
 * Single row in import history list
 */
export function ImportRow({ data, bankName, onProcess, onReprocess, onDelete }: ImportRowProps) {
	const isFailed = data.status === 'FAILED';

	return (
		<div
			className={`flex flex-row justify-between items-center rounded-xl p-4 transition-colors ${
				isFailed ? 'border border-red-500/20 bg-red-500/5' : 'bg-white/50'
			}`}
		>
			<div className="flex flex-row gap-4 items-center">
				<div
					className={`flex h-10 w-10 items-center justify-center rounded-lg ${
						isFailed ? 'bg-red-500/10' : 'bg-background'
					}`}
				>
					<FileSpreadsheet
						className={`h-5 w-5 ${
							isFailed ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'
						}`}
					/>
				</div>
				<div className="flex flex-col">
					<div className="flex flex-row gap-4 items-center">
						<span className="font-medium">{data.filename}</span>
						<div
							className={`flex flex-row gap-1 items-center rounded-full px-2 py-1 text-xs ${getStatusBadgeClasses(data.status)}`}
						>
							{getStatusIcon(data.status)}
							<span>{getStatusLabel(data.status)}</span>
						</div>
					</div>
					<p className="text-xs text-muted-foreground">
						{bankName}
						{data.account && ` → ${data.account.name}`} · {formatFileSize(data.fileSize)} ·{' '}
						{formatDate(data.createdAt)}
						{data.recordsCount !== null && (
							<span className="text-emerald-600 dark:text-emerald-400">
								{' '}
								· {data.recordsCount} transactions
							</span>
						)}
						{data.errorMessage && (
							<span className="text-red-600 dark:text-red-400"> · {data.errorMessage}</span>
						)}
					</p>
				</div>
			</div>
			<div className="flex flex-row gap-4 items-center">
				{data.status === 'PENDING' && (
					<Button
						variant="outline"
						size="sm"
						onClick={() => onProcess(data.id, data.account?.id)}
						iconLeft={<RefreshCw className="h-4 w-4" />}
					>
						Traiter
					</Button>
				)}
				{data.status === 'PROCESSED' && (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => onReprocess(data.id, data.account?.id)}
						iconLeft={<RotateCcw className="h-4 w-4" />}
					>
						Retraiter
					</Button>
				)}
				{data.status === 'FAILED' && (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => onProcess(data.id, data.account?.id)}
						iconLeft={<RefreshCw className="h-4 w-4" />}
					>
						Réessayer
					</Button>
				)}
				<Button
					variant="ghost"
					size="icon"
					onClick={onDelete}
					className="h-8 w-8 text-muted-foreground"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
