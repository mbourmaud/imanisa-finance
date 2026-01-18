/**
 * Auth error page background with warning-colored gradient blobs
 */
export function AuthErrorBackground() {
	return (
		<div className="absolute inset-0 -z-10 overflow-hidden">
			<div className="absolute -right-40 -top-40 h-[500px] w-[500px] animate-pulse rounded-full bg-[oklch(0.5_0.2_25/0.1)] blur-[64px]" />
			<div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] animate-pulse rounded-full bg-[oklch(0.6_0.2_40/0.1)] blur-[64px] [animation-delay:1s]" />
		</div>
	)
}
