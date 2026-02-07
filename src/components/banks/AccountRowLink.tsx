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
			className="flex items-center gap-3 rounded-lg px-3 py-2.5 -mx-1 transition-colors hover:bg-accent/60"
		>
			<div className="flex min-w-0 flex-1 items-center gap-2">
				<span className="text-sm font-medium truncate">{name}</span>
				{badge}
				{memberAvatars && <div className="hidden sm:block">{memberAvatars}</div>}
			</div>
			<div className="flex shrink-0 items-center gap-1.5">
				<MoneyDisplay
					amount={balance}
					className={cn(
						'text-sm font-medium tabular-nums',
						balance > 0 && 'value-positive',
						balance < 0 && 'value-negative',
						balance === 0 && 'text-muted-foreground',
					)}
				/>
				<ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
			</div>
		</Link>
	);
}
