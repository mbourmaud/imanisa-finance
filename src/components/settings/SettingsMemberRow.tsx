import type { ReactNode } from 'react';
import { Button, Pencil, Trash2 } from '@/components';

interface SettingsMemberRowProps {
	avatar: ReactNode;
	name: string;
	accountCount: number;
	onEdit: () => void;
	onDelete: () => void;
	editDialog?: ReactNode;
}

/**
 * Row displaying a household member with edit/delete actions
 */
export function SettingsMemberRow({
	avatar,
	name,
	accountCount,
	onEdit,
	onDelete,
	editDialog,
}: SettingsMemberRowProps) {
	return (
		<div className="flex justify-between items-center rounded-xl bg-background/50 p-4 transition-colors">
			<div className="flex items-center gap-4">
				{avatar}
				<div className="flex flex-col">
					<p className="font-medium">{name}</p>
					<p className="text-xs text-muted-foreground">
						{accountCount} compte{accountCount !== 1 ? 's' : ''}
					</p>
				</div>
			</div>
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
					<Pencil className="h-4 w-4" />
				</Button>
				<Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}>
					<Trash2 className="h-4 w-4" />
				</Button>
				{editDialog}
			</div>
		</div>
	);
}
