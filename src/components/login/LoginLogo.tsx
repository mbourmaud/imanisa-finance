import { Wallet } from '@/components'

/**
 * Login page logo with smaller margin than landing
 */
export function LoginLogo() {
	return (
		<div className="mb-6 flex flex-col items-center gap-6">
			<div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-lg">
				<Wallet className="h-10 w-10 text-white" />
			</div>
			<div className="flex flex-col items-center gap-2">
				<h1 className="text-2xl font-bold tracking-tight">
					Imanisa
				</h1>
				<p className="text-lg text-muted-foreground">Finance familiale</p>
			</div>
		</div>
	)
}
