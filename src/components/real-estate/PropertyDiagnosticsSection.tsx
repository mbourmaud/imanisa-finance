'use client'

import {
	AlertTriangle,
	Bug,
	Card,
	CheckCircle2,
	Droplets,
	FileText,
	Flame,
	Info,
	type LucideIcon,
	Ruler,
	Shield,
	XCircle,
	Zap,
} from '@/components'
import type { DiagnosticStatus, DiagnosticType, PropertyDiagnosticData } from '@/features/properties'

const DIAGNOSTIC_CONFIG: Record<
	DiagnosticType,
	{ label: string; icon: LucideIcon }
> = {
	DPE: { label: 'DPE', icon: Flame },
	AMIANTE: { label: 'Amiante', icon: Shield },
	TERMITES: { label: 'Termites', icon: Bug },
	ELECTRICITE: { label: 'Électricité', icon: Zap },
	GAZ: { label: 'Gaz', icon: Flame },
	PLOMB: { label: 'Plomb', icon: Droplets },
	ERP: { label: 'ERP', icon: AlertTriangle },
	CARREZ: { label: 'Carrez', icon: Ruler },
}

const STATUS_CONFIG: Record<
	DiagnosticStatus,
	{ label: string; icon: LucideIcon; color: string; bg: string }
> = {
	OK: {
		label: 'Conforme',
		icon: CheckCircle2,
		color: 'text-emerald-600',
		bg: 'bg-emerald-500/10',
	},
	WARNING: {
		label: 'Attention',
		icon: AlertTriangle,
		color: 'text-orange-500',
		bg: 'bg-orange-500/10',
	},
	CRITICAL: {
		label: 'Non conforme',
		icon: XCircle,
		color: 'text-red-600',
		bg: 'bg-red-500/10',
	},
	INFO: {
		label: 'Information',
		icon: Info,
		color: 'text-blue-600',
		bg: 'bg-blue-500/10',
	},
}

function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString('fr-FR', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	})
}

function isExpired(expiresAt: string): boolean {
	return new Date(expiresAt) < new Date()
}

interface PropertyDiagnosticsSectionProps {
	diagnostics: PropertyDiagnosticData[]
}

export function PropertyDiagnosticsSection({
	diagnostics,
}: PropertyDiagnosticsSectionProps) {
	if (diagnostics.length === 0) return null

	return (
		<Card padding="lg">
			<h3 className="text-base font-semibold tracking-tight flex items-center gap-2">
				<FileText className="h-4 w-4 text-muted-foreground" />
				Diagnostics
			</h3>
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
				{diagnostics.map((diag) => {
					const typeConfig = DIAGNOSTIC_CONFIG[diag.type]
					const statusConfig = STATUS_CONFIG[diag.status]
					const TypeIcon = typeConfig.icon
					const StatusIcon = statusConfig.icon
					const expired = diag.expiresAt ? isExpired(diag.expiresAt) : false

					return (
						<div
							key={diag.id}
							className="flex flex-col gap-2 rounded-xl border border-border/60 p-3"
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div
										className={`flex h-8 w-8 items-center justify-center rounded-lg ${statusConfig.bg}`}
									>
										<TypeIcon className={`h-4 w-4 ${statusConfig.color}`} />
									</div>
									<span className="text-sm font-medium">{typeConfig.label}</span>
								</div>
							</div>
							<div className="flex items-center gap-1.5">
								<StatusIcon className={`h-3.5 w-3.5 shrink-0 ${statusConfig.color}`} />
								<span className={`text-xs font-medium ${statusConfig.color}`}>
									{diag.value ?? statusConfig.label}
								</span>
							</div>
							{diag.details && (
								<p className="text-xs text-muted-foreground line-clamp-2">
									{diag.details}
								</p>
							)}
							{diag.expiresAt && (
								<p className={`text-xs ${expired ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
									{expired ? 'Expiré le' : 'Expire le'} {formatDate(diag.expiresAt)}
								</p>
							)}
						</div>
					)
				})}
			</div>
		</Card>
	)
}
