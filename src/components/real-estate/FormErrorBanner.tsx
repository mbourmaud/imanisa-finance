interface FormErrorBannerProps {
	message: string
}

/**
 * Error banner for form validation errors
 */
export function FormErrorBanner({ message }: FormErrorBannerProps) {
	return (
		<div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3">
			<span className="text-sm text-destructive">{message}</span>
		</div>
	)
}
