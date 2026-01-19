import { GlassCard } from '@/components'

interface ErrorBannerProps {
	message: string
}

export function ErrorBanner({ message }: ErrorBannerProps) {
	return (
		<GlassCard padding="md" className="border-destructive/50 bg-destructive/5">
			<span className="text-sm text-destructive">{message}</span>
		</GlassCard>
	)
}
