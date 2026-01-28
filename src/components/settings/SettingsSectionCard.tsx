import { Card, type LucideIcon } from '@/components';
import type { ReactNode } from 'react';

interface SettingsSectionCardProps {
	icon: LucideIcon;
	title: string;
	description?: string;
	action?: ReactNode;
	children: ReactNode;
}

/**
 * Card wrapper for a settings section with icon header
 */
export function SettingsSectionCard({
	icon: Icon,
	title,
	description,
	action,
	children,
}: SettingsSectionCardProps) {
	return (
		<Card padding="lg">
			<div className="flex flex-col gap-4">
				<div className="flex justify-between items-center pb-2">
					<div className="flex items-center gap-4">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
							<Icon className="h-5 w-5" />
						</div>
						<div className="flex flex-col">
							<h3 className="text-lg font-medium tracking-tight">{title}</h3>
							{description && <p className="text-sm text-muted-foreground">{description}</p>}
						</div>
					</div>
					{action}
				</div>
				{children}
			</div>
		</Card>
	);
}
