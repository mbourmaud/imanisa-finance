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
			className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-card p-2.5 transition-colors hover:bg-accent sm:p-3"
		>
			<div className="flex min-w-0 flex-1 flex-col gap-1">
				<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
					<span className="text-sm font-medium truncate max-w-[140px] sm:max-w-none">{name}</span>
					{badge}
				</div>
				{memberAvatars && <div className="mt-0.5">{memberAvatars}</div>}
			</div>
			<div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
				<MoneyDisplay
					amount={balance}
					className={cn(
						'text-sm font-semibold tabular-nums',
						balance > 0 && 'value-positive',
						balance < 0 && 'value-negative',
						balance === 0 && 'text-muted-foreground',
					)}
				/>
				<ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
			</div>
		</Link>
	);
}
