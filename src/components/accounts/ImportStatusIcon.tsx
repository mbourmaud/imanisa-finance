'use client'

import { AlertCircle, CheckCircle2, Clock, Loader2 } from '@/components'

type ImportStatus = 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED'

interface ImportStatusIconProps {
	status: ImportStatus
}

/**
 * Status icon for import items
 */
export function ImportStatusIcon({ status }: ImportStatusIconProps) {
	switch (status) {
		case 'PROCESSED':
			return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
		case 'PROCESSING':
			return <Loader2 className="h-4 w-4 text-primary animate-spin" />
		case 'FAILED':
			return <AlertCircle className="h-4 w-4 text-destructive" />
		default:
			return <Clock className="h-4 w-4 text-muted-foreground" />
	}
}
