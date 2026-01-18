interface PropertyFormGridProps {
	children: React.ReactNode
	columns?: 2 | 3
}

/**
 * Grid layout for property form fields
 */
export function PropertyFormGrid({ children, columns = 2 }: PropertyFormGridProps) {
	const gridClass = columns === 3 ? 'grid-cols-3' : 'grid-cols-2'
	return <div className={`grid ${gridClass} gap-4`}>{children}</div>
}
