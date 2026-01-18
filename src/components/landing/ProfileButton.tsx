import { Button, ChevronRight, User } from '@/components'

interface ProfileButtonProps {
	name: string
	onClick: () => void
	animationDelay?: string
}

/**
 * Profile selection button for landing page
 */
export function ProfileButton({ name, onClick, animationDelay }: ProfileButtonProps) {
	return (
		<Button
			variant="ghost"
			onClick={onClick}
			fullWidth
			className={`flex items-center justify-start gap-5 rounded-3xl border border-border/40 bg-card/80 p-6 backdrop-blur-sm ${animationDelay ? `[animation-delay:${animationDelay}]` : ''}`}
		>
			<div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-[oklch(0.6_0.2_30/0.2)] shadow-[0_10px_15px_-3px_hsl(var(--primary)/0.1)]">
				<User className="h-8 w-8 text-primary" />
			</div>
			<div className="flex-1 text-left">
				<p className="text-lg font-semibold">{name}</p>
				<p className="mt-0.5 text-sm text-muted-foreground">
					Accéder à mon espace
				</p>
			</div>
			<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
				<ChevronRight className="h-5 w-5 text-primary" />
			</div>
		</Button>
	)
}
