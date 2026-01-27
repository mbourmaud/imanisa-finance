import type { LucideIcon } from '@/components';

interface PropertyInfoItemProps {
	icon: LucideIcon;
	label: string;
	value: string | number | null;
}

/**
 * Info item with icon and label
 */
export function PropertyInfoItem({ icon: Icon, label, value }: PropertyInfoItemProps) {
	return (
		<div className="flex flex-col items-center">
			<div className="flex gap-1 text-muted-foreground">
				<Icon className="h-3.5 w-3.5" />
				<span className="text-xs">{label}</span>
			</div>
			<span className="mt-1 font-medium">{value ?? '-'}</span>
		</div>
	);
}
