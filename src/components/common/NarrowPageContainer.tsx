import type { ReactNode } from 'react'

interface NarrowPageContainerProps {
	children: ReactNode
}

/**
 * Container for pages that should be narrower than the full width.
 * Used for pages like banks/settings that work better with limited width.
 */
export function NarrowPageContainer({ children }: NarrowPageContainerProps) {
	return <div className="max-w-4xl">{children}</div>
}
