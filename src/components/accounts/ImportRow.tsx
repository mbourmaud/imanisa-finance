'use client'

import { Button, Flex, Loader2, RefreshCw, RotateCcw, Trash2 } from '@/components'
import { formatRelativeTime } from '@/shared/utils'
import { ImportStatusIcon } from './ImportStatusIcon'

type ImportStatus = 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED'

interface ImportRowProps {
	id: string
	filename: string
	status: ImportStatus
	createdAt: string
	recordsCount: number | null
	onProcess: () => void
	onReprocess: () => void
	onDelete: () => void
	isProcessing?: boolean
	isReprocessing?: boolean
	isDeleting?: boolean
}

/**
 * Row displaying an import with actions
 */
export function ImportRow({
	id,
	filename,
	status,
	createdAt,
	recordsCount,
	onProcess,
	onReprocess,
	onDelete,
	isProcessing = false,
	isReprocessing = false,
	isDeleting = false,
}: ImportRowProps) {
	const statusBgClass =
		status === 'FAILED'
			? 'bg-destructive/5 border-destructive/20'
			: 'bg-muted/20 border-transparent'

	const iconBgClass =
		status === 'PROCESSED'
			? 'bg-emerald-500/10'
			: status === 'FAILED'
				? 'bg-destructive/10'
				: status === 'PROCESSING'
					? 'bg-primary/10'
					: 'bg-muted'

	return (
		<Flex
			direction="row"
			gap="sm"
			align="center"
			className={`p-3 text-sm rounded-lg border ${statusBgClass}`}
		>
			<div className={`flex items-center justify-center h-6 w-6 flex-shrink-0 rounded-md ${iconBgClass}`}>
				<ImportStatusIcon status={status} />
			</div>
			<Flex direction="col" gap="xs" className="flex-grow min-w-0">
				<span className="text-xs font-medium truncate">{filename}</span>
				<span className="text-[11px] text-muted-foreground">
					{formatRelativeTime(createdAt)}
					{recordsCount !== null && (
						<span className="text-emerald-500"> • {recordsCount} tx</span>
					)}
				</span>
			</Flex>
			<Flex direction="row" gap="xs" className="flex-shrink-0">
				{status === 'PENDING' && (
					<Button
						variant="outline"
						size="sm"
						onClick={onProcess}
						disabled={isProcessing}
						className="h-6 px-2 text-xs"
					>
						{isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Traiter'}
					</Button>
				)}
				{status === 'PROCESSED' && (
					<Button
						variant="ghost"
						size="icon"
						onClick={onReprocess}
						title="Retraiter"
						disabled={isReprocessing}
						className="h-6 w-6"
					>
						{isReprocessing ? (
							<Loader2 className="h-3 w-3 animate-spin" />
						) : (
							<RotateCcw className="h-3 w-3" />
						)}
					</Button>
				)}
				{status === 'FAILED' && (
					<Button
						variant="ghost"
						size="icon"
						onClick={onProcess}
						title="Réessayer"
						disabled={isProcessing}
						className="h-6 w-6"
					>
						{isProcessing ? (
							<Loader2 className="h-3 w-3 animate-spin" />
						) : (
							<RefreshCw className="h-3 w-3" />
						)}
					</Button>
				)}
				<Button
					variant="ghost"
					size="icon"
					onClick={onDelete}
					disabled={isDeleting}
					className="h-6 w-6 text-muted-foreground"
				>
					{isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
				</Button>
			</Flex>
		</Flex>
	)
}
