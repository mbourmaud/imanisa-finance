import type { ReactNode } from 'react'

interface RootBodyProps {
	children: ReactNode
	fontClasses: string
}

/**
 * Root body element with font classes.
 * Extracts className from layout.tsx to maintain "zero className in pages" rule.
 */
export function RootBody({ children, fontClasses }: RootBodyProps) {
	return <body className={`${fontClasses} antialiased`}>{children}</body>
}
