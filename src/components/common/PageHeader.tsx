interface PageHeaderProps {
	title: string
	description?: string
	actions?: React.ReactNode
}

/**
 * Reusable page header with title and optional actions.
 * Used at the top of every dashboard page for consistent layout.
 */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
	return (
		<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex flex-col gap-1">
				<h1 className="text-3xl font-bold tracking-tight">{title}</h1>
				{description && (
					<p className="text-sm text-muted-foreground">{description}</p>
				)}
			</div>
			{actions && (
				<div className="flex items-center gap-2">{actions}</div>
			)}
		</div>
	)
}
