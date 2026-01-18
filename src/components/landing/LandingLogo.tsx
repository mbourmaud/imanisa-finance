import { Wallet } from '@/components'

/**
 * Landing page logo with animated entrance
 */
export function LandingLogo() {
	return (
		<div className="mb-16 flex animate-[fadeIn_0.5s_ease-out] flex-col items-center gap-6">
			<div className="relative">
				<div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 shadow-[0_25px_50px_-12px_hsl(var(--primary)/0.4)]">
					<Wallet className="h-10 w-10 text-white" />
				</div>
				<div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-background bg-[oklch(0.7_0.2_145)]" />
			</div>
			<div className="flex flex-col items-center gap-2">
				<h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-2xl font-bold tracking-tight [-webkit-background-clip:text]">
					Imanisa
				</h1>
				<p className="text-lg text-muted-foreground">Finance familiale</p>
			</div>
		</div>
	)
}
