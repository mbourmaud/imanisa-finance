interface PropertyValueBoxProps {
	label: string
	value: string
	subtitle?: string
	subtitleColor?: 'positive' | 'negative' | 'muted'
}

/**
 * Value display box with label and subtitle
 */
export function PropertyValueBox({
	label,
	value,
	subtitle,
	subtitleColor = 'muted',
}: PropertyValueBoxProps) {
	const subtitleColorClass = {
		positive: 'text-emerald-600 dark:text-emerald-400',
		negative: 'text-red-600 dark:text-red-400',
		muted: 'text-muted-foreground',
	}[subtitleColor]

	return (
		<div className="rounded-xl bg-muted/30 p-3">
			<span className="text-xs text-muted-foreground">{label}</span>
			<span className="mt-1 block text-xl font-semibold tabular-nums">{value}</span>
			{subtitle && (
				<span className={`mt-0.5 block text-xs font-medium ${subtitleColorClass}`}>
					{subtitle}
				</span>
			)}
		</div>
	)
}
