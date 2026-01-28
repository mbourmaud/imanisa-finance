interface PropertyBadgeProps {
	children: React.ReactNode;
}

/**
 * Badge for property type/usage/owner display
 */
export function PropertyBadge({ children }: PropertyBadgeProps) {
	return (
		<span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
			{children}
		</span>
	);
}
