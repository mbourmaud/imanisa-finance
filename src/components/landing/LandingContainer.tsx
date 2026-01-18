import { ReactNode } from 'react'

interface LandingContainerProps {
	children: ReactNode
}

/**
 * Landing page container with centered content and gradient background
 */
export function LandingContainer({ children }: LandingContainerProps) {
	return (
		<div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-6">
			{children}
		</div>
	)
}
