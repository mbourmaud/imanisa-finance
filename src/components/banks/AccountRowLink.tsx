import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from '@/components';
import { MoneyDisplay } from '@/components/common/MoneyDisplay';

interface AccountRowLinkProps {
	accountId: string;
	name: string;
	badge: ReactNode;
	memberAvatars?: ReactNode;
	balance: number;
}

/**
 * Clickable account row with balance display
 */
export function AccountRowLink({
	accountId,
	name,
	badge,
	memberAvatars,
	balance,
}: AccountRowLinkProps) {
	return (
		<Link
			href={`/dashboard/accounts/${accountId}`}
			className="flex items-center justify-between rounded-lg border border-border/40 bg-card p-3 transition-colors hover:bg-accent"
		>
			<div className="flex gap-2">
				<div className="flex flex-col gap-1">
					<div className="flex gap-2 items-center">
						<span className="text-sm font-medium">{name}</span>
						{badge}
					</div>
					{memberAvatars && <div className="mt-1.5">{memberAvatars}</div>}
				</div>
			</div>
			<div className="flex gap-2 items-center">
				<MoneyDisplay
					amount={balance}
					className={cn(
						'text-sm font-semibold',
						balance > 0 && 'value-positive',
						balance < 0 && 'value-negative',
						balance === 0 && 'text-muted-foreground',
					)}
				/>
				<ChevronRight className="h-4 w-4 text-muted-foreground" />
			</div>
		</Link>
	);
}
