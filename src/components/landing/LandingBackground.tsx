/**
 * Landing page background with animated gradient blobs
 */
export function LandingBackground() {
	return (
		<div className="absolute inset-0 -z-10 overflow-hidden">
			<div className="absolute -right-40 -top-40 h-[500px] w-[500px] animate-pulse rounded-full bg-primary/10 blur-[64px]" />
			<div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] animate-pulse rounded-full bg-[oklch(0.6_0.2_280/0.1)] blur-[64px] [animation-delay:1s]" />
			<div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[64px]" />
		</div>
	)
}
