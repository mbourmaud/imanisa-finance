import type { ReactNode } from 'react';
import { Card, ListHeader } from '@/components';

interface TransactionListContainerProps {
	title: string;
	subtitle: string;
	children: ReactNode;
}

/**
 * Container for transaction list with header
 */
export function TransactionListContainer({
	title,
	subtitle,
	children,
}: TransactionListContainerProps) {
	return (
		<Card className="p-0">
			<ListHeader title={title} subtitle={subtitle} />
			<div className="flex flex-col gap-1 p-4">{children}</div>
		</Card>
	);
}
